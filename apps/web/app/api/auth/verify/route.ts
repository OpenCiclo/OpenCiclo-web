// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { NO_ACCOUNT_CODE } from "@/lib/auth-codes";
import { verifyChallenge } from "@/lib/crypto/wallet";
import { getDb } from "@/lib/db";
import { consumeChallenge } from "@/lib/server/auth-challenges";
import { accountExists, createAccountIfMissing } from "@/lib/server/create-account";
import { jsonError } from "@/lib/server/env";
import { sourceKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import {
  isValidSchemaVersion,
  MAX_INITIAL_VAULT_CIPHERTEXT_LENGTH,
  MAX_VAULT_NONCE_LENGTH,
} from "@/lib/server/vault-limits";
import { setSessionCookie } from "@/lib/server/session";
import { recordAccountOpen } from "@/lib/server/account-activity";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    pubkeyHash?: string;
    pubkey?: string;
    nonce?: string;
    signature?: string;
    ciphertext?: string;
    nonceVault?: string;
    schemaVersion?: number;
    persist?: boolean;
  };
  const pubkeyHash = body.pubkeyHash?.trim().toLowerCase();
  const pubkey = body.pubkey?.trim().toLowerCase();
  const nonce = body.nonce?.trim();
  const signature = body.signature?.trim().toLowerCase();
  if (
    !pubkeyHash ||
    !pubkey ||
    !nonce ||
    !signature ||
    !/^[0-9a-f]{64}$/.test(pubkeyHash) ||
    !/^[0-9a-f]{64}$/.test(pubkey) ||
    !/^[0-9a-f]+$/.test(signature)
  ) {
    return jsonError("Invalid authentication payload", 400);
  }
  if (!verifyChallenge(pubkey, pubkeyHash, nonce, signature)) {
    return jsonError("Signature rejected", 401);
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

  const db = getDb();
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
    // Only new accounts count: signing in again is never limited here.
    if (!(await takeRateLimit(db, "account-create", sourceKey(request)))) {
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
  await recordAccountOpen(pubkeyHash);
  return Response.json({ ok: true, created });
}
