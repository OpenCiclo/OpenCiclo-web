// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { bytesToBase64, base64ToBytes, bytesToUtf8, utf8ToBytes, toBufferSource } from "./bytes";
import { decryptAesGcm, encryptAesGcm } from "./aes";

/** Iterations for new kits. Existing kits keep the count stored in their `wrapParams`. */
export const PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_HASH = "SHA-256";

// Iteration counts a kit may ask for. The cost can rise later without breaking
// kits made today, and builds already installed can still open kits made with a
// higher count. The ceiling stops a hostile or broken kit from freezing a phone
// for minutes; the floor stops one from weakening the wrap. The server accepts
// 100k-10M when a kit is stored (lib/server/mailbox.ts).
export const MIN_KIT_ITERATIONS = 100_000;
export const MAX_KIT_ITERATIONS = 3_000_000;

/** The kit uses a key derivation this build does not support. */
export class UnsupportedKitError extends Error {
  constructor() {
    super("Unsupported recovery kit parameters");
    this.name = "UnsupportedKitError";
  }
}

function kitIterations(params: WrapParams | undefined): number {
  if (!params || params.kdf !== "pbkdf2-sha256" || params.hash !== PBKDF2_HASH) throw new UnsupportedKitError();
  const { iterations } = params;
  if (!Number.isInteger(iterations) || iterations < MIN_KIT_ITERATIONS || iterations > MAX_KIT_ITERATIONS) {
    throw new UnsupportedKitError();
  }
  return iterations;
}

export type WrapParams = {
  kdf: "pbkdf2-sha256";
  iterations: number;
  hash: "SHA-256";
};

export type WrappedKit = {
  wrappedSecret: string;
  wrapNonce: string;
  wrapSalt: string;
  wrapParams: WrapParams;
};

async function deriveWrapKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    "raw",
    toBufferSource(utf8ToBytes(passphrase)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: PBKDF2_HASH,
      salt: toBufferSource(salt),
      iterations,
    },
    material,
    256,
  );
  return new Uint8Array(bits);
}

export async function wrapMnemonic(
  mnemonic: string,
  passphrase: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<WrappedKit> {
  if (passphrase.length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveWrapKey(passphrase, salt, iterations);
  const encrypted = await encryptAesGcm(key, utf8ToBytes(mnemonic));
  return {
    wrappedSecret: encrypted.ciphertext,
    wrapNonce: encrypted.nonce,
    wrapSalt: bytesToBase64(salt),
    wrapParams: {
      kdf: "pbkdf2-sha256",
      iterations,
      hash: "SHA-256",
    },
  };
}

/**
 * Opens a kit with its password, using the iteration count stored in the kit.
 * Throws `UnsupportedKitError` for parameters outside what this build accepts,
 * and a decryption error for a wrong password.
 */
export async function unwrapMnemonic(kit: WrappedKit, passphrase: string): Promise<string> {
  const iterations = kitIterations(kit.wrapParams);
  const salt = base64ToBytes(kit.wrapSalt);
  const key = await deriveWrapKey(passphrase, salt, iterations);
  const plain = await decryptAesGcm(key, kit.wrappedSecret, kit.wrapNonce);
  return bytesToUtf8(plain);
}
