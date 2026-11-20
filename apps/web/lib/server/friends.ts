// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The host side of Friends (drizzle/0008_friends.sql). The host stores sealed
// blobs it cannot open:
//
// - friend_books: one per account, compare-and-set on `version` like the vault.
// - friend_boxes: addressed by SHA-256 of an id only two devices can derive,
//   replaced or deleted only with the write token whose SHA-256 is stored.
//   No account column: nothing here may record who wrote or read a box.

import { sha256 } from "@noble/hashes/sha2.js";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { bytesToHex, utf8ToBytes } from "@/lib/crypto/bytes";
import type * as schema from "@/lib/db/schema";
import { friendBooks, friendBoxes } from "@/lib/db/schema";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { jsonError } from "@/lib/server/env";
import {
  BOX_CIPHERTEXT_LENGTH,
  BOX_KEY_PATTERN,
  BOX_TTL_DAYS,
  MAX_BOOK_CIPHERTEXT_LENGTH,
  NONCE_LENGTH,
  type BoxKind,
} from "@/lib/friends/limits";

type Db = PostgresJsDatabase<typeof schema>;

/** 404 while Friends is not available (lib/features.ts): nothing is stored then. */
export function friendsUnavailable(): Response | null {
  return FRIENDS_AVAILABLE ? null : jsonError("Not found", 404);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export type SealedBlob = { ciphertext: string; nonce: string };

/** SHA-256 of a hex id or token, as hex: what the host stores instead of the value. */
export function boxHash(value: string): string {
  return bytesToHex(sha256(utf8ToBytes(value)));
}

/** When a box of this kind written `now` may be dropped: rounded up to a whole week. */
export function boxExpiry(kind: BoxKind, now: Date): Date {
  const due = now.getTime() + BOX_TTL_DAYS[kind] * DAY_MS;
  return new Date(Math.ceil(due / WEEK_MS) * WEEK_MS);
}

export function isBoxKey(value: unknown): value is string {
  return typeof value === "string" && BOX_KEY_PATTERN.test(value);
}

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** A box body: exactly the fixed lengths every box has. */
export function isSealedBox(ciphertext: unknown, nonce: unknown): boolean {
  return (
    typeof ciphertext === "string" &&
    typeof nonce === "string" &&
    ciphertext.length === BOX_CIPHERTEXT_LENGTH &&
    nonce.length === NONCE_LENGTH &&
    BASE64.test(ciphertext) &&
    BASE64.test(nonce)
  );
}

/** A friend book body: within the cap, base64. */
export function isSealedBook(ciphertext: unknown, nonce: unknown): boolean {
  return (
    typeof ciphertext === "string" &&
    typeof nonce === "string" &&
    ciphertext.length > 0 &&
    ciphertext.length <= MAX_BOOK_CIPHERTEXT_LENGTH &&
    nonce.length === NONCE_LENGTH &&
    BASE64.test(ciphertext) &&
    BASE64.test(nonce)
  );
}

export async function readFriendBook(db: Db, accountId: string) {
  const rows = await db
    .select({ ciphertext: friendBooks.ciphertext, nonce: friendBooks.nonce, version: friendBooks.version })
    .from(friendBooks)
    .where(eq(friendBooks.accountId, accountId))
    .limit(1);
  return rows[0] ?? null;
}

export type BookWriteResult =
  | { ok: true; version: number }
  | { ok: false; current: (SealedBlob & { version: number }) | null };

/**
 * Saves the friend book on top of `baseVersion`: 0 creates it (only if there is
 * none), any other number replaces it only while the stored version matches.
 * Otherwise the current book comes back (null when there is none) to apply the
 * same change to.
 */
export async function writeFriendBook(
  db: Db,
  accountId: string,
  blob: SealedBlob,
  baseVersion: number,
): Promise<BookWriteResult> {
  const written =
    baseVersion === 0
      ? await db
          .insert(friendBooks)
          .values({ accountId, ciphertext: blob.ciphertext, nonce: blob.nonce, version: 1 })
          .onConflictDoNothing({ target: friendBooks.accountId })
          .returning({ version: friendBooks.version })
      : await db
          .update(friendBooks)
          .set({
            ciphertext: blob.ciphertext,
            nonce: blob.nonce,
            version: sql`${friendBooks.version} + 1`,
            updatedAt: new Date(),
          })
          .where(and(eq(friendBooks.accountId, accountId), eq(friendBooks.version, baseVersion)))
          .returning({ version: friendBooks.version });
  if (written[0]) return { ok: true, version: written[0].version };
  return { ok: false, current: await readFriendBook(db, accountId) };
}

export async function deleteFriendBook(db: Db, accountId: string): Promise<void> {
  await db.delete(friendBooks).where(eq(friendBooks.accountId, accountId));
}

/** The boxes that exist and have not expired, by the id the caller asked with. */
export async function readBoxes(db: Db, ids: string[], now = new Date()): Promise<Record<string, SealedBlob>> {
  if (ids.length === 0) return {};
  const byHash = new Map(ids.map((id) => [boxHash(id), id]));
  const rows = await db
    .select({ boxHash: friendBoxes.boxHash, ciphertext: friendBoxes.ciphertext, nonce: friendBoxes.nonce })
    .from(friendBoxes)
    .where(and(inArray(friendBoxes.boxHash, [...byHash.keys()]), gt(friendBoxes.expiresAt, now)));
  const found: Record<string, SealedBlob> = {};
  for (const row of rows) {
    const id = byHash.get(row.boxHash);
    if (id) found[id] = { ciphertext: row.ciphertext, nonce: row.nonce };
  }
  return found;
}

/** Whether a box (expired or not) is stored at this id: a write there replaces, it does not create. */
export async function boxExists(db: Db, id: string): Promise<boolean> {
  const rows = await db
    .select({ boxHash: friendBoxes.boxHash })
    .from(friendBoxes)
    .where(eq(friendBoxes.boxHash, boxHash(id)))
    .limit(1);
  return rows.length > 0;
}

/**
 * Writes a box: creates it when there is none, replaces it when `token` is the
 * one it was created with (also after it expired, which revives it), and
 * otherwise changes nothing ("conflict": someone else holds this address).
 * Another token never takes over an address, expired or not, until the
 * cleanup has removed the row.
 */
export async function putBox(
  db: Db,
  box: { id: string; token: string; kind: BoxKind } & SealedBlob,
  now = new Date(),
): Promise<"written" | "conflict"> {
  const writeHash = boxHash(box.token);
  const rows = await db
    .insert(friendBoxes)
    .values({
      boxHash: boxHash(box.id),
      writeHash,
      ciphertext: box.ciphertext,
      nonce: box.nonce,
      expiresAt: boxExpiry(box.kind, now),
    })
    .onConflictDoUpdate({
      target: friendBoxes.boxHash,
      set: {
        writeHash,
        ciphertext: box.ciphertext,
        nonce: box.nonce,
        expiresAt: boxExpiry(box.kind, now),
      },
      setWhere: eq(friendBoxes.writeHash, writeHash),
    })
    .returning({ boxHash: friendBoxes.boxHash });
  return rows.length > 0 ? "written" : "conflict";
}

/** Deletes the boxes whose token matches. Others (wrong token, already gone) are left as they are. */
export async function deleteBoxes(db: Db, items: { id: string; token: string }[]): Promise<number> {
  let deleted = 0;
  for (const item of items) {
    const rows = await db
      .delete(friendBoxes)
      .where(and(eq(friendBoxes.boxHash, boxHash(item.id)), eq(friendBoxes.writeHash, boxHash(item.token))))
      .returning({ boxHash: friendBoxes.boxHash });
    deleted += rows.length;
  }
  return deleted;
}
