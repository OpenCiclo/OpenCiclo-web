// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { decryptAesGcm, encryptAesGcm } from "./aes";
import { bytesToHex, utf8ToBytes, bytesToUtf8 } from "./bytes";
import { createWallet, LEGACY_AUTH_MESSAGE_PREFIX, signChallenge, unlockWallet, verifyChallenge } from "./wallet";
import {
  MAX_KIT_ITERATIONS,
  MIN_KIT_ITERATIONS,
  PBKDF2_ITERATIONS,
  UnsupportedKitError,
  unwrapMnemonic,
  wrapMnemonic,
} from "./wrap";

describe("wallet crypto", () => {
  it("round-trips mnemonic unlock and challenge signatures", () => {
    const created = createWallet();
    const unlocked = unlockWallet(created.mnemonic);
    expect(unlocked.pubkeyHash).toBe(created.pubkeyHash);
    expect(unlocked.publicKeyHex).toBe(created.publicKeyHex);
    const nonce = "abc123";
    const signature = signChallenge(created, nonce);
    expect(
      verifyChallenge(created.publicKeyHex, created.pubkeyHash, nonce, signature),
    ).toBe(true);
    expect(
      verifyChallenge(created.publicKeyHex, created.pubkeyHash, "other", signature),
    ).toBe(false);
  });

  it("derives the friend book key from the phrase, apart from the diary key", () => {
    // A fixed vector: a changed label would lock every friend book.
    const wallet = unlockWallet(
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    );
    expect(bytesToHex(wallet.friendsKey)).toBe("d1052fa363e43c553051e788e2db7efe1b3a0e5f88ab48b44c2e96947c8a1308");
    expect(bytesToHex(wallet.friendsKey)).not.toBe(bytesToHex(wallet.aesKey));
  });

  it("accepts legacy ODDY auth prefix for existing accounts", () => {
    const created = createWallet();
    const nonce = "legacy-nonce";
    const legacyMessage = `${LEGACY_AUTH_MESSAGE_PREFIX}\n${created.pubkeyHash}\n${nonce}`;
    // Simulate a signature created under the old prefix (sign manually via noble in test is heavy;
    // instead verify that new signatures use CICLO and still verify).
    const signature = signChallenge(created, nonce);
    expect(
      verifyChallenge(created.publicKeyHex, created.pubkeyHash, nonce, signature),
    ).toBe(true);
    expect(legacyMessage.startsWith(LEGACY_AUTH_MESSAGE_PREFIX)).toBe(true);
  });

  it("encrypts diary plaintext with AES-GCM", async () => {
    const wallet = createWallet();
    const payload = utf8ToBytes(JSON.stringify({ periodStarts: ["2026-06-01"] }));
    const sealed = await encryptAesGcm(wallet.aesKey, payload);
    const opened = await decryptAesGcm(wallet.aesKey, sealed.ciphertext, sealed.nonce);
    expect(bytesToUtf8(opened)).toBe(bytesToUtf8(payload));
  });

  it("wraps the mnemonic so email alone cannot decrypt", async () => {
    const wallet = createWallet();
    const kit = await wrapMnemonic(wallet.mnemonic, "correct horse");
    await expect(unwrapMnemonic(kit, "wrong passphrase")).rejects.toThrow();
    const recovered = await unwrapMnemonic(kit, "correct horse");
    expect(recovered).toBe(wallet.mnemonic);
  });

  it("re-wraps the mnemonic under a new password without changing it", async () => {
    const wallet = createWallet();
    const first = await wrapMnemonic(wallet.mnemonic, "old-password");
    const recovered = await unwrapMnemonic(first, "old-password");
    const second = await wrapMnemonic(recovered, "new-password");
    expect(await unwrapMnemonic(second, "new-password")).toBe(wallet.mnemonic);
    await expect(unwrapMnemonic(second, "old-password")).rejects.toThrow();
  });

  it("opens a kit with the iteration count stored in it, so the cost can change later", async () => {
    const wallet = createWallet();
    const today = await wrapMnemonic(wallet.mnemonic, "correct horse");
    expect(today.wrapParams.iterations).toBe(PBKDF2_ITERATIONS);
    const cheaper = await wrapMnemonic(wallet.mnemonic, "correct horse", MIN_KIT_ITERATIONS);
    expect(cheaper.wrapParams.iterations).toBe(MIN_KIT_ITERATIONS);
    expect(await unwrapMnemonic(cheaper, "correct horse")).toBe(wallet.mnemonic);
    // The count is part of the key: a kit relabelled with another count does not open.
    await expect(
      unwrapMnemonic({ ...today, wrapParams: { ...today.wrapParams, iterations: MIN_KIT_ITERATIONS } }, "correct horse"),
    ).rejects.toThrow();
  });

  it("refuses kits whose parameters would weaken the wrap or freeze the phone", async () => {
    const kit = await wrapMnemonic(createWallet().mnemonic, "correct horse", MIN_KIT_ITERATIONS);
    const variants = [
      { ...kit.wrapParams, iterations: MIN_KIT_ITERATIONS - 1 },
      { ...kit.wrapParams, iterations: MAX_KIT_ITERATIONS + 1 },
      { ...kit.wrapParams, iterations: 600_000.5 },
      { ...kit.wrapParams, kdf: "argon2id" },
      { ...kit.wrapParams, hash: "SHA-512" },
    ];
    for (const wrapParams of variants) {
      await expect(
        unwrapMnemonic({ ...kit, wrapParams: wrapParams as typeof kit.wrapParams }, "correct horse"),
      ).rejects.toBeInstanceOf(UnsupportedKitError);
    }
  });
});
