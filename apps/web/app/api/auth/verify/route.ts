// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { after } from "next/server";

import { NO_ACCOUNT_CODE } from "@/lib/auth-codes";
import { verifyChallenge } from "@/lib/crypto/wallet";
import { getDb } from "@/lib/db";
import { consumeChallenge } from "@/lib/server/auth-challenges";
import { accountExists, createAccountIfMissing } from "@/lib/server/create-account";
import { jsonError } from "@/lib/server/env";
import { apiRoute, readJson } from "@/lib/server/http";
import { sourceKey, takeRateLimit, takeRateLimits, tooManyRequests } from "@/lib/server/rate-limit";
import {
  isValidSchemaVersion,
  MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH,
  MAX_VAULT_NONCE_LENGTH,
  VAULT_BODY_OVERHEAD_BYTES,
} from "@/lib/server/vault-limits";
import { setSessionCookie } from "@/lib/server/session";
import { recordAccountOpen } from "@/lib/server/account-activity";
import { rejectOutdatedClient } from "@/lib/server/client-version";

function hexField(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// A plain sign-in is served to every app build: it writes no diary data, and its
// session is what lets an outdated build still sign out and delete the account.
// Only creating an account refuses an outdated build (below).
export const POST = apiRoute(async (request: Request) => {
  const parsed = await readJson(request, MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH + VAULT_BODY_OVERHEAD_BYTES);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  const pubkeyHash = hexField(body.pubkeyHash);
  const pubkey = hexField(body.pubkey);
  const nonce = typeof body.nonce === "string" ? body.nonce.trim() : "";
  const signature = hexField(body.signature);
  if (
    !/^[0-9a-f]{64}$/.test(pubkeyHash) ||
    !/^[0-9a-f]{64}$/.test(pubkey) ||
    // Challenge nonces are 64 hex characters; the cap keeps hashing cheap.
    nonce.length === 0 ||
    nonce.length > 128 ||
    // An Ed25519 signature is 64 bytes.
    !/^[0-9a-f]{128}$/.test(signature)
  ) {
    return jsonError("Invalid authentication payload", 400);
  }

  const initialCiphertext = body.ciphertext ?? "";
  const initialNonce = body.nonceVault ?? "";
  const schemaVersion = body.schemaVersion ?? 1;
  if (
    typeof initialCiphertext !== "string" ||
    typeof initialNonce !== "string" ||
    initialNonce.length > MAX_VAULT_NONCE_LENGTH ||
    !isValidSchemaVersion(schemaVersion)
  ) {
    return jsonError("Invalid authentication payload", 400);
  }
  if (initialCiphertext.length > MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH) {
    return jsonError("Vault too large", 413);
  }

  // Before any signature check: up to two Ed25519 verifications per request is
  // the costliest thing an unauthenticated caller can ask for.
  const db = getDb();
  if (!(await takeRateLimit(db, "auth-verify", sourceKey(request)))) {
    return tooManyRequests();
  }
  if (!verifyChallenge(pubkey, pubkeyHash, nonce, signature)) {
    return jsonError("Signature rejected", 401);
  }
  if (!(await consumeChallenge(db, pubkeyHash, nonce))) {
    return jsonError("Challenge expired", 401);
  }

  let created = false;
  if (!(await accountExists(db, pubkeyHash))) {
    // Only a sign-up brings a first diary (create account, move an Android
    // diary to the host). Without one, this is someone signing in with a
    // phrase that has no account, often a typo: never hand them a new empty
    // diary that looks like theirs.
    if (initialCiphertext === "") {
      return Response.json({ error: "No account for this key", code: NO_ACCOUNT_CODE }, { status: 404 });
    }
    // A build the host no longer serves could not use the new account anyway.
    const outdated = rejectOutdatedClient(request);
    if (outdated) return outdated;
    // Only new accounts count: signing in again is never limited here.
    const source = sourceKey(request);
    const allowed = await takeRateLimits(db, [
      { bucket: "account-create", keyHash: source },
      { bucket: "account-create-burst", keyHash: source },
    ]);
    if (!allowed) {
      return tooManyRequests();
    }
    created = await createAccountIfMissing(db, {
      pubkeyHash,
      pubkey,
      ciphertext: initialCiphertext,
      nonce: initialNonce,
      schemaVersion,
    });
  }
  await setSessionCookie(pubkeyHash, body.persist !== false);
  after(() => recordAccountOpen(db, pubkeyHash));
  return Response.json({ ok: true, created });
});
