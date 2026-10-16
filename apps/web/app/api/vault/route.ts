// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { requireAccount } from "@/lib/server/account";
import { parseBaseVersion, writeVault } from "@/lib/server/vault";
import { MAX_VAULT_CIPHERTEXT_LENGTH } from "@/lib/server/vault-limits";

export { MAX_VAULT_CIPHERTEXT_LENGTH };

export async function GET() {
  const { error, account } = await requireAccount();
  if (error || !account) return error;
  return Response.json({
    ciphertext: account.ciphertext,
    nonce: account.nonce,
    schemaVersion: account.schemaVersion,
    updatedAt: account.updatedAt,
    version: account.vaultVersion,
  });
}

export async function PUT(request: Request) {
  const { error, account } = await requireAccount();
  if (error || !account) return error;
  const body = (await request.json()) as {
    ciphertext?: string;
    nonce?: string;
    schemaVersion?: number;
    baseVersion?: unknown;
  };
  if (!body.ciphertext || !body.nonce) {
    return jsonError("Ciphertext and nonce are required", 400);
  }
  if (body.ciphertext.length > MAX_VAULT_CIPHERTEXT_LENGTH) {
    return jsonError("Vault too large", 413);
  }
  const baseVersion = parseBaseVersion(body.baseVersion);
  if (baseVersion === "invalid") {
    return jsonError("baseVersion must be a non-negative integer", 400);
  }
  const result = await writeVault(
    getDb(),
    account.id,
    { ciphertext: body.ciphertext, nonce: body.nonce, schemaVersion: body.schemaVersion ?? 1 },
    baseVersion,
  );
  if (!result.ok) {
    // Another device saved first. Send its blob so this client can merge and retry.
    return Response.json({ error: "Vault changed", ...result.current }, { status: 409 });
  }
  return Response.json({ ok: true, version: result.version });
}
