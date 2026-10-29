// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { apiUrl } from "@/lib/app-target";
import { signChallenge, type Wallet } from "@/lib/crypto/wallet";

async function parseJson(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `HTTP ${response.status}`);
  }
  return payload;
}

/** Signs in, creating the account (with `vault` as its first blob) if the host has none. Returns whether it was created. */
export async function loginWithWallet(
  wallet: Wallet,
  vault?: { ciphertext: string; nonce: string; schemaVersion: number },
  persist = true,
): Promise<boolean> {
  const challenge = await parseJson(
    await fetch(apiUrl("/api/auth/challenge"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pubkeyHash: wallet.pubkeyHash }),
    }),
  );
  const nonce = (challenge as { nonce: string }).nonce;
  const signature = signChallenge(wallet, nonce);
  const verified = await parseJson(
    await fetch(apiUrl("/api/auth/verify"), {
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
  return (verified as { created?: boolean }).created === true;
}

export type VaultBlob = { ciphertext: string; nonce: string; schemaVersion: number };

/** Where the diary lives: the Ciclo host, or (Android only) a file on this device. */
export type StorageMode = "hosted" | "device";

export async function fetchVault(): Promise<{ blob: VaultBlob | null; version: number }> {
  // Only called right after a successful sign-in, so 401/404 are failures, not
  // "no diary yet". Returning null here would show an empty diary that the next
  // save could upload over the real one.
  const response = await fetch(apiUrl("/api/vault"));
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
  const response = await fetch(apiUrl("/api/vault"), {
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

/**
 * Loads and saves the sealed diary blob. Both kinds keep the same compare-and-set
 * contract: `save` on a stale `baseVersion` returns the current blob instead of writing.
 */
export type VaultBackend = {
  mode: StorageMode;
  load: () => Promise<{ blob: VaultBlob | null; version: number }>;
  save: (blob: VaultBlob, baseVersion: number) => Promise<PutVaultResult>;
};

export const hostedVault: VaultBackend = { mode: "hosted", load: fetchVault, save: putVault };

export async function deleteAccount() {
  await parseJson(await fetch(apiUrl("/api/account"), { method: "DELETE" }));
}

export async function logoutSession() {
  await fetch(apiUrl("/api/auth/logout"), { method: "POST" });
}
