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

/**
 * Request header naming the account a request that changes an account is meant
 * for: the public-key hash of the wallet the app has open (`Wallet.pubkeyHash`,
 * 64 lowercase hex characters, the form `accounts.pubkey_hash` and the session
 * cookie hold). The session cookie is one slot that whichever sign-in landed
 * last fills (a late sign-in on Android, another tab on the web), so it may be
 * another account's. PUT /api/vault, DELETE /api/account and POST
 * /api/recovery/register and /confirm compare it with the session's account.
 * Optional: builds and tabs from before it send none and are served as before.
 */
export const ACCOUNT_HEADER = "x-ciclo-account";

/**
 * `code` of the 409 those routes answer when `ACCOUNT_HEADER` names an account
 * other than the session's, before any write, rate limit, or mail. The app signs
 * in once with the wallet it has open and tries again; it never writes otherwise.
 */
export const ACCOUNT_MISMATCH_CODE = "account-mismatch";
