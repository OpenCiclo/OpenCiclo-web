// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { bytesToHex, hexToBytes } from "@/lib/crypto/bytes";
import { BOX_CIPHERTEXT_LENGTH, NONCE_LENGTH, sealedBase64Length } from "@/lib/friends/limits";

import {
  BadExchangeKeyError,
  BoxTooLargeError,
  exchangeSecret,
  fromBase64Url,
  isExchangePublicKey,
  newExchangeKeys,
  handshakeAddress,
  handshakeLocation,
  inviteAddress,
  inviteLocation,
  keyFingerprint,
  openBook,
  openBox,
  pairKey,
  sealBook,
  sealBox,
  statusAddress,
  toBase64Url,
} from "./crypto";

const S = hexToBytes("11".repeat(32));
const R = hexToBytes("22".repeat(32));

describe("friend keys", () => {
  // Fixed vectors: a changed label or input order would break every friendship.
  it("derives the same addresses as before", () => {
    const K = pairKey(S, R);
    expect(bytesToHex(K)).toMatchInlineSnapshot(`"8f9fa0e83d805843d4287fd389edaa3dab26544382fb85598aa1b4fef2698ad4"`);
    expect(inviteLocation(S).id).toMatchInlineSnapshot(`"a6179cd48dea657d020a7c84cfee03d3036af7b399e33f88d1ba6e6796db67ad"`);
    expect(statusAddress(K, "inviter").id).toMatchInlineSnapshot(`"4e833c88874bad391e79fc229dd7eec19b0dd8a5a1a44705d9fe0fdfb815faf0"`);
  });

  it("keeps every id, token and key apart", () => {
    const K = pairKey(S, R);
    const invite = { ...inviteLocation(S), token: "" };
    const handshake = handshakeAddress(S, K);
    const mine = statusAddress(K, "inviter");
    const theirs = statusAddress(K, "joiner");
    const values = [invite, handshake, mine, theirs].flatMap((box) => [box.id, box.token, bytesToHex(box.key)]);
    values.push(bytesToHex(K), bytesToHex(S), bytesToHex(R));
    expect(new Set(values).size).toBe(values.length);
  });

  it("lets the inviter find the handshake from S alone, while its token needs K", () => {
    const K = pairKey(S, R);
    const located = handshakeLocation(S);
    const full = handshakeAddress(S, K);
    expect(located.id).toBe(full.id);
    expect(bytesToHex(located.key)).toBe(bytesToHex(full.key));
    const otherJoiner = handshakeAddress(S, pairKey(S, hexToBytes("33".repeat(32))));
    expect(otherJoiner.id).toBe(full.id);
    expect(otherJoiner.token).not.toBe(full.token);
  });
});

describe("key exchange", () => {
  it("gives both sides the same secret, and anyone else a different one", async () => {
    const inviter = await newExchangeKeys();
    const joiner = await newExchangeKeys();
    const stranger = await newExchangeKeys();
    const ours = await exchangeSecret(joiner.privateKey, inviter.publicKey);
    const theirs = await exchangeSecret(inviter.privateKey, joiner.publicKey);
    expect(bytesToHex(ours)).toBe(bytesToHex(theirs));
    expect(ours).toHaveLength(32);
    // Someone with both public keys (both are in boxes anyone with the link can open) gets nowhere.
    expect(bytesToHex(await exchangeSecret(stranger.privateKey, joiner.publicKey))).not.toBe(bytesToHex(ours));
    expect(bytesToHex(pairKey(S, ours))).not.toBe(bytesToHex(pairKey(S, await exchangeSecret(stranger.privateKey, inviter.publicKey))));
  });

  it("lets only the holder of the invite's private key write its box, and fingerprints its public key", async () => {
    const one = await newExchangeKeys();
    const two = await newExchangeKeys();
    // Same address and seal key for anyone with S; the write token needs the private half.
    expect(inviteAddress(S, one.privateKey).id).toBe(inviteLocation(S).id);
    expect(inviteAddress(S, one.privateKey).token).not.toBe(inviteAddress(S, two.privateKey).token);
    expect(keyFingerprint(one.publicKey)).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(keyFingerprint(one.publicKey)).not.toBe(keyFingerprint(two.publicKey));
  });

  it("refuses a public key that is not a point on the curve", async () => {
    const mine = await newExchangeKeys();
    expect(isExchangePublicKey(mine.publicKey)).toBe(true);
    const bad = toBase64Url(new Uint8Array(65).fill(4));
    expect(isExchangePublicKey(bad)).toBe(true);
    await expect(exchangeSecret(mine.privateKey, bad)).rejects.toBeInstanceOf(BadExchangeKeyError);
    expect(isExchangePublicKey("short")).toBe(false);
    await expect(exchangeSecret(mine.privateKey, "short")).rejects.toBeInstanceOf(BadExchangeKeyError);
  });
});

describe("boxes", () => {
  it("seal any message to the same length", async () => {
    const key = inviteLocation(S).key;
    const short = await sealBox(key, { t: "x" });
    const long = await sealBox(key, { t: "x", text: "é".repeat(600) });
    expect(short.ciphertext).toHaveLength(BOX_CIPHERTEXT_LENGTH);
    expect(long.ciphertext).toHaveLength(BOX_CIPHERTEXT_LENGTH);
    expect(short.nonce).toHaveLength(NONCE_LENGTH);
    expect(await openBox(key, long)).toEqual({ t: "x", text: "é".repeat(600) });
  });

  it("refuse a message that does not fit", async () => {
    await expect(sealBox(inviteLocation(S).key, { text: "x".repeat(2100) })).rejects.toBeInstanceOf(BoxTooLargeError);
  });

  it("do not open with another box's key", async () => {
    const K = pairKey(S, R);
    const sealed = await sealBox(statusAddress(K, "inviter").key, { ok: true });
    await expect(openBox(statusAddress(K, "joiner").key, sealed)).rejects.toThrow();
  });

  it("pad the friend book in steps", async () => {
    const key = hexToBytes("44".repeat(32));
    const small = await sealBook(key, { a: 1 });
    expect(small.ciphertext).toHaveLength(sealedBase64Length(4096));
    const bigger = await sealBook(key, { a: "x".repeat(5000) });
    expect(bigger.ciphertext).toHaveLength(sealedBase64Length(8192));
    expect(await openBook(key, bigger)).toEqual({ a: "x".repeat(5000) });
  });
});

describe("URL-safe base64", () => {
  it("round-trips 32 bytes in 43 characters", () => {
    const text = toBase64Url(hexToBytes("fb".repeat(32)));
    expect(text).toHaveLength(43);
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(bytesToHex(fromBase64Url(text)!)).toBe("fb".repeat(32));
    expect(fromBase64Url("not/valid+")).toBeNull();
  });
});
