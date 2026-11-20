// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { bytesToHex, hexToBytes } from "@/lib/crypto/bytes";

import { inviteCode, inviteLink, parseInvite } from "./invite";

const SECRET = hexToBytes("a5".repeat(32));
const FINGERPRINT = "AbCdEfGhIjKlMnOpQrStUv";

describe("invites", () => {
  it("put the secret and the key fingerprint in the link's fragment, never in its path or query", () => {
    const link = inviteLink("https://www.openciclo.com/", SECRET, FINGERPRINT);
    const url = new URL(link);
    expect(url.pathname).toBe("/friends/join");
    expect(url.search).toBe("");
    expect(url.hash).toBe(`#${inviteCode(SECRET, FINGERPRINT)}`);
  });

  it("read a pasted link or a bare code, even split by spaces or line breaks", () => {
    const code = inviteCode(SECRET, FINGERPRINT);
    for (const text of [
      code,
      ` ${code}\n`,
      inviteLink("https://example.test", SECRET, FINGERPRINT),
      `${code.slice(0, 20)}\n${code.slice(20)}`,
    ]) {
      const parsed = parseInvite(text);
      expect(bytesToHex(parsed!.secret)).toBe("a5".repeat(32));
      expect(parsed!.fingerprint).toBe(FINGERPRINT);
    }
  });

  it("refuse anything else, including a code without the fingerprint", () => {
    const secretOnly = inviteCode(SECRET, FINGERPRINT).split(".").slice(0, 2).join(".");
    for (const text of ["", "hello", "v2.abc", "v1.short", secretOnly, `${secretOnly}.short`, `${inviteCode(SECRET, FINGERPRINT)}.extra`]) {
      expect(parseInvite(text)).toBeNull();
    }
  });
});
