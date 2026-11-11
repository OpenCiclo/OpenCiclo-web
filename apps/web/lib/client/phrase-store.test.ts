// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { androidPhraseStore } from "./phrase-store";
import { MNEMONIC_KEY, PERSIST_UNLOCK_KEY } from "./storage-migrate";

const PHRASE = "alpha beta gamma";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(String(key), String(value));
    },
  };
}

/** Stands in for DeviceVaultPlugin's hosted-phrase methods (Keystore + hosted-phrase.bin). */
function fakeKeystore(options: { failStore?: boolean; failRead?: boolean; failClear?: boolean; corrupt?: boolean } = {}) {
  const state = { sealed: null as string | null, clears: 0 };
  return {
    state,
    plugin: {
      async storeHostedPhrase({ phrase }: { phrase: string }) {
        if (options.failStore) throw new Error("KEY_ERROR");
        state.sealed = options.corrupt ? `${phrase}!` : phrase;
      },
      async readHostedPhrase() {
        if (options.failRead) throw new Error("KEY_ERROR");
        return state.sealed === null ? {} : { phrase: state.sealed };
      },
      async clearHostedPhrase() {
        state.clears += 1;
        if (options.failClear) throw new Error("IO_ERROR");
        state.sealed = null;
      },
    },
  };
}

function setup(options?: Parameters<typeof fakeKeystore>[0]) {
  const keystore = fakeKeystore(options);
  const local = memoryStorage();
  const session = memoryStorage();
  return { ...keystore, local, session, store: androidPhraseStore(keystore.plugin, { local, session }) };
}

function plaintextLeft(local: Storage, session: Storage) {
  return [local.getItem(MNEMONIC_KEY), session.getItem(MNEMONIC_KEY)].filter((value) => value !== null);
}

describe("androidPhraseStore", () => {
  it("keeps a phrase in Keystore and never in WebView storage", async () => {
    const { store, state, local, session } = setup();
    await store.write(PHRASE, true);
    expect(state.sealed).toBe(PHRASE);
    expect(plaintextLeft(local, session)).toEqual([]);
    expect(local.getItem(PERSIST_UNLOCK_KEY)).toBeNull();
    expect(await store.read()).toEqual({ mnemonic: PHRASE, persist: true, persistCookie: true });
  });

  it("keeps nothing when Keep me signed in is off, and drops an older sealed phrase", async () => {
    const { store, state, local, session } = setup();
    state.sealed = "older phrase";
    await store.write(PHRASE, false);
    expect(state.sealed).toBeNull();
    expect(plaintextLeft(local, session)).toEqual([]);
    expect((await store.read()).mnemonic).toBeNull();
  });

  it("does not fall back to WebView storage when Keystore fails", async () => {
    const { store, state, local, session } = setup({ failStore: true });
    await expect(store.write(PHRASE, true)).resolves.toBeUndefined();
    expect(state.sealed).toBeNull();
    expect(plaintextLeft(local, session)).toEqual([]);
  });

  it("moves a phrase from an older app version into Keystore, then deletes the plaintext", async () => {
    const { store, state, local, session } = setup();
    local.setItem(MNEMONIC_KEY, PHRASE);
    local.setItem(PERSIST_UNLOCK_KEY, "true");
    session.setItem(MNEMONIC_KEY, PHRASE);
    expect(await store.read()).toEqual({ mnemonic: PHRASE, persist: true, persistCookie: true });
    expect(state.sealed).toBe(PHRASE);
    expect(plaintextLeft(local, session)).toEqual([]);
    expect(local.getItem(PERSIST_UNLOCK_KEY)).toBeNull();
    expect((await store.read()).mnemonic).toBe(PHRASE);
  });

  it("moves an older phrase stored before the persist flag existed", async () => {
    const { store, state, local } = setup();
    local.setItem(MNEMONIC_KEY, PHRASE);
    expect((await store.read()).mnemonic).toBe(PHRASE);
    expect(state.sealed).toBe(PHRASE);
    expect(local.getItem(MNEMONIC_KEY)).toBeNull();
  });

  it("keeps the plaintext copy when Keystore cannot seal it, so the next start tries again", async () => {
    const { store, local } = setup({ failStore: true });
    local.setItem(MNEMONIC_KEY, PHRASE);
    expect((await store.read()).mnemonic).toBe(PHRASE);
    expect(local.getItem(MNEMONIC_KEY)).toBe(PHRASE);
  });

  it("keeps the plaintext copy when the sealed copy does not read back the same", async () => {
    const { store, local } = setup({ corrupt: true });
    local.setItem(MNEMONIC_KEY, PHRASE);
    expect((await store.read()).mnemonic).toBe(PHRASE);
    expect(local.getItem(MNEMONIC_KEY)).toBe(PHRASE);
  });

  it("drops a leftover phrase from a session that did not keep it", async () => {
    const { store, state, local, session } = setup();
    local.setItem(PERSIST_UNLOCK_KEY, "false");
    local.setItem(MNEMONIC_KEY, PHRASE);
    session.setItem(MNEMONIC_KEY, PHRASE);
    expect((await store.read()).mnemonic).toBeNull();
    expect(state.sealed).toBeNull();
    expect(plaintextLeft(local, session)).toEqual([]);
  });

  it("reads as nothing kept when Keystore cannot open the phrase, without deleting it", async () => {
    const { store, state } = setup({ failRead: true });
    state.sealed = PHRASE;
    expect(await store.read()).toEqual({ mnemonic: null, persist: false, persistCookie: true });
    expect(state.clears).toBe(0);
  });

  it("clear forgets the phrase everywhere", async () => {
    const { store, state, local, session } = setup();
    state.sealed = PHRASE;
    local.setItem(MNEMONIC_KEY, PHRASE);
    session.setItem(MNEMONIC_KEY, PHRASE);
    await store.clear();
    expect(state.sealed).toBeNull();
    expect(plaintextLeft(local, session)).toEqual([]);
  });

  it("clear throws when the sealed phrase may still be there", async () => {
    const { store } = setup({ failClear: true });
    await expect(store.clear()).rejects.toThrow();
  });
});
