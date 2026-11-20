// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { AccountNotFoundError } from "@/lib/client/api";
import { REQUEST_TIMEOUT_MS, RequestTimeoutError } from "@/lib/client/http";
import type { UnlockStoreState } from "@/lib/client/storage-migrate";
import { settleWithin, type LoadedVault } from "@/lib/client/vault-sync";
import type { Wallet } from "@/lib/crypto/wallet";

// The hosted part of a start (or of a retry) with the phrase kept on this
// device, kept apart from React so its order and its cancellation can be tested.
// ciclo-context.tsx supplies the steps; each one that changes what is on screen
// runs only while `isCancelled()` is false, and nothing runs after a cancel
// (sign-out, Forget, a device diary, a diary opened another way).

/**
 * How long the start waits for the host before it shows what it can without it
 * (the offline copy on Android, otherwise Try again). The load goes on, and its
 * diary opens if it arrives while this start still counts.
 */
export const START_ANSWER_MS = REQUEST_TIMEOUT_MS;

export type RestoreKeptPhraseSteps = {
  readKept: () => Promise<UnlockStoreState>;
  /** Forgets a kept phrase that is not a valid phrase. */
  clearKept: () => Promise<void>;
  unlockWallet: (mnemonic: string) => Wallet;
  /** A diary is open already (a retry while the offline copy is shown): failures then change nothing. */
  diaryOpen: () => boolean;
  /** Blocks every other sign-in or sign-up while this phrase is kept and its diary is not open. */
  guard: (mnemonic: string) => void;
  /** Before the host is asked: the "Keep me signed in" choices of the kept phrase. */
  prepare: (kept: UnlockStoreState) => void;
  /** The vault for `wallet`: session cookie first, sign-in only if needed (loadVaultWithSession). */
  load: (wallet: Wallet, kept: UnlockStoreState) => Promise<LoadedVault>;
  /** Opens the hosted diary (hydrate). Throws if it cannot be opened. */
  open: (wallet: Wallet, vault: LoadedVault, isCancelled: () => boolean) => Promise<void>;
  /** Android: opens the offline copy read-only. False when there is none this phrase opens. */
  openCopy: (wallet: Wallet, isCancelled: () => boolean) => Promise<boolean>;
  showNoPhrase: () => Promise<void>;
  /** Kept but Keystore could not read it: like a failed sign-in, Try again or Forget. */
  showUnreadable: () => void;
  /** No diary could open: Try again (`noAccount` false) or "no account" (no retry). */
  showFailed: (wallet: Wallet, noAccount: boolean) => void;
  startAnswerMs?: number;
};

export async function restoreKeptPhrase(steps: RestoreKeptPhraseSteps, isCancelled: () => boolean): Promise<void> {
  const kept = await steps.readKept();
  if (isCancelled()) return;
  if (kept.unreadable) {
    // With a diary open, leave everything as it is; the next retry tries again.
    if (!steps.diaryOpen()) steps.showUnreadable();
    return;
  }
  if (!kept.mnemonic) {
    if (!steps.diaryOpen()) await steps.showNoPhrase();
    return;
  }
  let wallet: Wallet;
  try {
    wallet = steps.unlockWallet(kept.mnemonic);
  } catch {
    await steps.clearKept().catch(() => undefined);
    if (!isCancelled() && !steps.diaryOpen()) await steps.showNoPhrase();
    return;
  }
  // From here until its diary opens (or a confirmed Forget), nothing may replace it.
  steps.guard(wallet.mnemonic);
  steps.prepare(kept);
  // Set once a load that came after the deadline opens its diary: then nothing
  // shown for the slow host (the copy, Try again) may cover it.
  let lateOpened = false;
  const stale = () => isCancelled() || lateOpened;
  const loading = steps.load(wallet, kept);
  try {
    const first = await settleWithin(loading, steps.startAnswerMs ?? START_ANSWER_MS);
    if (first.state === "value") {
      await steps.open(wallet, first.value, isCancelled);
      return;
    }
    if (first.state === "error") throw first.error;
    // The host has not answered yet (a captive portal, a subway): show what this
    // device has now, and open the host's diary if it still arrives.
    void loading
      .then(async (vault) => {
        if (isCancelled()) return;
        lateOpened = true;
        await steps.open(wallet, vault, isCancelled);
      })
      .catch(() => undefined);
    throw new RequestTimeoutError();
  } catch (cause) {
    if (stale()) return;
    const noAccount = cause instanceof AccountNotFoundError;
    // No connection, or the host is down: the copy on this device opens read-only.
    // Never when the host has no account: a diary deleted elsewhere does not come back.
    if (!noAccount && (await steps.openCopy(wallet, stale))) return;
    if (stale()) return;
    // A retry while the copy is shown that cannot reopen it leaves it as it is,
    // unless the host said there is no account.
    if (!noAccount && steps.diaryOpen()) return;
    steps.showFailed(wallet, noAccount);
  }
}
