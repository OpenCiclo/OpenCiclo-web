// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/**
 * Ciphertext cap (512 KB of base64, about 380 KB of diary). The largest diary in
 * production in November 2026 was under 5,000 characters, so this is still
 * years of daily notes; it bounds what one account can store.
 */
export const MAX_VAULT_CIPHERTEXT_LENGTH = 512 * 1024;

/**
 * Cap for the vault sent when an account is created. The client sends an
 * encrypted empty diary there (well under 1 KB); real diaries arrive later
 * through PUT /api/vault. Without this, scripted sign-ups could each store
 * the full vault cap.
 */
export const MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH = 64 * 1024;

/** AES-GCM nonces are 12 bytes (16 base64 characters); allow some slack. */
export const MAX_VAULT_NONCE_LENGTH = 64;

/** Room for the JSON around a ciphertext (nonce, versions, keys) in a request body. */
export const VAULT_BODY_OVERHEAD_BYTES = 4096;

export function isValidSchemaVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 1000;
}
