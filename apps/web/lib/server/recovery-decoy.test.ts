// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { beforeAll, describe, expect, it } from "vitest";

import { base64ToBytes } from "@/lib/crypto/bytes";
import { createWallet } from "@/lib/crypto/wallet";
import { unwrapMnemonic, wrapMnemonic } from "@/lib/crypto/wrap";
import { decoyKit } from "@/lib/server/recovery-decoy";

beforeAll(() => {
  process.env.EMAIL_LOOKUP_SECRET ??= "test-email-lookup-secret";
});

const shape = (kit: Awaited<ReturnType<typeof wrapMnemonic>>) => ({
  keys: Object.keys(kit),
  secretBytes: base64ToBytes(kit.wrappedSecret).length,
  nonceBytes: base64ToBytes(kit.wrapNonce).length,
  saltBytes: base64ToBytes(kit.wrapSalt).length,
  params: { kdf: kit.wrapParams.kdf, hash: kit.wrapParams.hash, iterations: kit.wrapParams.iterations },
});

describe("recovery decoy kit", () => {
  it("is stable for the same email and different for another", async () => {
    expect(await decoyKit("a".repeat(64))).toEqual(await decoyKit("a".repeat(64)));
    expect((await decoyKit("a".repeat(64))).wrappedSecret).not.toBe(
      (await decoyKit("b".repeat(64))).wrappedSecret,
    );
  });

  it("has the same fields, sizes, and parameters as a real kit", async () => {
    const real = await wrapMnemonic(createWallet().mnemonic, "correct horse battery");
    const decoy = await decoyKit("c".repeat(64));
    const realShape = shape(real);
    const decoyShape = shape(decoy);
    expect(decoyShape.keys).toEqual(realShape.keys);
    expect(decoyShape.nonceBytes).toBe(realShape.nonceBytes);
    expect(decoyShape.saltBytes).toBe(realShape.saltBytes);
    expect(decoyShape.params).toEqual(realShape.params);
    // A real kit is a 12-word phrase plus the 16-byte GCM tag.
    expect(decoyShape.secretBytes).toBeGreaterThanOrEqual(16 + 12 * 3 + 11);
    expect(decoyShape.secretBytes).toBeLessThanOrEqual(16 + 12 * 8 + 11);
  });

  it("matches the length spread of real kits", async () => {
    const lengths = new Set<number>();
    for (let i = 0; i < 40; i += 1) {
      lengths.add(base64ToBytes((await decoyKit(i.toString(16).padStart(64, "0"))).wrappedSecret).length);
    }
    // Real phrases vary in length, so a constant size would give decoys away.
    expect(lengths.size).toBeGreaterThan(5);
  });

  it("wraps a valid BIP39 phrase that no password opens", async () => {
    const decoy = await decoyKit("d".repeat(64));
    await expect(unwrapMnemonic(decoy, "correct horse battery")).rejects.toThrow();
    // The plaintext is a real 12-word phrase, so even a decrypted decoy looks genuine.
    const { hmac } = await import("@noble/hashes/hmac.js");
    const { sha256 } = await import("@noble/hashes/sha2.js");
    const { entropyToMnemonic } = await import("@scure/bip39");
    const { utf8ToBytes } = await import("@/lib/crypto/bytes");
    const entropy = hmac(
      sha256,
      utf8ToBytes(process.env.EMAIL_LOOKUP_SECRET!),
      utf8ToBytes(`recovery-decoy:v1:entropy:${"d".repeat(64)}`),
    ).slice(0, 16);
    expect(validateMnemonic(entropyToMnemonic(entropy, wordlist), wordlist)).toBe(true);
  });
});
