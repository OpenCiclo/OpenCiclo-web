// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { after } from "next/server";

import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { requireAccount } from "@/lib/server/account";
import { recordAccountOpen } from "@/lib/server/account-activity";
import { rejectOutdatedClient } from "@/lib/server/client-version";
import { apiRoute, readJson } from "@/lib/server/http";
import { limitKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { readSession } from "@/lib/server/session";
import { parseBaseVersion, readVault, writeVault } from "@/lib/server/vault";
import {
  isValidSchemaVersion,
  MAX_VAULT_CIPHERTEXT_LENGTH,
  MAX_VAULT_NONCE_LENGTH,
  VAULT_BODY_OVERHEAD_BYTES,
} from "@/lib/server/vault-limits";

export { MAX_VAULT_CIPHERTEXT_LENGTH };

// The app starts here: with a live session cookie it needs no new sign-in. So
// this also records the day's open (once per account per UTC day), as sign-in
// does, after the response.
export const GET = apiRoute(async (request: Request) => {
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const session = await readSession();
  if (!session) return jsonError("Not authenticated", 401);
  const db = getDb();
  const vault = await readVault(db, session.pubkeyHash);
  if (!vault) return jsonError("Account not found", 404);
  after(() => recordAccountOpen(db, session.pubkeyHash));
  return Response.json({
    ciphertext: vault.ciphertext,
    nonce: vault.nonce,
    schemaVersion: vault.schemaVersion,
    updatedAt: vault.updatedAt,
    version: vault.version,
  });
});

export const PUT = apiRoute(async (request: Request) => {
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount();
  if (error || !account) return error;
  const parsed = await readJson(request, MAX_VAULT_CIPHERTEXT_LENGTH + VAULT_BODY_OVERHEAD_BYTES);
  if (!parsed.ok) return parsed.response;
  const { ciphertext, nonce } = parsed.body;
  if (typeof ciphertext !== "string" || typeof nonce !== "string" || !ciphertext || !nonce) {
    return jsonError("Ciphertext and nonce are required", 400);
  }
  if (ciphertext.length > MAX_VAULT_CIPHERTEXT_LENGTH) {
    return jsonError("Vault too large", 413);
  }
  // The nonce and schema version are stored too, so they need limits of their own.
  const schemaVersion = parsed.body.schemaVersion ?? 1;
  if (nonce.length > MAX_VAULT_NONCE_LENGTH || !isValidSchemaVersion(schemaVersion)) {
    return jsonError("Invalid vault metadata", 400);
  }
  // Every save is a compare-and-set: a save without a base version would
  // overwrite whatever another device saved in between.
  const baseVersion = parseBaseVersion(parsed.body.baseVersion);
  if (baseVersion === "missing") {
    return jsonError("baseVersion is required", 400);
  }
  if (baseVersion === "invalid") {
    return jsonError("baseVersion must be a non-negative integer", 400);
  }
  const db = getDb();
  if (!(await takeRateLimit(db, "vault-write", limitKey("account", account.id)))) {
    return tooManyRequests();
  }
  const result = await writeVault(db, account.id, { ciphertext, nonce, schemaVersion }, baseVersion);
  if (!result.ok) {
    // Another device saved first, or a newer app version wrote the diary. Send
    // its blob so this client can merge and retry, or show it read-only.
    return Response.json({ error: "Vault changed", ...result.current }, { status: 409 });
  }
  return Response.json({ ok: true, version: result.version });
});
