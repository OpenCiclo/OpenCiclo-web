// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { accounts } from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

export async function accountExists(db: Db, pubkeyHash: string): Promise<boolean> {
  const rows = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.pubkeyHash, pubkeyHash))
    .limit(1);
  return rows.length > 0;
}

/**
 * Creates the account on first sign-in, in one statement. Two sign-ins for a
 * new key at once (two tabs, or StrictMode's double effect) used to both see
 * "no account" and then both insert; the second hit the unique constraint
 * and returned 500. ON CONFLICT DO NOTHING makes the loser a no-op.
 * Returns true only for the request that actually created the row.
 */
export async function createAccountIfMissing(
  db: Db,
  values: { pubkeyHash: string; pubkey: string; ciphertext: string; nonce: string; schemaVersion: number },
): Promise<boolean> {
  const inserted = await db
    .insert(accounts)
    .values(values)
    .onConflictDoNothing({ target: accounts.pubkeyHash })
    .returning({ id: accounts.id });
  return inserted.length > 0;
}
