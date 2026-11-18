// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { AccountNotFoundError, HttpError, VaultChangedError, type VaultBlob } from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import type { Diary } from "@/lib/diary";

// Android: hosted diary → on-device diary. The move ends by deleting the hosted
// account, which cannot be undone, so it must never leave the person with no
// copy at all:
//   1. Copy the host's latest diary, not the one in memory: another device may
//      have saved since this one last loaded it.
//   2. Delete the account only at the version that was copied. If another
//      device saved in between, the host refuses and nothing is deleted.
//   3. Remove the device copy again only when the host clearly said no. When
//      the answer is lost (no connection, a timeout, a server error) the delete
//      may have happened, or may still happen: the device copy stays.

export type MoveToDeviceSteps = {
  /** The hosted vault as the host has it now. */
  loadHosted: () => Promise<{ blob: VaultBlob | null; version: number }>;
  /** Decrypts a hosted blob. Throws NewerDiaryError for a diary from a newer build. */
  open: (blob: VaultBlob) => Promise<Diary>;
  seal: (diary: Diary) => Promise<VaultBlob>;
  /** Writes the device diary. False when this install already has one. */
  writeDevice: (blob: VaultBlob) => Promise<boolean>;
  /** Seals the phrase for the device diary in Keystore. */
  storePhrase: () => Promise<void>;
  /** Deletes the device diary and its phrase. */
  clearDevice: () => Promise<void>;
  /** DELETE /api/account?baseVersion=… (see `deleteAccount`). */
  deleteHosted: (baseVersion: number) => Promise<void>;
  /** Signs in without a first diary: resolves if the account exists, AccountNotFoundError if not. */
  probeHosted: () => Promise<void>;
};

export type MoveToDeviceResult = {
  /** What is now on the device. */
  diary: Diary;
  /**
   * "unconfirmed": the device has the diary, but the host's answer to the delete
   * was lost and it may still have the account. Tell the person how to delete it.
   */
  hostedDeleted: "confirmed" | "unconfirmed";
};

export class DeviceDiaryExistsError extends Error {
  constructor() {
    super("This device already has a diary");
    this.name = "DeviceDiaryExistsError";
  }
}

// The host answered and did not delete: a 409 for a vault that moved on, a 426
// for a build it refuses, or any other 4xx. Only then is the device copy removed.
function hostRefused(cause: unknown): boolean {
  if (cause instanceof VaultChangedError || cause instanceof UpdateRequiredError) return true;
  return cause instanceof HttpError && cause.status >= 400 && cause.status < 500;
}

export async function moveHostedDiaryToDevice(steps: MoveToDeviceSteps): Promise<MoveToDeviceResult> {
  const hosted = await steps.loadHosted();
  if (!hosted.blob) throw new Error("The hosted diary is missing");
  // The email sign-in goes with the account.
  const diary: Diary = { ...(await steps.open(hosted.blob)), recoveryEmailSet: false };

  let written: boolean;
  try {
    written = await steps.writeDevice(await steps.seal(diary));
  } catch (cause) {
    // The host still has the diary: a half-made device copy can go.
    await steps.clearDevice().catch(() => undefined);
    throw cause;
  }
  if (!written) throw new DeviceDiaryExistsError();

  try {
    await steps.storePhrase();
  } catch (cause) {
    await steps.clearDevice().catch(() => undefined);
    throw cause;
  }

  try {
    await steps.deleteHosted(hosted.version);
    return { diary, hostedDeleted: "confirmed" };
  } catch (cause) {
    if (hostRefused(cause)) {
      await steps.clearDevice().catch(() => undefined);
      throw cause;
    }
  }

  // The answer was lost. Ask the host whether the account is still there.
  try {
    await steps.probeHosted();
  } catch (probeError) {
    if (probeError instanceof AccountNotFoundError) return { diary, hostedDeleted: "confirmed" };
    return { diary, hostedDeleted: "unconfirmed" };
  }
  // Still there, maybe only for now: the first request can land later. Try once
  // more. A 409 now means another device saved after the copy was made: the
  // account holds newer entries and neither request can delete it (both ask for
  // the copied version), so the device copy, now out of date, goes and nothing
  // has moved. Any other failure leaves the device copy in place.
  try {
    await steps.deleteHosted(hosted.version);
    return { diary, hostedDeleted: "confirmed" };
  } catch (cause) {
    if (cause instanceof VaultChangedError) {
      await steps.clearDevice().catch(() => undefined);
      throw cause;
    }
    return { diary, hostedDeleted: "unconfirmed" };
  }
}
