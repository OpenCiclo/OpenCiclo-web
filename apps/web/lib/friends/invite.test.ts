// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { bytesToHex, hexToBytes } from "@/lib/crypto/bytes";

import { inviteCode, inviteLink, parseInvite } from "./invite";

const SECRET = hexToBytes("a5".repeat(32));

describe("invites", () => {
  it("put the secret in the link's fragment, never in its path or query", () => {
    const link = inviteLink("https://www.openciclo.com/", SECRET);
    const url = new URL(link);
    expect(url.pathname).toBe("/friends/join");
    expect(url.search).toBe("");
    expect(url.hash).toBe(`#${inviteCode(SECRET)}`);
  });

  it("read a pasted link or a bare code, even split by spaces or line breaks", () => {
    const code = inviteCode(SECRET);
    for (const text of [code, ` ${code}\n`, inviteLink("https://example.test", SECRET), `${code.slice(0, 20)}\n${code.slice(20)}`]) {
      expect(bytesToHex(parseInvite(text)!)).toBe("a5".repeat(32));
    }
  });

  it("refuse anything else", () => {
    for (const text of ["", "hello", "v2.abc", "v1.short", `v1.${"A".repeat(44)}`, "https://example.test/friends/join"]) {
      expect(parseInvite(text)).toBeNull();
    }
  });
});
