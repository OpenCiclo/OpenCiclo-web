// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from "vitest";

import {
  hashMailboxCode,
  mailboxCodesEqual,
  mailboxIsFetchable,
  MAILBOX_EMAIL_MAX_LENGTH,
  mailboxRegisterAction,
  parseMailboxCode,
  parseMailboxEmail,
  pendingIsExpired,
  shouldInvalidatePending,
} from "./mailbox";

describe("mailbox confirmation", () => {
  afterEach(() => {
    delete process.env.EMAIL_LOOKUP_SECRET;
  });

  it("does not claim a mailbox until confirm (start-pending)", () => {
    expect(mailboxRegisterAction({ existingMailbox: null, accountId: "a" })).toBe("start-pending");
  });

  it("updates wrap on the account's own mailbox without a new code", () => {
    expect(
      mailboxRegisterAction({ existingMailbox: { accountId: "a" }, accountId: "a" }),
    ).toBe("update-wrap");
  });

  it("does not send mail when another account already claimed the lookup", () => {
    expect(
      mailboxRegisterAction({ existingMailbox: { accountId: "bob" }, accountId: "alice" }),
    ).toBe("reject-taken");
  });

  it("fetch ignores pending or unverified kits", () => {
    expect(mailboxIsFetchable({ wrappedSecret: "wrapped", verifiedAt: null })).toBe(false);
    expect(mailboxIsFetchable({ wrappedSecret: null, verifiedAt: new Date() })).toBe(false);
  });

  it("fetch returns a verified mailbox kit", () => {
    expect(mailboxIsFetchable({ wrappedSecret: "wrapped", verifiedAt: new Date() })).toBe(true);
  });

  it("parses a 6-digit code and rejects other shapes", () => {
    expect(parseMailboxCode("123456")).toBe("123456");
    expect(parseMailboxCode(" 12 3456 ")).toBe("123456");
    expect(parseMailboxCode("12345")).toBeNull();
    expect(parseMailboxCode("abcdef")).toBeNull();
    expect(parseMailboxCode(123456)).toBeNull();
  });

  it("accepts one plain address, normalized like the HMAC lookup", () => {
    expect(parseMailboxEmail("  Ana.Perez+ciclo@Example.ES ")).toBe("ana.perez+ciclo@example.es");
    expect(parseMailboxEmail("o'brien@mail.example.com")).toBe("o'brien@mail.example.com");
    expect(parseMailboxEmail("josé@ñandú.es")).toBe("josé@ñandú.es");
    expect(parseMailboxEmail("dev@localhost")).toBe("dev@localhost");
  });

  it("rejects shapes a mailer would read as another recipient", () => {
    for (const raw of [
      "Victim (x(y) <evil@evil.com>) <v@victim.com>",
      "v@victim.com (comment)",
      "<evil@evil.com>",
      '"a>b"@evil.com',
      "a@victim.com, b@evil.com",
      "a@victim.com;b@evil.com",
      "group: a@victim.com;",
      "a b@victim.com",
      "a@victim.com\r\nBcc: b@evil.com",
      "a@[127.0.0.1]",
      "a\\@b@evil.com",
    ]) {
      expect(parseMailboxEmail(raw), raw).toBeNull();
    }
  });

  it("rejects missing or extra @, empty domain labels, and non-strings", () => {
    for (const raw of [
      "",
      "plain",
      "@example.com",
      "a@",
      "a@@example.com",
      "a@b@example.com",
      "a@.example.com",
      "a@example..com",
      "a@example.com.",
    ]) {
      expect(parseMailboxEmail(raw), raw).toBeNull();
    }
    expect(parseMailboxEmail(42)).toBeNull();
    expect(parseMailboxEmail(undefined)).toBeNull();
  });

  it("caps the length at what SMTP can deliver", () => {
    const longest = `${"a".repeat(64)}@${"b".repeat(MAILBOX_EMAIL_MAX_LENGTH - 69)}.com`;
    expect(longest).toHaveLength(MAILBOX_EMAIL_MAX_LENGTH);
    expect(parseMailboxEmail(longest)).toBe(longest);
    expect(parseMailboxEmail(`a${longest}`)).toBeNull();
    expect(parseMailboxEmail(`${"a".repeat(100_000)}@example.com`)).toBeNull();
  });

  it("hashes codes with HMAC and compares in constant time", () => {
    process.env.EMAIL_LOOKUP_SECRET = "test-email-hmac-secret";
    const hash = hashMailboxCode("123456");
    expect(hash).not.toContain("123456");
    expect(hash).toHaveLength(64);
    expect(mailboxCodesEqual(hash, hashMailboxCode("123456"))).toBe(true);
    expect(mailboxCodesEqual(hash, hashMailboxCode("000000"))).toBe(false);
  });

  it("invalidates pending after expiry or too many attempts", () => {
    expect(shouldInvalidatePending({ attemptCount: 4, expired: false })).toBe(false);
    expect(shouldInvalidatePending({ attemptCount: 5, expired: false })).toBe(true);
    expect(shouldInvalidatePending({ attemptCount: 1, expired: true })).toBe(true);
    expect(pendingIsExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(pendingIsExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});
