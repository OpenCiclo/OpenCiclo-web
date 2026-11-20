// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Sizes and caps shared by the device (lib/friends/*, lib/client/friends-*)
// and the host (lib/server/friends.ts, app/api/friends/**). The two CHECK
// constraints in drizzle/0008_friends.sql repeat the ciphertext lengths;
// lib/friends/limits.test.ts keeps them equal.

/** Every box plaintext is padded to exactly this many bytes, so no kind or length shows. */
export const BOX_PLAINTEXT_BYTES = 2048;

/** base64 length of an AES-GCM ciphertext (plaintext + 16-byte tag) of `bytes` bytes. */
export function sealedBase64Length(bytes: number): number {
  return Math.ceil((bytes + 16) / 3) * 4;
}

/** Every box ciphertext has exactly this length (2752). */
export const BOX_CIPHERTEXT_LENGTH = sealedBase64Length(BOX_PLAINTEXT_BYTES);

/** base64 of a 12-byte AES-GCM nonce. */
export const NONCE_LENGTH = 16;

/** The friend book plaintext is padded up to a multiple of this, at most MAX_BOOK_PLAINTEXT_BYTES. */
export const BOOK_PAD_STEP_BYTES = 4096;
export const MAX_BOOK_PLAINTEXT_BYTES = 8 * BOOK_PAD_STEP_BYTES;

/** The largest friend book ciphertext the host takes (43712). */
export const MAX_BOOK_CIPHERTEXT_LENGTH = sealedBase64Length(MAX_BOOK_PLAINTEXT_BYTES);

/** Box ids and write tokens: 32 bytes, as 64 lowercase hex characters. */
export const BOX_KEY_PATTERN = /^[0-9a-f]{64}$/;

/** Most ids one read may ask for. */
export const MAX_BOX_READ = 50;

/** Most boxes one delete may name. */
export const MAX_BOX_DELETE = 50;

export const MAX_FRIENDS = 20;
export const MAX_PENDING_INVITES = 5;
export const MAX_NAME_LENGTH = 40;
export const MAX_NOTE_LENGTH = 140;

/**
 * How long each kind of box lives, in days, before the host may drop it. The
 * host rounds the expiry up to a whole week, so the stored time says little
 * about when the box was written, and a box can live up to 7 days more. The
 * privacy policy promises at most 7 weeks (MAX_BOX_LIFE_DAYS): keep every
 * value plus 7 within it (limits.test.ts checks).
 */
export const BOX_TTL_DAYS = {
  invite: 7,
  handshake: 30,
  status: 42,
} as const;

/** The longest any box may live, rounding included, as the privacy policy says ("7 weeks"). */
export const MAX_BOX_LIFE_DAYS = 49;

export type BoxKind = keyof typeof BOX_TTL_DAYS;

export const BOX_KINDS = Object.keys(BOX_TTL_DAYS) as BoxKind[];
