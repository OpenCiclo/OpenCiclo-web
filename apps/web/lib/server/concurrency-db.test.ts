// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import * as schema from "@/lib/db/schema";
import { testDatabaseUrl, type TestDb } from "@/lib/db/test-db";
import { emailLookup } from "@/lib/server/env";
import { MAILBOX_CODE_MAX_ATTEMPTS } from "@/lib/server/mailbox";

import { confirmPendingMailbox, startPendingMailbox } from "./mailbox-store";
import { takeLimits } from "./rate-limit";

// Parallel requests need separate connections and committed rows, so these
// tests cannot use a rolled-back transaction. They write to the local Postgres
// only, under keys of their own, and delete what they wrote.

describe.skipIf(!testDatabaseUrl)("parallel requests against Postgres", () => {
  let client: ReturnType<typeof postgres>;
  let db: TestDb;
  const stamp = `concurrency-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
    client = postgres(testDatabaseUrl as string, { max: 10, onnotice: () => {} });
    db = drizzle(client, { schema });
  });

  afterAll(async () => {
    await db.delete(schema.rateLimitHits).where(eq(schema.rateLimitHits.keyHash, stamp));
    await db.delete(schema.accounts).where(eq(schema.accounts.pubkeyHash, stamp));
    await client.end();
    vi.unstubAllEnvs();
  });

  it("lets exactly `max` of many parallel requests through the rate limiter", async () => {
    const limit = { max: 5, windowMs: 60_000 };
    const results = await Promise.all(
      Array.from({ length: 20 }, () => takeLimits(db, [{ bucket: "test-parallel", keyHash: stamp, limit }])),
    );
    expect(results.filter(Boolean)).toHaveLength(5);
    const rows = await db.select().from(schema.rateLimitHits).where(eq(schema.rateLimitHits.keyHash, stamp));
    expect(rows).toHaveLength(5);
  });

  it("records nothing when one of several limits is full", async () => {
    const full = { max: 0, windowMs: 60_000 };
    const open = { max: 100, windowMs: 60_000 };
    const allowed = await takeLimits(db, [
      { bucket: "test-open", keyHash: stamp, limit: open },
      { bucket: "test-full", keyHash: stamp, limit: full },
    ]);
    expect(allowed).toBe(false);
    const rows = await db.select().from(schema.rateLimitHits).where(eq(schema.rateLimitHits.bucket, "test-open"));
    expect(rows.filter((row) => row.keyHash === stamp)).toHaveLength(0);
  });

  it("gives parallel guesses at a code only the attempts it allows", async () => {
    const [account] = await db
      .insert(schema.accounts)
      .values({ pubkeyHash: stamp, pubkey: "pub", ciphertext: "ct", nonce: "n", schemaVersion: 6 })
      .returning({ id: schema.accounts.id });
    await startPendingMailbox(db, {
      accountId: account.id,
      lookup: emailLookup(`${stamp}@example.test`),
      kit: {
        wrappedSecret: "d3JhcHBlZA==",
        wrapNonce: "bm9uY2U=",
        wrapSalt: "c2FsdA==",
        wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
      },
      code: "123456",
    });
    const guesses = Array.from({ length: 30 }, (_, index) => String(200000 + index));
    const outcomes = await Promise.all(guesses.map((guess) => confirmPendingMailbox(db, account.id, guess)));
    expect(outcomes.filter((outcome) => outcome === "wrong")).toHaveLength(MAILBOX_CODE_MAX_ATTEMPTS);
    expect(outcomes.filter((outcome) => outcome === "no-attempt")).toHaveLength(30 - MAILBOX_CODE_MAX_ATTEMPTS);
    expect(await confirmPendingMailbox(db, account.id, "123456")).toBe("no-attempt");
  });
});
