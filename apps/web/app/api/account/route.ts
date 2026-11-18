// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { VAULT_CHANGED_CODE } from "@/lib/auth-codes";
import { getDb } from "@/lib/db";
import { requireAccount } from "@/lib/server/account";
import { jsonError } from "@/lib/server/env";
import { clearSessionCookie } from "@/lib/server/session";
import { deleteAccountRow } from "@/lib/server/vault";

// `?baseVersion=N` deletes only while the vault is still at version N (the
// Android move to the device copies that version first). Without it the delete
// is unconditional, as for "Delete account" in Settings.
function parseQueryVersion(value: string | null): number | null | "invalid" {
  if (value === null) return null;
  if (!/^\d{1,15}$/.test(value)) return "invalid";
  return Number(value);
}

// Never refused for an outdated app build (no rejectOutdatedClient): deleting
// the account does not depend on what the build can read, and an old build must
// still let the person delete their data.
export async function DELETE(request: Request) {
  const baseVersion = parseQueryVersion(new URL(request.url).searchParams.get("baseVersion"));
  if (baseVersion === "invalid") return jsonError("baseVersion must be a non-negative integer", 400);
  const { error, account } = await requireAccount();
  if (error || !account) return error;
  const result = await deleteAccountRow(getDb(), account.id, baseVersion);
  if (result === "changed") {
    return Response.json({ error: "Vault changed", code: VAULT_CHANGED_CODE }, { status: 409 });
  }
  if (result === "gone") {
    // Deleted by another request in the meantime: the same answer as an account
    // that was already gone, which the app counts as deleted.
    await clearSessionCookie();
    return jsonError("Account not found", 404);
  }
  await clearSessionCookie();
  return Response.json({ ok: true });
}
