// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  OfflineError,
  androidHostedCopyStore,
  decodeHostedCopy,
  encodeHostedCopy,
  offlineBackend,
  type HostedCopy,
} from "@/lib/hosted-copy";

const copy: HostedCopy = {
  blob: { ciphertext: "c2VhbGVk", nonce: "bm9uY2U=", schemaVersion: 6 },
  version: 7,
  savedAt: "2026-11-17T10:32:00.000Z",
};

/** Stands in for DeviceVaultPlugin's hosted-copy methods (files/hosted-diary-copy.json). */
function memoryPlugin(initial?: string, options: { failRead?: boolean } = {}) {
  const state = { data: initial, writes: 0, clears: 0 };
  return {
    state,
    plugin: {
      readHostedCopy: async () => {
        if (options.failRead) throw new Error("IO_ERROR");
        return state.data === undefined ? {} : { data: state.data };
      },
      writeHostedCopy: async ({ data }: { data: string }) => {
        state.data = data;
        state.writes += 1;
      },
      clearHostedCopy: async () => {
        state.data = undefined;
        state.clears += 1;
      },
    },
  };
}

describe("offline copy file", () => {
  it("round-trips the blob, the version, and when it was saved", () => {
    expect(decodeHostedCopy(encodeHostedCopy(copy))).toEqual(copy);
  });

  it("keeps nothing but the sealed blob and its metadata", () => {
    expect(Object.keys(JSON.parse(encodeHostedCopy(copy))).sort()).toEqual(
      ["ciphertext", "format", "nonce", "savedAt", "schemaVersion", "version"],
    );
  });

  it("rejects damaged files", () => {
    const good = JSON.parse(encodeHostedCopy(copy)) as Record<string, unknown>;
    expect(() => decodeHostedCopy("{")).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, format: 2 }))).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, version: -1 }))).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, version: 1.5 }))).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, savedAt: "yesterday" }))).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, ciphertext: "" }))).toThrow();
    expect(() => decodeHostedCopy(JSON.stringify({ ...good, nonce: undefined }))).toThrow();
  });
});

describe("offline copy store", () => {
  it("reads nothing when there is no copy", async () => {
    const { plugin } = memoryPlugin();
    await expect(androidHostedCopyStore(plugin).read()).resolves.toBeNull();
  });

  it("writes, reads back, and clears the copy", async () => {
    const { plugin, state } = memoryPlugin();
    const store = androidHostedCopyStore(plugin);
    await store.write(copy);
    await expect(store.read()).resolves.toEqual(copy);
    await store.clear();
    await expect(store.read()).resolves.toBeNull();
    expect(state).toMatchObject({ writes: 1, clears: 1 });
  });

  it("reads a damaged or unreadable copy as none: the host still has the diary", async () => {
    await expect(androidHostedCopyStore(memoryPlugin("not json").plugin).read()).resolves.toBeNull();
    await expect(
      androidHostedCopyStore(memoryPlugin(encodeHostedCopy(copy), { failRead: true }).plugin).read(),
    ).resolves.toBeNull();
  });
});

describe("offline backend", () => {
  it("loads the copy", async () => {
    await expect(offlineBackend(copy).load()).resolves.toEqual({ blob: copy.blob, version: copy.version });
  });

  it("is read-only: every save throws", async () => {
    const backend = offlineBackend(copy);
    expect(backend.readOnlySince).toBe(copy.savedAt);
    await expect(backend.save(copy.blob, copy.version, "a".repeat(64))).rejects.toBeInstanceOf(OfflineError);
  });
});
