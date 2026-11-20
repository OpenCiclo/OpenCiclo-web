// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { eq } from "drizzle-orm";

import { ACCOUNT_HEADER, ACCOUNT_MISMATCH_CODE } from "@/lib/auth-codes";
import { accounts } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { readSession } from "@/lib/server/session";

/**
 * The 409 to answer when `request` names (`x-ciclo-account`) an account other
 * than the session's, or null when it names the session's account or none
 * (builds from before the header). The session holds the same public-key hash
 * `accounts.pubkey_hash` stores (sign-in sets both from one value), so this
 * needs no database read. A plain comparison: the hash is no secret (the
 * cookie carries it in clear), and a value in another form is another account.
 */
export function accountMismatch(request: Request, sessionPubkeyHash: string): Response | null {
  const claimed = request.headers.get(ACCOUNT_HEADER);
  if (claimed === null || claimed === sessionPubkeyHash) return null;
  return Response.json(
    { error: "The session is for another account", code: ACCOUNT_MISMATCH_CODE },
    { status: 409 },
  );
}

/**
 * The signed-in account's id, or the 401/409/404 to answer. Every route that
 * changes an account calls it: a request whose `x-ciclo-account` names another
 * account gets 409 `account-mismatch` before anything else happens. That comes
 * before the lookup, so a cookie of an account deleted since still reads as
 * "another account" (the app signs in again), never 404 (which DELETE
 * /api/account counts as "already deleted"). Reads only the id: the diary blob
 * (up to 512 KB) is read by `GET /api/vault` alone.
 */
export async function requireAccount(
  request: Request,
): Promise<{ error: null; account: { id: string } } | { error: Response; account: null }> {
  const session = await readSession();
  if (!session) {
    return { error: jsonError("Not authenticated", 401), account: null };
  }
  const mismatch = accountMismatch(request, session.pubkeyHash);
  if (mismatch) {
    return { error: mismatch, account: null };
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
