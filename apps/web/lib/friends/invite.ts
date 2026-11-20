// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The invite a person sends a friend: a code `v1.<S>` (S: 32 random bytes,
// URL-safe base64) and a link that carries it in the fragment, which browsers
// never send to a server. Either can be pasted in the app.

import { fromBase64Url, SECRET_BYTES, toBase64Url } from "@/lib/friends/crypto";

const PREFIX = "v1.";

/** The join page; the code goes after `#`. */
export const JOIN_PATH = "/friends/join";

export function inviteCode(secret: Uint8Array): string {
  return `${PREFIX}${toBase64Url(secret)}`;
}

export function inviteLink(origin: string, secret: Uint8Array): string {
  return `${origin.replace(/\/+$/, "")}${JOIN_PATH}#${inviteCode(secret)}`;
}

/**
 * The secret in a pasted code or link, or null when the text holds none.
 * Spaces and line breaks (a code split by a chat app) are ignored.
 */
export function parseInvite(text: string): Uint8Array | null {
  const compact = text.replace(/\s+/g, "");
  const hash = compact.lastIndexOf("#");
  const code = hash >= 0 ? compact.slice(hash + 1) : compact;
  if (!code.startsWith(PREFIX)) return null;
  const secret = fromBase64Url(code.slice(PREFIX.length));
  if (!secret || secret.length !== SECRET_BYTES) return null;
  return secret;
}
