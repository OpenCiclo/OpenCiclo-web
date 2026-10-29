// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/**
 * `code` of the 404 that /api/auth/verify answers when a correctly signed key
 * has no account and the request brings no first diary to create one with.
 * Only the holder of the key can get it: the signature is checked first.
 */
export const NO_ACCOUNT_CODE = "no-account";
