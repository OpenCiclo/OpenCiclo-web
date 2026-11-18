// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/**
 * `code` of the 404 that /api/auth/verify answers when a correctly signed key
 * has no account and the request brings no first diary to create one with.
 * Only the holder of the key can get it: the signature is checked first.
 */
export const NO_ACCOUNT_CODE = "no-account";

/**
 * `code` of the 426 any API route answers when the request comes from an
 * Android build older than the host supports (`MIN_ANDROID_VERSION_CODE`).
 * The app then shows "Update Ciclo" and opens the diary read-only.
 */
export const UPGRADE_REQUIRED_CODE = "upgrade-required";

/**
 * `code` of the 409 DELETE /api/account answers when it was asked to delete
 * only at a vault version (`?baseVersion=`) and the vault has moved on: another
 * device saved, so deleting would lose that save.
 */
export const VAULT_CHANGED_CODE = "vault-changed";
