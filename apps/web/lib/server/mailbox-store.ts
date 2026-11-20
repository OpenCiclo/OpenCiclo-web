// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, gt, gte, lt, lte, or, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { mailboxPending, recoveryMailboxes } from "@/lib/db/schema";
import {
  hashMailboxCode,
  MAILBOX_CODE_MAX_ATTEMPTS,
  MAILBOX_CODE_TTL_MS,
  mailboxCodesEqual,
  mailboxRegisterAction,
  type MailboxKit,
  type MailboxRegisterAction,
  parseMailboxCode,
} from "@/lib/server/mailbox";

type Db = PostgresJsDatabase<typeof schema>;

/** What `POST /api/recovery/register` does with this address for this account. */
export async function findRegisterAction(
  db: Db,
  lookup: string,
  accountId: string,
): Promise<{ action: MailboxRegisterAction; verifiedAt: Date | null }> {
  const rows = await db
    .select({ accountId: recoveryMailboxes.accountId, verifiedAt: recoveryMailboxes.verifiedAt })
    .from(recoveryMailboxes)
    .where(eq(recoveryMailboxes.emailLookup, lookup))
    .limit(1);
  const existing = rows[0] ?? null;
  return {
    action: mailboxRegisterAction({ existingMailbox: existing, accountId }),
    verifiedAt: existing?.verifiedAt ?? null,
  };
}

/**
 * Starts a confirmation: drops any pending one for this address or this account
 * and stores the kit with the hash of `code`. Register calls this the same way
 * for a new address and for one another account already holds (with a code
 * nobody is ever sent), so `/api/recovery/confirm` behaves the same afterwards
 * and cannot tell the two apart.
 */
export async function startPendingMailbox(
  db: Db,
  args: { accountId: string; lookup: string; kit: MailboxKit; code: string; now?: Date },
): Promise<void> {
  const now = args.now ?? new Date();
  const row = {
    accountId: args.accountId,
    wrappedSecret: args.kit.wrappedSecret,
    wrapNonce: args.kit.wrapNonce,
    wrapSalt: args.kit.wrapSalt,
    wrapParams: args.kit.wrapParams,
    codeHash: hashMailboxCode(args.code),
    expiresAt: new Date(now.getTime() + MAILBOX_CODE_TTL_MS),
    attemptCount: 0,
    createdAt: now,
  };
  await db
    .delete(mailboxPending)
    .where(or(eq(mailboxPending.emailLookup, args.lookup), eq(mailboxPending.accountId, args.accountId)));
  // Another request may have started one for this address in between.
  await db
    .insert(mailboxPending)
    .values({ emailLookup: args.lookup, ...row })
    .onConflictDoUpdate({ target: mailboxPending.emailLookup, set: row });
}

/**
 * "confirmed": the mailbox is stored. "wrong": an attempt was used and the code
 * did not match (or the address was taken in the meantime). "no-attempt":
 * nothing to try (no pending code, expired, or its attempts are used up). The
 * route answers the same 400 for the last two.
 */
export type ConfirmOutcome = "confirmed" | "wrong" | "no-attempt";

/**
 * Checks a 6-digit code for the account's pending confirmation and, if it
 * matches, stores the verified mailbox. Each call first claims one attempt in a
 * single UPDATE (`attempt_count < max`), so parallel guesses each use one up;
 * the row goes once the attempts are used or the code expired.
 */
export async function confirmPendingMailbox(
  db: Db,
  accountId: string,
  rawCode: unknown,
  now = new Date(),
): Promise<ConfirmOutcome> {
  const claimed = await db
    .update(mailboxPending)
    .set({ attemptCount: sql`${mailboxPending.attemptCount} + 1` })
    .where(
      and(
        eq(mailboxPending.accountId, accountId),
        lt(mailboxPending.attemptCount, MAILBOX_CODE_MAX_ATTEMPTS),
        gt(mailboxPending.expiresAt, now),
      ),
    )
    .returning();
  if (claimed.length === 0) {
    // Nothing left to try. Drop an expired or used-up row now.
    await db
      .delete(mailboxPending)
      .where(
        and(
          eq(mailboxPending.accountId, accountId),
          or(lte(mailboxPending.expiresAt, now), gte(mailboxPending.attemptCount, MAILBOX_CODE_MAX_ATTEMPTS)),
        ),
      );
    return "no-attempt";
  }

  const code = parseMailboxCode(rawCode);
  const codeHash = code ? hashMailboxCode(code) : null;
  const match = codeHash ? claimed.find((row) => mailboxCodesEqual(row.codeHash, codeHash)) : undefined;
  if (!match) {
    for (const row of claimed) {
      if (row.attemptCount >= MAILBOX_CODE_MAX_ATTEMPTS) {
        await db.delete(mailboxPending).where(eq(mailboxPending.id, row.id));
      }
    }
    return "wrong";
  }

  // An address verified by another account in the meantime (or a placeholder
  // row for an address that was already taken) conflicts and stores nothing.
  const inserted = await db
    .insert(recoveryMailboxes)
    .values({
      emailLookup: match.emailLookup,
      accountId,
      wrappedSecret: match.wrappedSecret,
      wrapNonce: match.wrapNonce,
      wrapSalt: match.wrapSalt,
      wrapParams: match.wrapParams,
      verifiedAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: recoveryMailboxes.id });
  await db.delete(mailboxPending).where(eq(mailboxPending.id, match.id));
  return inserted.length > 0 ? "confirmed" : "wrong";
}
