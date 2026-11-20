// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Keys and addresses for Friends. HKDF-SHA-256, AES-256-GCM (lib/crypto/aes.ts)
// and an ECDH P-256 exchange (WebCrypto), no other primitive:
//
//   S  32 random bytes the inviter puts in the invite link's fragment (never
//      sent to the host). Gives the invite box and the handshake box.
//   A  an ECDH key pair the inviter makes for this invite: the private half
//      stays in the inviter's sealed friend book, the public half goes in the
//      invite box.
//   B  an ECDH key pair the joiner makes when accepting: its public half goes
//      in the handshake box, its private half is used once and dropped.
//   K  = HKDF(S ‖ ECDH(A, B)): the pair key. Gives one status box per direction.
//
// Anyone holding the link can open the invite and handshake boxes (they are
// sealed under S) and see both public keys, but not K: that needs one of the
// private halves. So the link alone never reads or writes the pair's statuses.
//
// Each box has an id (its address; the host stores SHA-256 of it), a write
// token (the host stores SHA-256 of it and lets only its holder replace or
// delete the box) and a seal key. All are separate derivations; S, the shared
// secret and K are never used as keys directly. The handshake token comes from
// K, so only the joiner who made B can ever replace the handshake box, and a
// second person with the same link gets 409.
//
// Labels are part of the format: changing one breaks every friendship.

import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";

import { decryptAesGcm, encryptAesGcm } from "@/lib/crypto/aes";
import { base64ToBytes, bytesToBase64, bytesToHex, bytesToUtf8, toBufferSource, utf8ToBytes } from "@/lib/crypto/bytes";
import {
  BOOK_PAD_STEP_BYTES,
  BOX_PLAINTEXT_BYTES,
  MAX_BOOK_PLAINTEXT_BYTES,
} from "@/lib/friends/limits";

export const SECRET_BYTES = 32;

export type PairRole = "inviter" | "joiner";

export type Sealed = { ciphertext: string; nonce: string };

/** Where a box lives and how to write and open it. `id` and `token` are hex. */
export type BoxAddress = { id: string; token: string; key: Uint8Array };

/** A message that does not fit in a box, even after the caller shortened it. */
export class BoxTooLargeError extends Error {
  constructor() {
    super("The message does not fit in a box");
    this.name = "BoxTooLargeError";
  }
}

export function randomSecret(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SECRET_BYTES));
}

function derive(ikm: Uint8Array, label: string): Uint8Array {
  return hkdf(sha256, ikm, undefined, utf8ToBytes(label), 32);
}

function deriveHex(ikm: Uint8Array, label: string): string {
  return bytesToHex(derive(ikm, label));
}

export function inviteAddress(secret: Uint8Array): BoxAddress {
  return {
    id: deriveHex(secret, "ciclo-friends-invite-id-v1"),
    token: deriveHex(secret, "ciclo-friends-invite-token-v1"),
    key: derive(secret, "ciclo-friends-invite-seal-v1"),
  };
}

/**
 * The handshake box: its id and seal key come from S (the inviter can find and
 * open it before knowing R); its write token from K (only the joiner has it).
 */
export function handshakeAddress(secret: Uint8Array, pair: Uint8Array): BoxAddress {
  return { ...handshakeLocation(secret), token: deriveHex(pair, "ciclo-friends-handshake-token-v1") };
}

/** What the inviter needs to read the handshake box. */
export function handshakeLocation(secret: Uint8Array): { id: string; key: Uint8Array } {
  return {
    id: deriveHex(secret, "ciclo-friends-handshake-id-v1"),
    key: derive(secret, "ciclo-friends-handshake-seal-v1"),
  };
}

/** K from the invite secret and the ECDH shared secret of the two key pairs. */
export function pairKey(secret: Uint8Array, shared: Uint8Array): Uint8Array {
  const ikm = new Uint8Array(secret.length + shared.length);
  ikm.set(secret, 0);
  ikm.set(shared, secret.length);
  return derive(ikm, "ciclo-friends-pair-v1");
}

const ECDH = { name: "ECDH", namedCurve: "P-256" } as const;

/** An ECDH P-256 key pair: private half as PKCS#8, public half raw (65 bytes), both URL-safe base64. */
export type ExchangeKeys = { privateKey: string; publicKey: string };

/** A public key read from a message that is not one (wrong length or not on the curve). */
export class BadExchangeKeyError extends Error {
  constructor() {
    super("Not an exchange key");
    this.name = "BadExchangeKeyError";
  }
}

export async function newExchangeKeys(): Promise<ExchangeKeys> {
  const pair = await crypto.subtle.generateKey(ECDH, true, ["deriveBits"]);
  const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
  const publicKey = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  return { privateKey: toBase64Url(privateKey), publicKey: toBase64Url(publicKey) };
}

/** Whether `value` looks like a raw P-256 public key (uncompressed point, 65 bytes). */
export function isExchangePublicKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{87}$/.test(value)) return false;
  const bytes = fromBase64Url(value);
  return bytes !== null && bytes.length === 65 && bytes[0] === 0x04;
}

/** The 32-byte ECDH shared secret of our private key and their public key. */
export async function exchangeSecret(privateKey: string, peerPublicKey: string): Promise<Uint8Array> {
  const privateBytes = fromBase64Url(privateKey);
  const publicBytes = isExchangePublicKey(peerPublicKey) ? fromBase64Url(peerPublicKey) : null;
  if (!privateBytes || !publicBytes) throw new BadExchangeKeyError();
  let ours: CryptoKey;
  let theirs: CryptoKey;
  try {
    ours = await crypto.subtle.importKey("pkcs8", toBufferSource(privateBytes), ECDH, false, ["deriveBits"]);
    theirs = await crypto.subtle.importKey("raw", toBufferSource(publicBytes), ECDH, false, []);
  } catch {
    throw new BadExchangeKeyError();
  }
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: theirs }, ours, 256));
}

/** The status box written by `role`: only that side has its token. */
export function statusAddress(pair: Uint8Array, role: PairRole): BoxAddress {
  return {
    id: deriveHex(pair, `ciclo-friends-status-id-v1:${role}`),
    token: deriveHex(pair, `ciclo-friends-status-token-v1:${role}`),
    key: derive(pair, `ciclo-friends-status-seal-v1:${role}`),
  };
}

export function otherRole(role: PairRole): PairRole {
  return role === "inviter" ? "joiner" : "inviter";
}

const SPACE = 0x20;

/** JSON padded with spaces to `size` bytes. JSON.parse ignores the trailing spaces. */
function padJson(value: unknown, size: number): Uint8Array {
  const json = utf8ToBytes(JSON.stringify(value));
  if (json.length > size) throw new BoxTooLargeError();
  const padded = new Uint8Array(size).fill(SPACE);
  padded.set(json, 0);
  return padded;
}

/** Seals a message in exactly BOX_PLAINTEXT_BYTES bytes of plaintext. */
export async function sealBox(key: Uint8Array, value: unknown): Promise<Sealed> {
  return encryptAesGcm(key, padJson(value, BOX_PLAINTEXT_BYTES));
}

/** Opens a box. Throws when the key is wrong or the box was changed. */
export async function openBox(key: Uint8Array, sealed: Sealed): Promise<unknown> {
  return JSON.parse(bytesToUtf8(await decryptAesGcm(key, sealed.ciphertext, sealed.nonce)));
}

/** Seals the friend book, padded up to a whole BOOK_PAD_STEP_BYTES step. */
export async function sealBook(key: Uint8Array, value: unknown): Promise<Sealed> {
  const length = utf8ToBytes(JSON.stringify(value)).length;
  const size = Math.max(1, Math.ceil(length / BOOK_PAD_STEP_BYTES)) * BOOK_PAD_STEP_BYTES;
  if (size > MAX_BOOK_PLAINTEXT_BYTES) throw new BoxTooLargeError();
  return encryptAesGcm(key, padJson(value, size));
}

export async function openBook(key: Uint8Array, sealed: Sealed): Promise<unknown> {
  return openBox(key, sealed);
}

/** URL-safe base64 without padding: how secrets travel in links and in the book. */
export function toBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The bytes of a URL-safe base64 string, or null when it is not one. */
export function fromBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  const standard = value.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return base64ToBytes(standard + "=".repeat((4 - (standard.length % 4)) % 4));
  } catch {
    return null;
  }
}

/** A random id for a person (inside sealed messages) or a book entry. 128 bits, hex. */
export function randomId(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}
