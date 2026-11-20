// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { mailboxPending, recoveryMailboxes } from "@/lib/db/schema";
import { inRolledBackTransaction, insertTestAccount, testDatabaseUrl, type TestDb } from "@/lib/db/test-db";
import { emailLookup } from "@/lib/server/env";
import { generateMailboxCode, MAILBOX_CODE_MAX_ATTEMPTS, type MailboxKit } from "@/lib/server/mailbox";

import { confirmPendingMailbox, findRegisterAction, startPendingMailbox } from "./mailbox-store";

const kit: MailboxKit = {
  wrappedSecret: "d3JhcHBlZA==",
  wrapNonce: "bm9uY2U=",
  wrapSalt: "c2FsdA==",
  wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
};

/** What POST /api/recovery/register does after its limits pass (the route is a thin shell around this). */
async function register(db: TestDb, accountId: string, email: string): Promise<{ sentCode: string | null }> {
  const lookup = emailLookup(email);
  const { action } = await findRegisterAction(db, lookup, accountId);
  if (action === "update-wrap") throw new Error("not exercised here");
  const code = generateMailboxCode();
  await startPendingMailbox(db, { accountId, lookup, kit, code });
  return { sentCode: action === "start-pending" ? code : null };
}

async function pendingFor(db: TestDb, accountId: string) {
  return db
    .select({ emailLookup: mailboxPending.emailLookup, attemptCount: mailboxPending.attemptCount })
    .from(mailboxPending)
    .where(eq(mailboxPending.accountId, accountId));
}

describe.skipIf(!testDatabaseUrl)("email confirmation against Postgres", () => {
  beforeAll(() => {
    vi.stubEnv("EMAIL_LOOKUP_SECRET", "test-email-lookup-secret");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  // The audit's sequence: with an account of your own, register an address you
  // read and keep its code, then register someone else's address and confirm
  // with the first code. It used to work when that address was taken (the
  // first pending row was left alone) and fail when it was new: a way to learn
  // whether an email has an account.
  it("confirms nothing with an earlier code, whether the second address is taken or new", async () => {
    const outcomes: { outcome: string; attempts: number[] }[] = [];
    for (const victimIsTaken of [true, false]) {
      await inRolledBackTransaction(async (db) => {
        const stamp = Math.random().toString(16).slice(2);
        const attacker = await insertTestAccount(db, "attacker");
        const owner = await insertTestAccount(db, "owner");
        const victimEmail = `victim-${stamp}@example.test`;
        if (victimIsTaken) {
          await db.insert(recoveryMailboxes).values({
            emailLookup: emailLookup(victimEmail),
            accountId: owner.id,
            ...kit,
            verifiedAt: new Date(),
          });
        }

        const own = await register(db, attacker.id, `own-${stamp}@example.test`);
        expect(own.sentCode).not.toBeNull();
        const victim = await register(db, attacker.id, victimEmail);
        expect(victim.sentCode === null).toBe(victimIsTaken);

        const pending = await pendingFor(db, attacker.id);
        expect(pending).toEqual([{ emailLookup: emailLookup(victimEmail), attemptCount: 0 }]);
        const outcome = await confirmPendingMailbox(db, attacker.id, own.sentCode);
        outcomes.push({ outcome, attempts: (await pendingFor(db, attacker.id)).map((row) => row.attemptCount) });

        // The owner's mailbox is untouched, and nothing was verified for the attacker.
        const attackerMailboxes = await db
          .select({ id: recoveryMailboxes.id })
          .from(recoveryMailboxes)
          .where(eq(recoveryMailboxes.accountId, attacker.id));
        expect(attackerMailboxes).toEqual([]);
      });
    }
    // Same answer and same state left behind in both cases.
    expect(outcomes[0]).toEqual(outcomes[1]);
    expect(outcomes[0]).toEqual({ outcome: "wrong", attempts: [1] });
  });

  it("still verifies a new address with its own code, once", async () => {
    await inRolledBackTransaction(async (db) => {
      const account = await insertTestAccount(db, "signup");
      const email = `new-${Math.random().toString(16).slice(2)}@example.test`;
      const { sentCode } = await register(db, account.id, email);
      expect(await confirmPendingMailbox(db, account.id, sentCode)).toBe("confirmed");
      expect(await pendingFor(db, account.id)).toEqual([]);
      expect(await confirmPendingMailbox(db, account.id, sentCode)).toBe("no-attempt");
      const rows = await db
        .select({ accountId: recoveryMailboxes.accountId })
        .from(recoveryMailboxes)
        .where(eq(recoveryMailboxes.emailLookup, emailLookup(email)));
      expect(rows).toEqual([{ accountId: account.id }]);
    });
  });

  it("stores nothing for a taken address even with the right code", async () => {
    await inRolledBackTransaction(async (db) => {
      const owner = await insertTestAccount(db, "owner");
      const other = await insertTestAccount(db, "other");
      const lookup = emailLookup(`taken-${Math.random().toString(16).slice(2)}@example.test`);
      await db.insert(recoveryMailboxes).values({ emailLookup: lookup, accountId: owner.id, ...kit, verifiedAt: new Date() });
      await startPendingMailbox(db, { accountId: other.id, lookup, kit, code: "123456" });
      expect(await confirmPendingMailbox(db, other.id, "123456")).toBe("wrong");
      const rows = await db
        .select({ accountId: recoveryMailboxes.accountId })
        .from(recoveryMailboxes)
        .where(eq(recoveryMailboxes.emailLookup, lookup));
      expect(rows).toEqual([{ accountId: owner.id }]);
    });
  });

  it("uses up one attempt per guess and drops the code after the last one", async () => {
    await inRolledBackTransaction(async (db) => {
      const account = await insertTestAccount(db, "guess");
      const lookup = emailLookup(`guess-${Math.random().toString(16).slice(2)}@example.test`);
      await startPendingMailbox(db, { accountId: account.id, lookup, kit, code: "111111" });
      for (let attempt = 1; attempt < MAILBOX_CODE_MAX_ATTEMPTS; attempt += 1) {
        expect(await confirmPendingMailbox(db, account.id, "222222")).toBe("wrong");
        expect(await pendingFor(db, account.id)).toEqual([{ emailLookup: lookup, attemptCount: attempt }]);
      }
      expect(await confirmPendingMailbox(db, account.id, "not a code")).toBe("wrong");
      expect(await pendingFor(db, account.id)).toEqual([]);
      // The right code is useless once the attempts are gone.
      expect(await confirmPendingMailbox(db, account.id, "111111")).toBe("no-attempt");
    });
  });

  it("refuses an expired code and clears it", async () => {
    await inRolledBackTransaction(async (db) => {
      const account = await insertTestAccount(db, "expired");
      const lookup = emailLookup(`expired-${Math.random().toString(16).slice(2)}@example.test`);
      const longAgo = new Date(Date.now() - 60 * 60 * 1000);
      await startPendingMailbox(db, { accountId: account.id, lookup, kit, code: "333333", now: longAgo });
      expect(await confirmPendingMailbox(db, account.id, "333333")).toBe("no-attempt");
      expect(await pendingFor(db, account.id)).toEqual([]);
    });
  });
});
