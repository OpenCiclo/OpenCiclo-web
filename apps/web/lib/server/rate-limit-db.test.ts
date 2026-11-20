// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { mailboxPending, rateLimitHits } from "@/lib/db/schema";
import { inRolledBackTransaction, insertTestAccount, testDatabaseUrl } from "@/lib/db/test-db";

import {
  ipLimitSubject,
  limitKey,
  pruneEphemeralRows,
  RATE_LIMITS,
  sourceKey,
  takeRateLimit,
  takeRateLimits,
} from "./rate-limit";

describe("rate limit keys", () => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("never store the raw account id or email lookup, and differ by kind", () => {
    const id = "6f1c2b9e-0000-4000-8000-000000000000";
    expect(limitKey("account", id)).toMatch(/^[0-9a-f]{64}$/);
    expect(limitKey("account", id)).not.toContain(id);
    expect(limitKey("account", id)).not.toBe(limitKey("email", id));
  });

  it("leave room for people who share an IP and for autosave", () => {
    expect(RATE_LIMITS["account-create"].max).toBeGreaterThanOrEqual(100);
    expect(RATE_LIMITS["vault-write"].max).toBeGreaterThanOrEqual(300);
  });

  it("bound code guessing for one address: 6 codes a day, 5 attempts each", () => {
    expect(RATE_LIMITS["code-send-email-day"]).toMatchObject({ max: 6, alert: true });
    expect(RATE_LIMITS["code-send-global"]).toMatchObject({ max: 1000, alert: true });
  });
});

describe("per-IP limit subject", () => {
  it("keeps IPv4 addresses as they are", () => {
    expect(ipLimitSubject("203.0.113.7")).toBe("203.0.113.7");
    expect(ipLimitSubject(" 203.0.113.7 ")).toBe("203.0.113.7");
    expect(ipLimitSubject("local")).toBe("local");
  });

  it("counts every address of an IPv6 /64 as one client, however it is written", () => {
    const subject = "2001:db8:85a3:42::/64";
    for (const ip of [
      "2001:db8:85a3:42::1",
      "2001:0db8:85a3:0042:ffff:ffff:ffff:fffe",
      "2001:DB8:85A3:42:1234:5678:9abc:def0",
      "[2001:db8:85a3:42::abcd]",
      "2001:db8:85a3:42::1%eth0",
    ]) {
      expect(ipLimitSubject(ip), ip).toBe(subject);
    }
    expect(ipLimitSubject("2001:db8:85a3:43::1")).toBe("2001:db8:85a3:43::/64");
    expect(ipLimitSubject("::1")).toBe("0:0:0:0::/64");
    expect(ipLimitSubject("fe80::1")).toBe("fe80:0:0:0::/64");
  });

  it("reads an IPv4-mapped IPv6 address as its IPv4 address", () => {
    expect(ipLimitSubject("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(ipLimitSubject("::ffff:cb00:7107")).toBe("203.0.113.7");
  });

  it("keeps something unreadable as it is (still hashed before storage)", () => {
    expect(ipLimitSubject("2001:db8::1::2")).toBe("2001:db8::1::2");
    expect(ipLimitSubject("1:2:3:4:5:6:7:8:9")).toBe("1:2:3:4:5:6:7:8:9");
  });

  it("gives addresses of one /64 the same key", () => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
    const request = (ip: string) => new Request("https://ciclo.test/api/x", { headers: { "x-forwarded-for": ip } });
    expect(sourceKey(request("2001:db8:1:2::a"))).toBe(sourceKey(request("2001:db8:1:2:ffff::b")));
    expect(sourceKey(request("2001:db8:1:2::a"))).not.toBe(sourceKey(request("2001:db8:1:3::a")));
    vi.unstubAllEnvs();
  });
});

describe.skipIf(!testDatabaseUrl)("rate limits against Postgres", () => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("counts within the window and refuses once full, recording nothing then", async () => {
    await inRolledBackTransaction(async (db) => {
      const key = `rl-test-${Math.random().toString(16).slice(2)}`;
      const { max, windowMs } = RATE_LIMITS["code-send-email"];
      const start = new Date();
      for (let hit = 0; hit < max; hit += 1) {
        expect(await takeRateLimit(db, "code-send-email", key, start)).toBe(true);
      }
      expect(await takeRateLimit(db, "code-send-email", key, start)).toBe(false);
      const rows = await db.select().from(rateLimitHits).where(eq(rateLimitHits.keyHash, key));
      expect(rows).toHaveLength(max);
      // Once the window has passed, the old hits no longer count.
      expect(await takeRateLimit(db, "code-send-email", key, new Date(start.getTime() + windowMs + 1000))).toBe(true);
    });
  });

  it("logs a refusal by an alerting budget with a stable code, and nothing else", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await inRolledBackTransaction(async (db) => {
        const key = `rl-alert-${Math.random().toString(16).slice(2)}`;
        const now = new Date();
        for (let hit = 0; hit < RATE_LIMITS["code-send-email-day"].max; hit += 1) {
          expect(
            await takeRateLimits(db, [{ bucket: "code-send-email-day", keyHash: key }], new Date(now.getTime() + hit)),
          ).toBe(true);
        }
        expect(warn).not.toHaveBeenCalled();
        const refused = await takeRateLimits(
          db,
          [
            { bucket: "recovery-register", keyHash: key },
            { bucket: "code-send-email-day", keyHash: key },
          ],
          now,
        );
        expect(refused).toBe(false);
        expect(warn.mock.calls).toEqual([["RATE_LIMIT_REFUSED code-send-email-day"]]);
        // All or nothing: the per-IP bucket recorded nothing either.
        const rows = await db.select().from(rateLimitHits).where(eq(rateLimitHits.keyHash, key));
        expect(rows.filter((row) => row.bucket === "recovery-register")).toEqual([]);
      });
    } finally {
      warn.mockRestore();
    }
  });

  it("prunes expired pending confirmations and keeps live ones", async () => {
    await inRolledBackTransaction(async (db) => {
      const account = await insertTestAccount(db, "prune");
      const other = await insertTestAccount(db, "prune-live");
      const now = new Date();
      const pending = (accountId: string, lookup: string, expiresAt: Date) => ({
        emailLookup: lookup,
        accountId,
        wrappedSecret: "w",
        wrapNonce: "n",
        wrapSalt: "s",
        wrapParams: { kdf: "pbkdf2-sha256", iterations: 600000, hash: "SHA-256" },
        codeHash: "h",
        expiresAt,
      });
      const stamp = Math.random().toString(16).slice(2);
      await db.insert(mailboxPending).values([
        pending(account.id, `expired-${stamp}`, new Date(now.getTime() - 1000)),
        pending(other.id, `live-${stamp}`, new Date(now.getTime() + 60_000)),
      ]);
      await pruneEphemeralRows(db, now);
      expect(await db.select().from(mailboxPending).where(eq(mailboxPending.accountId, account.id))).toEqual([]);
      expect(await db.select().from(mailboxPending).where(eq(mailboxPending.accountId, other.id))).toHaveLength(1);
    });
  });
});
