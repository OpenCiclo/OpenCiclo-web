// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  PENDING_SIGNUP_KEY,
  androidPendingSignupStore,
  browserPendingSignupStore,
  decodePendingSignup,
  encodePendingSignup,
  type StoredPendingSignup,
} from "./pending-signup";

const PENDING: StoredPendingSignup = {
  mnemonic: "alpha beta gamma",
  email: "ada@example.com",
  kit: {
    wrappedSecret: "abc",
    wrapNonce: "def",
    wrapSalt: "ghi",
    wrapParams: { kdf: "pbkdf2-sha256", iterations: 600_000, hash: "SHA-256" },
  },
  persist: true,
  confirmed: false,
};

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(String(key), String(value)),
  };
}

describe("pending sign-up file", () => {
  it("reads back what it wrote", () => {
    expect(decodePendingSignup(encodePendingSignup(PENDING))).toEqual(PENDING);
    expect(decodePendingSignup(encodePendingSignup({ ...PENDING, confirmed: true }))?.confirmed).toBe(true);
  });

  it("reads anything unexpected as no sign-up", () => {
    expect(decodePendingSignup(null)).toBeNull();
    expect(decodePendingSignup("{")).toBeNull();
    expect(decodePendingSignup(JSON.stringify({ ...PENDING, format: 2 }))).toBeNull();
    expect(decodePendingSignup(JSON.stringify({ format: 1, ...PENDING, mnemonic: "" }))).toBeNull();
    expect(decodePendingSignup(JSON.stringify({ format: 1, ...PENDING, email: "nope" }))).toBeNull();
    expect(decodePendingSignup(JSON.stringify({ format: 1, ...PENDING, kit: { wrappedSecret: 1 } }))).toBeNull();
    expect(decodePendingSignup(JSON.stringify({ format: 1, ...PENDING, confirmed: "yes" }))).toBeNull();
  });
});

describe("browserPendingSignupStore", () => {
  it("keeps the sign-up in this tab's sessionStorage only", async () => {
    const session = memoryStorage();
    const store = browserPendingSignupStore(() => session);
    await store.write(PENDING);
    expect(session.getItem(PENDING_SIGNUP_KEY)).not.toBeNull();
    expect(await store.read()).toEqual(PENDING);
    await store.clear();
    expect(await store.read()).toBeNull();
  });

  it("goes on in memory when storage is off", async () => {
    const store = browserPendingSignupStore(() => null);
    await expect(store.write(PENDING)).resolves.toBeUndefined();
    expect(await store.read()).toBeNull();
  });
});

describe("androidPendingSignupStore", () => {
  function fakePlugin(options: { failStore?: boolean; failRead?: boolean } = {}) {
    const state = { sealed: null as string | null };
    return {
      state,
      plugin: {
        async storePendingSignup({ data }: { data: string }) {
          if (options.failStore) throw new Error("KEY_ERROR");
          state.sealed = data;
        },
        async readPendingSignup() {
          if (options.failRead) throw new Error("KEY_ERROR");
          return state.sealed === null ? {} : { data: state.sealed };
        },
        async clearPendingSignup() {
          state.sealed = null;
        },
      },
    };
  }

  it("seals the sign-up with the plugin (Keystore), and clears it", async () => {
    const { plugin, state } = fakePlugin();
    const store = androidPendingSignupStore(plugin);
    await store.write(PENDING);
    expect(state.sealed).not.toBeNull();
    expect(await store.read()).toEqual(PENDING);
    await store.clear();
    expect(state.sealed).toBeNull();
  });

  it("never throws: a failed seal or read leaves the sign-up in memory only", async () => {
    const failing = androidPendingSignupStore(fakePlugin({ failStore: true, failRead: true }).plugin);
    await expect(failing.write(PENDING)).resolves.toBeUndefined();
    await expect(failing.read()).resolves.toBeNull();
  });
});
