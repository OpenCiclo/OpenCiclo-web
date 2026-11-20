// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";

import { accounts } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { readSession } from "@/lib/server/session";

/**
 * The signed-in account's id, or the 401/404 to answer. Reads only the id:
 * the diary blob (up to 512 KB) is read by `GET /api/vault` alone.
 */
export async function requireAccount(): Promise<
  { error: null; account: { id: string } } | { error: Response; account: null }
> {
  const session = await readSession();
  if (!session) {
    return { error: jsonError("Not authenticated", 401), account: null };
  }
  const rows = await getDb()
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.pubkeyHash, session.pubkeyHash))
    .limit(1);
  const account = rows[0];
  if (!account) {
    return { error: jsonError("Account not found", 404), account: null };
  }
  return { error: null, account };
}
