// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The invite a person sends a friend: a code `v1.<S>.<F>` (S: 32 random bytes;
// F: the fingerprint of the invite's public exchange key, lib/friends/crypto.ts
// keyFingerprint; both URL-safe base64) and a link that carries it in the
// fragment, which browsers never send to a server. Either can be pasted in the
// app. The joiner accepts only an invite box whose public key matches F.

import { fromBase64Url, SECRET_BYTES, toBase64Url } from "@/lib/friends/crypto";

const PREFIX = "v1.";
const FINGERPRINT = /^[A-Za-z0-9_-]{22}$/;

/** The join page; the code goes after `#`. */
export const JOIN_PATH = "/friends/join";

export type ParsedInvite = { secret: Uint8Array; fingerprint: string };

export function inviteCode(secret: Uint8Array, fingerprint: string): string {
  return `${PREFIX}${toBase64Url(secret)}.${fingerprint}`;
}

export function inviteLink(origin: string, secret: Uint8Array, fingerprint: string): string {
  return `${origin.replace(/\/+$/, "")}${JOIN_PATH}#${inviteCode(secret, fingerprint)}`;
}

/**
 * The secret and key fingerprint in a pasted code or link, or null when the
 * text holds none. Spaces and line breaks (a code split by a chat app) are ignored.
 */
export function parseInvite(text: string): ParsedInvite | null {
  const compact = text.replace(/\s+/g, "");
  const hash = compact.lastIndexOf("#");
  const code = hash >= 0 ? compact.slice(hash + 1) : compact;
  if (!code.startsWith(PREFIX)) return null;
  const [secretText, fingerprint, ...rest] = code.slice(PREFIX.length).split(".");
  if (rest.length > 0 || !fingerprint || !FINGERPRINT.test(fingerprint)) return null;
  const secret = fromBase64Url(secretText);
  if (!secret || secret.length !== SECRET_BYTES) return null;
  return { secret, fingerprint };
}
