// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { NO_ACCOUNT_CODE, VAULT_CHANGED_CODE } from "@/lib/auth-codes";
import { REQUEST_TIMEOUT_MS, apiFetch } from "@/lib/client/http";

// The vault is the one large payload (up to 2 MB of ciphertext). Its requests
// get time for the transfer on top of the usual limit: a slow uplink must not
// make a big diary impossible to save or open.
const VAULT_LOAD_TIMEOUT_MS = 60_000;
function vaultSaveTimeout(body: string): number {
  return REQUEST_TIMEOUT_MS + Math.ceil(body.length / 8192) * 1000;
}
import { signChallenge, type Wallet } from "@/lib/crypto/wallet";

/** The host has no account for this phrase (and the sign-in brought no first diary to create one). */
export class AccountNotFoundError extends Error {
  constructor() {
    super("No account for this phrase");
    this.name = "AccountNotFoundError";
  }
}

/** The host refused a request with this HTTP status (not a network failure or a timeout). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** DELETE /api/account was asked to delete at one vault version and another device saved since. */
export class VaultChangedError extends Error {
  constructor() {
    super("The diary changed on another device");
    this.name = "VaultChangedError";
  }
}

async function parseJson(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
  if (response.status === 404 && payload.code === NO_ACCOUNT_CODE) throw new AccountNotFoundError();
  if (!response.ok) {
    throw new HttpError(response.status, payload.error ?? `HTTP ${response.status}`, payload.code);
  }
  return payload;
}

/**
 * Signs in. With `vault`, a sign-up: creates the account, with `vault` as its
 * first blob, if the host has none. Without it, a phrase with no account
 * throws AccountNotFoundError and nothing is created. Returns whether the
 * account was created.
 */
export async function loginWithWallet(
  wallet: Wallet,
  vault?: { ciphertext: string; nonce: string; schemaVersion: number },
  persist = true,
): Promise<boolean> {
  const challenge = await parseJson(
    await apiFetch("/api/auth/challenge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pubkeyHash: wallet.pubkeyHash }),
    }),
  );
  const nonce = (challenge as { nonce: string }).nonce;
  const signature = signChallenge(wallet, nonce);
  const verified = await parseJson(
    await apiFetch("/api/auth/verify", {
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
  const response = await apiFetch("/api/vault", {}, VAULT_LOAD_TIMEOUT_MS);
  const payload = (await parseJson(response)) as VaultBlob & { version?: number };
  return {
    blob: payload.ciphertext ? payload : null,
    version: payload.version ?? 0,
  };
}

export type PutVaultResult =
  | { ok: true; version: number }
  | { ok: false; current: VaultBlob & { version: number } };

/**
 * Saves on top of `baseVersion`. A 409 means the host kept what it has: another
 * device saved first, or a newer app version wrote the diary (the host never
 * takes a save older than the stored format). Its blob comes back to merge, or
 * to show read-only if it is newer than this build.
 */
export async function putVault(blob: VaultBlob, baseVersion: number): Promise<PutVaultResult> {
  const body = JSON.stringify({ ...blob, baseVersion });
  const response = await apiFetch(
    "/api/vault",
    { method: "PUT", headers: { "content-type": "application/json" }, body },
    vaultSaveTimeout(body),
  );
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
  /**
   * Set only on the offline copy of a hosted diary (lib/hosted-copy.ts): `save`
   * always throws, and this is when the copy was last in step with the host.
   */
  readOnlySince?: string;
  /**
   * The diary was saved by a newer version of Ciclo, or the host refuses this
   * build (426): `save` always throws `UpdateRequiredError`.
   */
  updateRequired?: boolean;
  load: () => Promise<{ blob: VaultBlob | null; version: number }>;
  save: (blob: VaultBlob, baseVersion: number) => Promise<PutVaultResult>;
};

export const hostedVault: VaultBackend = { mode: "hosted", load: fetchVault, save: putVault };

/**
 * Deletes the signed-in account. With `baseVersion`, only if the vault is
 * still at that version (`VaultChangedError` otherwise), so a diary saved by
 * another device in the meantime is never deleted unseen. An account that is
 * already gone counts as deleted: the request may have reached the host while
 * its answer was lost.
 */
export async function deleteAccount(baseVersion?: number) {
  const query = baseVersion === undefined ? "" : `?baseVersion=${baseVersion}`;
  const response = await apiFetch(`/api/account${query}`, { method: "DELETE" });
  if (response.status === 404) return;
  if (response.status === 409) {
    const payload = (await response.json().catch(() => ({}))) as { code?: string };
    if (payload.code === VAULT_CHANGED_CODE) throw new VaultChangedError();
  }
  await parseJson(response);
}

export async function logoutSession() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
