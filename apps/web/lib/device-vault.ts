// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { PutVaultResult, VaultBackend, VaultBlob } from "@/lib/client/api";

// The on-device diary (Android). The file holds the same sealed blob the host
// would store, plus a version counter so saves keep the compare-and-set
// contract of the hosted vault. Native side: DeviceVaultPlugin.java.

export type DeviceVaultStatus = {
  hasDiary: boolean;
  hasPhrase: boolean;
  /** The phrase is sealed with the app-lock key (fingerprint or screen lock on every open). */
  phraseNeedsAuth: boolean;
  /** Android 11+ with a fingerprint or screen lock set up. */
  lockAvailable: boolean;
  /** Android 11+: the app lock can work once a fingerprint or screen lock is set up. Missing in older app builds. */
  lockSupported?: boolean;
};

/** Text for the system fingerprint / screen-lock sheet. */
export type AuthPrompt = { title: string; subtitle: string };

export type DeviceVaultPlugin = {
  status(): Promise<DeviceVaultStatus>;
  readDiary(): Promise<{ data?: string }>;
  writeDiary(options: { data: string }): Promise<void>;
  readPhrase(options: AuthPrompt): Promise<{ phrase: string }>;
  storePhrase(options: AuthPrompt & { phrase: string; requireAuth: boolean }): Promise<void>;
  /** Deletes the device diary and its phrase. Leaves the hosted phrase below alone. */
  clear(): Promise<void>;
  /** The phrase of a hosted account kept signed in, sealed by its own Keystore key. See lib/client/phrase-store.ts. */
  storeHostedPhrase(options: { phrase: string }): Promise<void>;
  /** No `phrase` when none is kept. Rejects when Keystore cannot open the file. */
  readHostedPhrase(): Promise<{ phrase?: string }>;
  clearHostedPhrase(): Promise<void>;
  /**
   * An email sign-up waiting for its code (phrase, email, wrapped kit), sealed by its
   * own Keystore key, so an app killed while the person reads the email can finish it.
   * See lib/client/pending-signup.ts. No `data` when there is none; rejects when Keystore
   * cannot open the file.
   */
  storePendingSignup(options: { data: string }): Promise<void>;
  readPendingSignup(): Promise<{ data?: string }>;
  clearPendingSignup(): Promise<void>;
  /** The offline copy of a hosted diary. See lib/hosted-copy.ts. No `data` when there is none. */
  readHostedCopy(): Promise<{ data?: string }>;
  writeHostedCopy(options: { data: string }): Promise<void>;
  clearHostedCopy(): Promise<void>;
  setSecureScreen(options: { enabled: boolean }): Promise<void>;
  /**
   * Clears the session cookies (`ciclo_session`, legacy `oddy_session`) for the API host in
   * the cookie jar native HTTP uses: a sign-out that cannot reach the host still ends the
   * session on this device.
   */
  clearSessionCookie(options: { url: string }): Promise<void>;
  shareFile(options: { filename: string; data: string; mimeType: string }): Promise<void>;
  /**
   * Android's "Save to" screen: writes the text where the person chooses (phone storage,
   * Drive, any document provider). `saved: false` when she backs out of it.
   */
  saveFile(options: { filename: string; data: string; mimeType: string }): Promise<{ saved: boolean }>;
  /** Copies the phrase to the clipboard, marked sensitive (Android 13+ hides it from the preview). */
  copySensitive(options: { text: string }): Promise<void>;
  /**
   * Empties the clipboard if it still holds what copySensitive put there.
   * `checked: false`: the app could not look (Android 10+, not in front); try again later.
   */
  clearCopied(): Promise<{ checked: boolean }>;
};

const FILE_FORMAT = 1;

export function encodeDeviceDiary(blob: VaultBlob, version: number): string {
  return JSON.stringify({
    format: FILE_FORMAT,
    version,
    ciphertext: blob.ciphertext,
    nonce: blob.nonce,
    schemaVersion: blob.schemaVersion,
  });
}

/** The device diary file is there but cannot be read (damaged, or written by an unknown format). */
export class UnreadableDeviceDiaryError extends Error {
  constructor() {
    super("Unreadable device diary");
    this.name = "UnreadableDeviceDiaryError";
  }
}

/** Throws on anything unexpected. A damaged file must never read as "no diary", or the next save would replace it. */
export function decodeDeviceDiary(data: string): { blob: VaultBlob; version: number } {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(data) as Record<string, unknown>;
  } catch {
    throw new UnreadableDeviceDiaryError();
  }
  if (!parsed || typeof parsed !== "object") throw new UnreadableDeviceDiaryError();
  const { format, version, ciphertext, nonce, schemaVersion } = parsed;
  if (
    format !== FILE_FORMAT ||
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version < 1 ||
    typeof ciphertext !== "string" ||
    ciphertext.length === 0 ||
    typeof nonce !== "string" ||
    nonce.length === 0 ||
    typeof schemaVersion !== "number"
  ) {
    throw new UnreadableDeviceDiaryError();
  }
  return { blob: { ciphertext, nonce, schemaVersion }, version };
}

/**
 * Why an on-device diary stayed locked at start, for the lock screen:
 * - "canceled": the fingerprint or screen-lock check did not finish. Unlocking again can work.
 * - "key-invalidated": the screen lock was removed or a new fingerprint was enrolled. The
 *   app-lock key can never open the sealed phrase again; only the 12 words open the diary.
 * - "no-key": the sealed phrase or its key is gone. Only the 12 words open the diary.
 * - "key-error": Keystore failed in another way. Trying again may work.
 * - "unreadable": the diary file cannot be read. Trying again may work (a read error);
 *   the phrase cannot help with a damaged file.
 */
export type DeviceLockReason = "canceled" | "key-invalidated" | "no-key" | "key-error" | "unreadable";

/** Maps a DeviceVaultPlugin rejection (its `code`) or a load error to a DeviceLockReason. */
export function deviceLockReason(cause: unknown): DeviceLockReason {
  if (cause instanceof UnreadableDeviceDiaryError) return "unreadable";
  const code =
    typeof cause === "object" && cause !== null && "code" in cause ? String((cause as { code: unknown }).code) : "";
  switch (code) {
    case "AUTH_CANCELED":
    case "AUTH_ERROR":
      return "canceled";
    case "KEY_INVALIDATED":
      return "key-invalidated";
    case "KEY_MISSING":
    case "NO_PHRASE":
      return "no-key";
    case "IO_ERROR":
      return "unreadable";
    default:
      return "key-error";
  }
}

/** Whether the sealed phrase can never open again (only the 12 words help), as opposed to a canceled or failed check. */
export function phraseKeyIsGone(cause: unknown): boolean {
  const reason = deviceLockReason(cause);
  return reason === "key-invalidated" || reason === "no-key";
}

export function deviceVaultBackend(plugin: Pick<DeviceVaultPlugin, "readDiary" | "writeDiary">): VaultBackend {
  async function load(): Promise<{ blob: VaultBlob | null; version: number }> {
    const { data } = await plugin.readDiary();
    if (data === undefined || data === null) return { blob: null, version: 0 };
    return decodeDeviceDiary(data);
  }

  return {
    mode: "device",
    load,
    save: async (blob, baseVersion): Promise<PutVaultResult> => {
      const current = await load();
      // The file this diary was saved to is gone (deleted by a move or a wipe).
      // Reporting it as an empty diary would make the merge drop every day.
      if (!current.blob && baseVersion > 0) throw new Error("The device diary is gone");
      if (current.version !== baseVersion) {
        return {
          ok: false,
          current: current.blob
            ? { ...current.blob, version: current.version }
            : { ciphertext: "", nonce: "", schemaVersion: 0, version: current.version },
        };
      }
      const version = baseVersion + 1;
      await plugin.writeDiary({ data: encodeDeviceDiary(blob, version) });
      return { ok: true, version };
    },
  };
}
