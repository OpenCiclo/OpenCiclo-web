// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/** Defensive ciphertext cap (~2 MB). Leaves room for years of short daily notes. */
export const MAX_VAULT_CIPHERTEXT_LENGTH = 2_000_000;

/**
 * Cap for the vault sent when an account is created. The client sends an
 * encrypted empty diary there (well under 1 KB); real diaries arrive later
 * through PUT /api/vault. Without this, scripted sign-ups could each store
 * the full 2 MB.
 */
export const MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH = 64 * 1024;

/** AES-GCM nonces are 12 bytes (16 base64 characters); allow some slack. */
export const MAX_VAULT_NONCE_LENGTH = 64;

export function isValidSchemaVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 1000;
}
