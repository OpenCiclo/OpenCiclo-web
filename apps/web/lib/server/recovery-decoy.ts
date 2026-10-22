// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

import { bytesToBase64, toBufferSource, utf8ToBytes } from "@/lib/crypto/bytes";
import type { WrappedKit } from "@/lib/crypto/wrap";
import { requireSecret } from "@/lib/server/env";

// POST /api/recovery/fetch must not reveal whether an email has a Ciclo
// account: for a health app, that fact alone is sensitive. Unknown and
// unverified emails get a decoy kit instead of a 404.
//
// The decoy is built exactly like a real kit: a valid 12-word BIP39 phrase,
// AES-256-GCM with a 12-byte nonce, a 16-byte salt, and the same wrap
// parameters, so lengths and fields match. It is deterministic per email
// (asking twice gives the same answer) and no password opens it, so the
// client reports "wrong email or password" as for any failed sign-in.

function derive(label: string, lookup: string): Uint8Array {
  const secret = requireSecret("EMAIL_LOOKUP_SECRET");
  return hmac(sha256, utf8ToBytes(secret), utf8ToBytes(`recovery-decoy:v1:${label}:${lookup}`));
}

export async function decoyKit(emailLookup: string): Promise<WrappedKit> {
  const phrase = entropyToMnemonic(derive("entropy", emailLookup).slice(0, 16), wordlist);
  const nonce = derive("nonce", emailLookup).slice(0, 12);
  const key = await crypto.subtle.importKey(
    "raw",
    toBufferSource(derive("key", emailLookup)),
    "AES-GCM",
    false,
    ["encrypt"],
  );
  const sealed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBufferSource(nonce) },
    key,
    toBufferSource(utf8ToBytes(phrase)),
  );
  return {
    wrappedSecret: bytesToBase64(new Uint8Array(sealed)),
    wrapNonce: bytesToBase64(nonce),
    wrapSalt: bytesToBase64(derive("salt", emailLookup).slice(0, 16)),
    // Same key order as a real kit read back from the jsonb column.
    wrapParams: { kdf: "pbkdf2-sha256", hash: "SHA-256", iterations: 600_000 },
  };
}
