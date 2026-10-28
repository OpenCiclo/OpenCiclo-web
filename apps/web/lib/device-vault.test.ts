// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { decodeDeviceDiary, deviceVaultBackend, encodeDeviceDiary } from "@/lib/device-vault";

const blob = { ciphertext: "c2VhbGVk", nonce: "bm9uY2U=", schemaVersion: 6 };

function memoryPlugin(initial?: string) {
  const state = { data: initial, writes: 0 };
  return {
    state,
    plugin: {
      readDiary: async () => (state.data === undefined ? {} : { data: state.data }),
      writeDiary: async ({ data }: { data: string }) => {
        state.data = data;
        state.writes += 1;
      },
    },
  };
}

describe("device diary file", () => {
  it("round-trips the blob and its version", () => {
    expect(decodeDeviceDiary(encodeDeviceDiary(blob, 3))).toEqual({ blob, version: 3 });
  });

  it("rejects damaged files instead of reading them as empty", () => {
    expect(() => decodeDeviceDiary("{")).toThrow();
    expect(() => decodeDeviceDiary(JSON.stringify({ format: 2, version: 1, ...blob }))).toThrow();
    expect(() => decodeDeviceDiary(JSON.stringify({ format: 1, version: 0, ...blob }))).toThrow();
    expect(() => decodeDeviceDiary(JSON.stringify({ format: 1, version: 1, ...blob, ciphertext: "" }))).toThrow();
  });
});

describe("device vault backend", () => {
  it("loads nothing when there is no file", async () => {
    const { plugin } = memoryPlugin();
    await expect(deviceVaultBackend(plugin).load()).resolves.toEqual({ blob: null, version: 0 });
  });

  it("saves on top of the version it was given", async () => {
    const { plugin, state } = memoryPlugin();
    const backend = deviceVaultBackend(plugin);
    await expect(backend.save(blob, 0)).resolves.toEqual({ ok: true, version: 1 });
    await expect(backend.save({ ...blob, ciphertext: "bmV3" }, 1)).resolves.toEqual({ ok: true, version: 2 });
    await expect(backend.load()).resolves.toEqual({ blob: { ...blob, ciphertext: "bmV3" }, version: 2 });
    expect(state.writes).toBe(2);
  });

  it("refuses a stale base and hands back the current blob", async () => {
    const { plugin, state } = memoryPlugin(encodeDeviceDiary(blob, 4));
    const result = await deviceVaultBackend(plugin).save({ ...blob, ciphertext: "b2xk" }, 3);
    expect(result).toEqual({ ok: false, current: { ...blob, version: 4 } });
    expect(state.writes).toBe(0);
  });

  it("never overwrites a damaged file", async () => {
    const { plugin, state } = memoryPlugin("not json");
    await expect(deviceVaultBackend(plugin).save(blob, 0)).rejects.toThrow();
    expect(state.data).toBe("not json");
  });
});
