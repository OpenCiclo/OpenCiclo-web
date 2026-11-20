// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

type NodeBuffer = {
  from(data: Uint8Array): { toString(encoding: "base64"): string };
  from(data: string, encoding: "base64"): Uint8Array;
};

/**
 * Node's Buffer on the server; undefined in browsers, which use btoa/atob.
 * Read through globalThis on purpose: a bare `Buffer` in this file makes the
 * bundler ship a Buffer polyfill with the crypto code to every page.
 */
function nodeBuffer(): NodeBuffer | undefined {
  return (globalThis as { Buffer?: NodeBuffer }).Buffer;
}

/** Bytes per String.fromCharCode call: well under any engine's argument limit. */
const BINARY_CHUNK = 0x8000;

export function bytesToBase64(bytes: Uint8Array): string {
  const buffer = nodeBuffer();
  if (buffer) {
    return buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let start = 0; start < bytes.length; start += BINARY_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(start, start + BINARY_CHUNK));
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const buffer = nodeBuffer();
  if (buffer) {
    return new Uint8Array(buffer.from(value, "base64"));
  }
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function toBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}
