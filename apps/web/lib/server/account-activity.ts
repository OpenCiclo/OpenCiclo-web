// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { parseConsoleEmails } from "@/lib/console/emails";
import type * as schema from "@/lib/db/schema";
import { accountActivityDays, accounts, recoveryMailboxes } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { emailLookup } from "@/lib/server/env";
import { describeError } from "@/lib/server/http";

type Db = PostgresJsDatabase<typeof schema>;

export function consoleAdminLookups(raw = process.env.CONSOLE_EMAILS): string[] {
  try {
    return parseConsoleEmails(raw).map((email) => emailLookup(email));
  } catch {
    return [];
  }
}

/** Accounts whose verified mailbox is in CONSOLE_EMAILS. The console leaves them out of its counts. */
export async function consoleAdminAccountIds(): Promise<string[]> {
  const lookups = consoleAdminLookups();
  if (lookups.length === 0) return [];
  const db = getDb();
  const rows = await db
    .select({ accountId: recoveryMailboxes.accountId })
    .from(recoveryMailboxes)
    .where(
      and(isNotNull(recoveryMailboxes.verifiedAt), inArray(recoveryMailboxes.emailLookup, lookups)),
    );
  return [...new Set(rows.map((row) => row.accountId))];
}

/**
 * Notes that this account opened the app today (UTC): one row per account per
 * day, in one statement. Called after the response, on sign-in and on
 * `GET /api/vault` (the app's start). Operators are counted here too; the
 * console leaves them out when it reads (`consoleAdminAccountIds`).
 */
export async function recordAccountOpen(db: Db, pubkeyHash: string, now = new Date()): Promise<void> {
  try {
    const day = now.toISOString().slice(0, 10);
    await db
      .insert(accountActivityDays)
      .select(
        db
          .select({ accountId: accounts.id, day: sql<string>`${day}::date`.as("day") })
          .from(accounts)
          .where(eq(accounts.pubkeyHash, pubkeyHash)),
      )
      .onConflictDoNothing();
  } catch (error) {
    // Never fails the request it follows (and 0004_account_activity.sql may be missing on a fresh host).
    console.error(`Recording account activity failed: ${describeError(error)}`);
  }
}
