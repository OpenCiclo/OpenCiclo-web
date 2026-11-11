// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { DeviceVaultPlugin } from "@/lib/device-vault";
import {
  MNEMONIC_KEY,
  PERSIST_UNLOCK_KEY,
  clearStoredMnemonic,
  readUnlockState,
  writeStoredMnemonic,
  type UnlockStoreState,
} from "@/lib/client/storage-migrate";

// Where a hosted account's phrase waits between app starts ("Keep me signed in").
// On the web: localStorage, or sessionStorage for this tab only. In the Android
// app: sealed by an Android Keystore key (DeviceVaultPlugin.java), never in
// WebView storage. An on-device diary keeps its phrase elsewhere (device-phrase.bin).
export type PhraseStore = {
  read(): Promise<UnlockStoreState>;
  /** Never throws: the person is already signed in, and the next start can ask for the phrase again. */
  write(mnemonic: string, persist: boolean): Promise<void>;
  /** Throws if a kept phrase may still be there. */
  clear(): Promise<void>;
};

export const browserPhraseStore: PhraseStore = {
  read: async () => readUnlockState(),
  write: async (mnemonic, persist) => writeStoredMnemonic(mnemonic, persist),
  clear: async () => clearStoredMnemonic(),
};

type HostedPhrasePlugin = Pick<DeviceVaultPlugin, "storeHostedPhrase" | "readHostedPhrase" | "clearHostedPhrase">;

const NOTHING_KEPT: UnlockStoreState = { mnemonic: null, persist: false, persistCookie: true };

function kept(mnemonic: string): UnlockStoreState {
  return { mnemonic, persist: true, persistCookie: true };
}

/**
 * Android. With "Keep me signed in" off, the phrase stays in memory only: closing
 * the app signs out. Older app versions kept it in WebView localStorage; `read`
 * moves that copy to Keystore and deletes the plaintext only once the sealed copy
 * reads back.
 */
export function androidPhraseStore(
  plugin: HostedPhrasePlugin,
  storage: { local: Storage; session: Storage },
): PhraseStore {
  const { local, session } = storage;

  function dropPlaintext() {
    local.removeItem(MNEMONIC_KEY);
    local.removeItem(PERSIST_UNLOCK_KEY);
    session.removeItem(MNEMONIC_KEY);
  }

  async function sealAndCheck(phrase: string): Promise<boolean> {
    try {
      await plugin.storeHostedPhrase({ phrase });
      const { phrase: readBack } = await plugin.readHostedPhrase();
      return readBack === phrase;
    } catch {
      return false;
    }
  }

  return {
    async read() {
      const legacy = local.getItem(PERSIST_UNLOCK_KEY) === "false" ? null : local.getItem(MNEMONIC_KEY);
      if (legacy) {
        // If Keystore fails, keep the plaintext copy: the next start tries again.
        if (await sealAndCheck(legacy)) dropPlaintext();
        return kept(legacy);
      }
      dropPlaintext();
      try {
        const { phrase } = await plugin.readHostedPhrase();
        return phrase ? kept(phrase) : NOTHING_KEPT;
      } catch {
        // Keystore could not open it. Leave the file: a phrase is never dropped on an
        // uncertain error. The person signs in again, which replaces it.
        return NOTHING_KEPT;
      }
    },

    async write(mnemonic, persist) {
      dropPlaintext();
      if (persist) {
        // No fallback to WebView storage if Keystore fails.
        await plugin.storeHostedPhrase({ phrase: mnemonic }).catch(() => undefined);
        return;
      }
      await plugin.clearHostedPhrase().catch(() => undefined);
    },

    async clear() {
      dropPlaintext();
      await plugin.clearHostedPhrase();
    },
  };
}
