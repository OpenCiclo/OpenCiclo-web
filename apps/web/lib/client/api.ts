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

/** A save the host refused because the encrypted diary is over its size cap (413). */
export class VaultTooLargeError extends Error {
  constructor() {
    super("The diary is too large for the host");
    this.name = "VaultTooLargeError";
  }
}

/**
 * The largest vault ciphertext the host takes: the server's
 * `MAX_VAULT_CIPHERTEXT_LENGTH` (lib/server/vault-limits.ts), above which PUT
 * /api/vault answers 413. Kept equal to it, never larger (lib/client/api.test.ts
 * checks). Used to refuse a move to the host up front.
 */
export const MAX_HOSTED_VAULT_CIPHERTEXT_LENGTH = 512 * 1024;

/** A sign-in skipped because the session it was for ended (signed out, another account opened). */
export class SignInCancelledError extends Error {
  constructor() {
    super("The session this sign-in was for has ended");
    this.name = "SignInCancelledError";
  }
}

// A sign-out that could not reach the host leaves the session cookie (httpOnly:
// only the host can clear it). This marks it, so it is cleared later.
const LOGOUT_PENDING_KEY = "ciclo.logoutPending";

// Sign-ins and sign-outs run one at a time, in the order they were asked for:
// the session cookie is one slot, and the last Set-Cookie wins. A sign-out must
// never clear the cookie of a sign-in that came after it, nor a late sign-in
// replace the cookie of a newer one.
let authChain: Promise<unknown> = Promise.resolve();
let signInsPending = 0;
let logoutsPending = 0;

function inAuthOrder<T>(task: () => Promise<T>): Promise<T> {
  const queued = authChain.then(task, task);
  authChain = queued.catch(() => undefined);
  return queued;
}

/** Resolves once the sign-ins and sign-outs asked for so far have finished. */
export function authSettled(): Promise<void> {
  return authChain.then(() => undefined);
}

// Android: clears the session cookie in the app's own cookie jar (the one native
// HTTP uses), for a sign-out that cannot reach the host. Null on the web, where
// only the host can clear an httpOnly cookie.
let localSessionCookieClearer: (() => Promise<void>) | null = null;

/** Android only: how to clear the session cookie on this device without the host. */
export function setLocalSessionCookieClearer(clear: (() => Promise<void>) | null) {
  localSessionCookieClearer = clear;
}

function writeLogoutPending(pending: boolean) {
  try {
    if (typeof localStorage === "undefined") return;
    if (pending) localStorage.setItem(LOGOUT_PENDING_KEY, "1");
    else localStorage.removeItem(LOGOUT_PENDING_KEY);
  } catch {
    // Storage off: the cookie expires on its own (30 days at most).
  }
}

function logoutPending(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(LOGOUT_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Signs in. With `vault`, a sign-up: creates the account, with `vault` as its
 * first blob, if the host has none. Without it, a phrase with no account
 * throws AccountNotFoundError and nothing is created. Returns whether the
 * account was created.
 *
 * `isLive`: whether the session this sign-in is for is still the one open. If it
 * ended before the sign-in starts, nothing is sent (SignInCancelledError). If it
 * ended while the request was out, the cookie just set is marked for clearing
 * (`retryPendingLogout`) instead of counting as a fresh session.
 */
export async function loginWithWallet(
  wallet: Wallet,
  vault?: { ciphertext: string; nonce: string; schemaVersion: number },
  persist = true,
  options: { isLive?: () => boolean } = {},
): Promise<boolean> {
  const live = () => !options.isLive || options.isLive();
  signInsPending += 1;
  let ended = false;
  try {
    return await inAuthOrder(async () => {
      if (!live()) throw new SignInCancelledError();
      const created = await signIn(wallet, vault, persist);
      ended = !live();
      // This session replaced any cookie a sign-out could not clear. A session
      // that ended meanwhile must not stay signed in: its cookie is marked.
      writeLogoutPending(ended);
      return created;
    });
  } finally {
    signInsPending -= 1;
    if (ended) void retryPendingLogout();
  }
}

async function signIn(
  wallet: Wallet,
  vault: { ciphertext: string; nonce: string; schemaVersion: number } | undefined,
  persist: boolean,
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
  // 401 (no session) and 404 (no account for the session) throw HttpError, never
  // "no diary yet": returning null here would show an empty diary that the next
  // save could upload over the real one. The caller signs in and asks again
  // (lib/client/vault-sync.ts).
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
  if (response.status === 413) throw new VaultTooLargeError();
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

/**
 * Ends the host session (clears the session cookie). Never throws: sign-out
 * removes what this device keeps first, with or without a connection. Returns
 * false when the cookie may still be on this device: the host could not be
 * reached and (web) only it can clear the cookie. `retryPendingLogout` tries
 * again (next start, back online). A later sign-in replaces the cookie anyway.
 * In the Android app the cookie is then cleared in the app's own jar.
 */
export async function logoutSession(): Promise<boolean> {
  logoutsPending += 1;
  try {
    return await inAuthOrder(async () => {
      try {
        const response = await apiFetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) throw new HttpError(response.status, `HTTP ${response.status}`);
        writeLogoutPending(false);
        return true;
      } catch {
        if (localSessionCookieClearer) {
          try {
            await localSessionCookieClearer();
            writeLogoutPending(false);
            return true;
          } catch {
            // Fall through: the next start tries the host again.
          }
        }
        writeLogoutPending(true);
        return false;
      }
    });
  } finally {
    logoutsPending -= 1;
  }
}

/** A sign-out could not reach the host yet: its session cookie may still be in this browser. */
export function isLogoutPending(): boolean {
  return logoutPending();
}

/**
 * Clears a session cookie that an offline sign-out left behind. Never throws.
 * Skipped while a sign-in is running or waiting: its new cookie replaces the old
 * one, and a sign-out ordered after it would end the new session.
 */
export async function retryPendingLogout(): Promise<boolean> {
  if (!logoutPending() || signInsPending > 0 || logoutsPending > 0) return !logoutPending();
  return logoutSession();
}
