// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, lte, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { accounts } from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

export type VaultBlob = { ciphertext: string; nonce: string; schemaVersion: number };

export type VaultWriteResult =
  | { ok: true; version: number }
  | { ok: false; current: VaultBlob & { version: number } };

/**
 * Saves the encrypted diary on top of `baseVersion`: the write only lands if
 * the stored version still matches (compare-and-set in one UPDATE); otherwise
 * the caller gets the current blob back to merge. Every client sends a base
 * version; `PUT /api/vault` refuses a save without one.
 *
 * It never lands over a diary stored with a newer format (`schemaVersion`):
 * an app build that does not know that format would have dropped what it
 * cannot read. The caller gets the current blob back instead, which that build
 * then shows read-only (lib/diary.ts, `NewerDiaryError`).
 */
export async function writeVault(
  db: Db,
  accountId: string,
  blob: VaultBlob,
  baseVersion: number,
): Promise<VaultWriteResult> {
  const notOlder = lte(accounts.schemaVersion, blob.schemaVersion);
  const updated = await db
    .update(accounts)
    .set({
      ciphertext: blob.ciphertext,
      nonce: blob.nonce,
      schemaVersion: blob.schemaVersion,
      updatedAt: new Date(),
      vaultVersion: sql`${accounts.vaultVersion} + 1`,
    })
    .where(and(eq(accounts.id, accountId), eq(accounts.vaultVersion, baseVersion), notOlder))
    .returning({ version: accounts.vaultVersion });
  if (updated[0]) return { ok: true, version: updated[0].version };

  const rows = await db
    .select({
      ciphertext: accounts.ciphertext,
      nonce: accounts.nonce,
      schemaVersion: accounts.schemaVersion,
      version: accounts.vaultVersion,
    })
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  if (!rows[0]) throw new Error("Account not found");
  return { ok: false, current: rows[0] };
}

/**
 * Deletes the account (its mailbox, pending code and activity rows go with it,
 * ON DELETE CASCADE). With `baseVersion`, only while the vault is still at that
 * version: "changed" means another device saved since, and nothing was deleted.
 * "gone" means the row was already deleted, by an earlier request whose answer
 * may have been lost: never report that as "changed", because the app removes
 * its own copy of the diary on "changed".
 */
export async function deleteAccountRow(
  db: Db,
  accountId: string,
  baseVersion: number | null,
): Promise<"deleted" | "changed" | "gone"> {
  const deleted = await db
    .delete(accounts)
    .where(
      baseVersion === null
        ? eq(accounts.id, accountId)
        : and(eq(accounts.id, accountId), eq(accounts.vaultVersion, baseVersion)),
    )
    .returning({ id: accounts.id });
  if (deleted.length > 0) return "deleted";
  const still = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, accountId)).limit(1);
  return still[0] ? "changed" : "gone";
}

/** `baseVersion` from a save request: required, a non-negative integer. */
export function parseBaseVersion(value: unknown): number | "missing" | "invalid" {
  if (value === undefined || value === null) return "missing";
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  return "invalid";
}

/** The diary blob of the account signed in with this key, and the account id. One query. */
export async function readVault(db: Db, pubkeyHash: string) {
  const rows = await db
    .select({
      id: accounts.id,
      ciphertext: accounts.ciphertext,
      nonce: accounts.nonce,
      schemaVersion: accounts.schemaVersion,
      updatedAt: accounts.updatedAt,
      version: accounts.vaultVersion,
    })
    .from(accounts)
    .where(eq(accounts.pubkeyHash, pubkeyHash))
    .limit(1);
  return rows[0] ?? null;
}
