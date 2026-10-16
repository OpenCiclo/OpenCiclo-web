// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/lib/db/schema";
import { accounts } from "@/lib/db/schema";

type Db = PostgresJsDatabase<typeof schema>;

export type VaultBlob = { ciphertext: string; nonce: string; schemaVersion: number };

export type VaultWriteResult =
  | { ok: true; version: number }
  | { ok: false; current: VaultBlob & { version: number } };

/**
 * Saves the encrypted diary. With `baseVersion`, the write only lands if the
 * stored version still matches (compare-and-set in one UPDATE); otherwise the
 * caller gets the current blob back to merge. Without it (clients from before
 * versioning), the write is unconditional, as before, but still bumps the
 * version so newer clients notice it.
 */
export async function writeVault(
  db: Db,
  accountId: string,
  blob: VaultBlob,
  baseVersion: number | null,
): Promise<VaultWriteResult> {
  const updated = await db
    .update(accounts)
    .set({
      ciphertext: blob.ciphertext,
      nonce: blob.nonce,
      schemaVersion: blob.schemaVersion,
      updatedAt: new Date(),
      vaultVersion: sql`${accounts.vaultVersion} + 1`,
    })
    .where(
      baseVersion === null
        ? eq(accounts.id, accountId)
        : and(eq(accounts.id, accountId), eq(accounts.vaultVersion, baseVersion)),
    )
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

export function parseBaseVersion(value: unknown): number | null | "invalid" {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  return "invalid";
}
