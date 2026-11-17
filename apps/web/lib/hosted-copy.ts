// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { VaultBackend, VaultBlob } from "@/lib/client/api";
import type { DeviceVaultPlugin } from "@/lib/device-vault";

// Android, hosted accounts kept signed in: a copy of the diary as last seen on the
// host, so the app can still show it without a connection. It is the same sealed
// blob the host stores (AES-256-GCM, key from the phrase), so it opens only with
// the phrase that Keystore keeps. Native side: DeviceVaultPlugin.java
// (`files/hosted-diary-copy.json`). It is never a device diary and never saved to:
// the host stays the only place a hosted diary is written.

export type HostedCopy = {
  blob: VaultBlob;
  /** The host's vault version this copy matches. */
  version: number;
  /** When the copy was last in step with the host (ISO 8601). */
  savedAt: string;
};

const FILE_FORMAT = 1;

export function encodeHostedCopy(copy: HostedCopy): string {
  return JSON.stringify({
    format: FILE_FORMAT,
    version: copy.version,
    savedAt: copy.savedAt,
    ciphertext: copy.blob.ciphertext,
    nonce: copy.blob.nonce,
    schemaVersion: copy.blob.schemaVersion,
  });
}

/** Throws on anything unexpected. */
export function decodeHostedCopy(data: string): HostedCopy {
  const parsed = JSON.parse(data) as Record<string, unknown>;
  const { format, version, savedAt, ciphertext, nonce, schemaVersion } = parsed;
  if (
    format !== FILE_FORMAT ||
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version < 0 ||
    typeof savedAt !== "string" ||
    Number.isNaN(Date.parse(savedAt)) ||
    typeof ciphertext !== "string" ||
    ciphertext.length === 0 ||
    typeof nonce !== "string" ||
    nonce.length === 0 ||
    typeof schemaVersion !== "number"
  ) {
    throw new Error("Unreadable offline copy");
  }
  return { blob: { ciphertext, nonce, schemaVersion }, version, savedAt };
}

export type HostedCopyStore = {
  /** Null when there is no copy, or it cannot be read: the host still has the diary. */
  read(): Promise<HostedCopy | null>;
  write(copy: HostedCopy): Promise<void>;
  clear(): Promise<void>;
};

type HostedCopyPlugin = Pick<DeviceVaultPlugin, "readHostedCopy" | "writeHostedCopy" | "clearHostedCopy">;

export function androidHostedCopyStore(plugin: HostedCopyPlugin): HostedCopyStore {
  return {
    async read() {
      try {
        const { data } = await plugin.readHostedCopy();
        return data ? decodeHostedCopy(data) : null;
      } catch {
        return null;
      }
    },
    write: (copy) => plugin.writeHostedCopy({ data: encodeHostedCopy(copy) }),
    clear: () => plugin.clearHostedCopy(),
  };
}

/** A save was refused because the open diary is the offline copy. */
export class OfflineError extends Error {
  constructor() {
    super("Offline: the diary on screen is a read-only copy");
    this.name = "OfflineError";
  }
}

/** Opens the copy read-only: every save throws OfflineError, so nothing can be written on top of an old copy. */
export function offlineBackend(copy: HostedCopy): VaultBackend {
  return {
    mode: "hosted",
    readOnlySince: copy.savedAt,
    load: async () => ({ blob: copy.blob, version: copy.version }),
    save: async () => {
      throw new OfflineError();
    },
  };
}
