// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { signChallenge, type Wallet } from "@/lib/crypto/wallet";

async function parseJson(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `HTTP ${response.status}`);
  }
  return payload;
}

export async function loginWithWallet(
  wallet: Wallet,
  vault?: { ciphertext: string; nonce: string; schemaVersion: number },
  persist = true,
) {
  const challenge = await parseJson(
    await fetch("/api/auth/challenge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pubkeyHash: wallet.pubkeyHash }),
    }),
  );
  const nonce = (challenge as { nonce: string }).nonce;
  const signature = signChallenge(wallet, nonce);
  await parseJson(
    await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pubkeyHash: wallet.pubkeyHash,
        pubkey: wallet.publicKeyHex,
        nonce,
        signature,
        ciphertext: vault?.ciphertext,
        nonceVault: vault?.nonce,
        schemaVersion: vault?.schemaVersion,
        persist,
      }),
    }),
  );
}

export type VaultBlob = { ciphertext: string; nonce: string; schemaVersion: number };

export async function fetchVault(): Promise<{ blob: VaultBlob | null; version: number }> {
  // Only called right after a successful sign-in, so 401/404 are failures, not
  // "no diary yet". Returning null here would show an empty diary that the next
  // save could upload over the real one.
  const response = await fetch("/api/vault");
  const payload = (await parseJson(response)) as VaultBlob & { version?: number };
  return {
    blob: payload.ciphertext ? payload : null,
    version: payload.version ?? 0,
  };
}

export type PutVaultResult =
  | { ok: true; version: number }
  | { ok: false; current: VaultBlob & { version: number } };

/** Saves on top of `baseVersion`. A 409 means another device saved first; its blob comes back to merge. */
export async function putVault(blob: VaultBlob, baseVersion: number): Promise<PutVaultResult> {
  const response = await fetch("/api/vault", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...blob, baseVersion }),
  });
  if (response.status === 409) {
    const current = (await response.json()) as VaultBlob & { version: number };
    return { ok: false, current };
  }
  const payload = (await parseJson(response)) as { version: number };
  return { ok: true, version: payload.version };
}

export async function deleteAccount() {
  await parseJson(await fetch("/api/account", { method: "DELETE" }));
}

export async function logoutSession() {
  await fetch("/api/auth/logout", { method: "POST" });
}
