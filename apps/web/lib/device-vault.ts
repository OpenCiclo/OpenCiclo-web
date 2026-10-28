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
};

/** Text for the system fingerprint / screen-lock sheet. */
export type AuthPrompt = { title: string; subtitle: string };

export type DeviceVaultPlugin = {
  status(): Promise<DeviceVaultStatus>;
  readDiary(): Promise<{ data?: string }>;
  writeDiary(options: { data: string }): Promise<void>;
  readPhrase(options: AuthPrompt): Promise<{ phrase: string }>;
  storePhrase(options: AuthPrompt & { phrase: string; requireAuth: boolean }): Promise<void>;
  clear(): Promise<void>;
  setSecureScreen(options: { enabled: boolean }): Promise<void>;
  shareFile(options: { filename: string; data: string; mimeType: string }): Promise<void>;
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

/** Throws on anything unexpected. A damaged file must never read as "no diary", or the next save would replace it. */
export function decodeDeviceDiary(data: string): { blob: VaultBlob; version: number } {
  const parsed = JSON.parse(data) as Record<string, unknown>;
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
    throw new Error("Unreadable device diary");
  }
  return { blob: { ciphertext, nonce, schemaVersion }, version };
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
