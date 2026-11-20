// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { base64ToBytes, bytesToBase64 } from "./bytes";

function sampleBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) bytes[i] = (i * 7919 + 13) % 256;
  return bytes;
}

// Lengths around padding and around the 32 KB chunk the browser path uses.
const LENGTHS = [0, 1, 2, 3, 16, 255, 0x8000 - 1, 0x8000, 0x8000 + 1, 200_000];

describe("base64", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encodes and decodes like Node's Buffer, on the server", () => {
    for (const length of LENGTHS) {
      const bytes = sampleBytes(length);
      const encoded = bytesToBase64(bytes);
      expect(encoded).toBe(Buffer.from(bytes).toString("base64"));
      expect(base64ToBytes(encoded)).toEqual(bytes);
    }
  });

  it("gives the same text without Buffer, as in a browser", () => {
    const withBuffer = LENGTHS.map((length) => bytesToBase64(sampleBytes(length)));
    vi.stubGlobal("Buffer", undefined);
    LENGTHS.forEach((length, index) => {
      const bytes = sampleBytes(length);
      expect(bytesToBase64(bytes)).toBe(withBuffer[index]);
      expect(base64ToBytes(withBuffer[index])).toEqual(bytes);
    });
  });

  it("never names Buffer directly, so no polyfill ships with the client crypto", () => {
    const source = readFileSync(path.join(__dirname, "bytes.ts"), "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
    expect(source).not.toMatch(/(?<![.\w])Buffer\s*[.(]|typeof\s+Buffer/);
  });
});
