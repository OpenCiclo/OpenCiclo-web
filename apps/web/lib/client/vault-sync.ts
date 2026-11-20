// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { HttpError, SignInCancelledError, type PutVaultResult, type VaultBlob } from "@/lib/client/api";
import { decryptAesGcm } from "@/lib/crypto/aes";
import { emptyDiary, type Diary } from "@/lib/diary";
import { mergeDiaryEdits } from "@/lib/diary-merge";

// The rules ciclo-context.tsx follows to load, save and refresh a hosted diary,
// kept apart from React so they can be tested on their own.

export type LoadedVault = { blob: VaultBlob | null; version: number };

/** True when `blob` decrypts with `aesKey` (AES-GCM checks it): the vault belongs to that key's account. */
export async function opensWithKey(aesKey: Uint8Array, blob: VaultBlob): Promise<boolean> {
  try {
    await decryptAesGcm(aesKey, blob.ciphertext, blob.nonce);
    return true;
  } catch {
    return false;
  }
}

/** The host no longer takes this device's session cookie (expired, or never set). */
export function isSessionExpired(cause: unknown): boolean {
  return cause instanceof HttpError && cause.status === 401;
}

/**
 * Start with a phrase kept on this device. The session cookie lasts 30 days, so
 * the vault is asked for with it first: one request. Only when the host refuses
 * that session (401), knows no account for it (404: deleted since), or hands
 * back a vault this key cannot open (the cookie belongs to another account),
 * does it sign in (challenge + verify) and ask again. A vault with no blob says
 * nothing about whose it is, so it signs in then too. Every other failure
 * (network, timeout, 5xx, 426) is thrown as it came, and the phrase is kept.
 */
export async function loadVaultWithSession(deps: {
  fetchVault: () => Promise<LoadedVault>;
  signIn: () => Promise<unknown>;
  opensWithKey: (blob: VaultBlob) => Promise<boolean>;
  /** The start this load belongs to was cancelled (sign-out, another account): never sign in for it. */
  isCancelled?: () => boolean;
}): Promise<{ vault: LoadedVault; signedIn: boolean }> {
  let first: LoadedVault | null = null;
  try {
    first = await deps.fetchVault();
  } catch (cause) {
    if (!(cause instanceof HttpError && (cause.status === 401 || cause.status === 404))) throw cause;
  }
  if (first?.blob && (await deps.opensWithKey(first.blob))) return { vault: first, signedIn: false };
  if (deps.isCancelled?.()) throw new SignInCancelledError();
  await deps.signIn();
  return { vault: await deps.fetchVault(), signedIn: true };
}

/**
 * Wraps hosted requests so that a 401 (the session expired while the app was
 * open) signs in once with the wallet in memory and runs that request again.
 * One sign-in per wrapper: a second 401 is thrown. `isLive`: the session the
 * request belongs to is still the one open; once it is not (signed out,
 * another account), the 401 is thrown as it came and nothing signs in.
 */
export function retryAfterSignInOnce(signIn: () => Promise<unknown>, isLive: () => boolean = () => true) {
  let used = false;
  return async <T>(run: () => Promise<T>): Promise<T> => {
    try {
      return await run();
    } catch (cause) {
      if (used || !isSessionExpired(cause) || !isLive()) throw cause;
      used = true;
    }
    await signIn();
    if (!isLive()) throw new SignInCancelledError();
    return run();
  };
}

/**
 * Generations for the start-up restore and its retries. `cancel()` (sign-out,
 * forgetting the saved sign-in, a diary opened another way) makes every run
 * started before it see `isCancelled() === true`, so a late answer never opens
 * the old account. One run per generation at a time; a cancelled run still in
 * flight never blocks the next one.
 */
export class RestoreGeneration {
  private generation = 0;
  private inFlight: { generation: number; promise: Promise<void> } | null = null;

  /** `isCancelled` for work started now. */
  guard(): () => boolean {
    const at = this.generation;
    return () => this.generation !== at;
  }

  cancel(): void {
    this.generation += 1;
  }

  run(task: (isCancelled: () => boolean) => Promise<void>): Promise<void> {
    if (this.inFlight && this.inFlight.generation === this.generation) return this.inFlight.promise;
    const generation = this.generation;
    const promise: Promise<void> = task(() => this.generation !== generation).finally(() => {
      if (this.inFlight?.promise === promise) this.inFlight = null;
    });
    this.inFlight = { generation, promise };
    return promise;
  }
}

/**
 * Whether a vault fetched when the app returns to the front (or comes back
 * online) replaces the diary in memory: only when the host holds a newer version
 * and nothing is being saved on this device, and no sheet or dialog is open (it
 * may hold a draft built from the diary on screen). Otherwise the next save
 * meets the new version as a 409 and merges it.
 */
export function shouldApplyRefresh(state: {
  syncedVersion: number | null;
  fetchedVersion: number;
  savesPending: number;
  overlayOpen: boolean;
}): boolean {
  if (state.syncedVersion === null || state.savesPending > 0 || state.overlayOpen) return false;
  return state.fetchedVersion > state.syncedVersion;
}

export type Settled<T> = { state: "value"; value: T } | { state: "error"; error: unknown } | { state: "pending" };

/**
 * How `task` stands after at most `ms`: its value, its error, or "pending" when it
 * has not settled yet (it goes on; the caller may still use it later).
 */
export function settleWithin<T>(task: Promise<T>, ms: number): Promise<Settled<T>> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ state: "pending" }), ms);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve({ state: "value", value });
      },
      (error: unknown) => {
        clearTimeout(timer);
        resolve({ state: "error", error });
      },
    );
  });
}

// After a failed start: try again on its own, waiting longer each time.
const RESTORE_RETRY_DELAYS_MS = [5_000, 15_000, 30_000, 60_000, 120_000, 300_000];

/** How long to wait before the `attempt`-th automatic retry (0-based). Stays at the last delay. */
export function restoreRetryDelay(attempt: number): number {
  const index = Math.min(Math.max(0, Math.floor(attempt)), RESTORE_RETRY_DELAYS_MS.length - 1);
  return RESTORE_RETRY_DELAYS_MS[index];
}

export type SaveWithMergeResult =
  | { kind: "saved"; diary: Diary; version: number; blob: VaultBlob }
  /** The stored diary was saved by a newer build: nothing was merged or saved. */
  | { kind: "newer"; diary: Diary; newerJson: string; version: number };

/**
 * Saves `local` on top of `synced`. If another device saved first (409), merges
 * its edits in (`mergeDiaryEdits`, local wins only where it changed) and tries
 * again, up to `maxAttempts` saves. `onSynced` gets every version learned from
 * the host along the way. A diary saved by a newer build is returned as
 * "newer", unmerged. Throws when the diary keeps changing elsewhere.
 */
export async function saveWithMerge(options: {
  synced: { diary: Diary; version: number };
  local: Diary;
  maxAttempts: number;
  seal: (diary: Diary) => Promise<VaultBlob>;
  save: (blob: VaultBlob, baseVersion: number) => Promise<PutVaultResult>;
  openRemote: (blob: VaultBlob, fallbackLocale: Diary["locale"]) => Promise<{ diary: Diary; newerJson: string | null }>;
  onSynced: (synced: { diary: Diary; version: number }) => void;
}): Promise<SaveWithMergeResult> {
  let synced = options.synced;
  let candidate = options.local;
  for (let attempt = 0; attempt < options.maxAttempts; attempt += 1) {
    const blob = await options.seal(candidate);
    const result = await options.save(blob, synced.version);
    if (result.ok) {
      options.onSynced({ diary: candidate, version: result.version });
      return { kind: "saved", diary: candidate, version: result.version, blob };
    }
    const opened = result.current.ciphertext
      ? await options.openRemote(result.current, candidate.locale)
      : { diary: emptyDiary(candidate.locale), newerJson: null };
    if (opened.newerJson !== null) {
      return { kind: "newer", diary: opened.diary, newerJson: opened.newerJson, version: result.current.version };
    }
    candidate = mergeDiaryEdits(synced.diary, candidate, opened.diary);
    synced = { diary: opened.diary, version: result.current.version };
    options.onSynced(synced);
  }
  throw new Error("Could not save: the diary keeps changing on another device");
}
