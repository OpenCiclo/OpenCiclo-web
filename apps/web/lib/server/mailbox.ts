// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { timingSafeEqual, randomInt } from "node:crypto";

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";

import { bytesToHex, hexToBytes, utf8ToBytes } from "@/lib/crypto/bytes";
import { requireSecret } from "@/lib/server/env";

export const MAILBOX_CODE_TTL_MS = 15 * 60 * 1000;
export const MAILBOX_CODE_MAX_ATTEMPTS = 5;
export const MAILBOX_SEND_MAX_PER_HOUR = 3;
// "Code sent" answers never come back sooner than this, whether or not a mail
// was really sent, so response time does not reveal that an email is taken.
// Above the usual mail-provider latency.
export const MAILBOX_PENDING_MIN_RESPONSE_MS = 1500;

export type MailboxRegisterAction = "update-wrap" | "reject-taken" | "start-pending";

export function mailboxRegisterAction(args: {
  existingMailbox: { accountId: string } | null;
  accountId: string;
}): MailboxRegisterAction {
  if (!args.existingMailbox) return "start-pending";
  if (args.existingMailbox.accountId === args.accountId) return "update-wrap";
  return "reject-taken";
}

export function mailboxIsFetchable(row: {
  wrappedSecret: string | null | undefined;
  verifiedAt: Date | null | undefined;
}): boolean {
  return Boolean(row.wrappedSecret) && row.verifiedAt != null;
}

export function parseMailboxCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) return null;
  return digits;
}

export function parseMailLocale(raw: unknown): "es" | "en" {
  return raw === "en" ? "en" : "es";
}

// The longest address SMTP can deliver to (RFC 5321).
export const MAILBOX_EMAIL_MAX_LENGTH = 254;
// Whitespace, control characters, and the RFC 5322 specials other than "@".
// A mailer reads these as display names, comments, groups, or lists, so they
// could make it deliver to a different address than the one we hash.
const EMAIL_FORBIDDEN = /[\s\p{Cc}()<>[\]\\,;:"]/u;

/**
 * Normalizes a signup email the same way as the HMAC lookup (trim, lowercase)
 * and accepts only one plain `local@domain` address. Browsers already reject
 * these shapes in `type="email"` inputs; this stops direct API callers.
 */
export function parseMailboxEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > MAILBOX_EMAIL_MAX_LENGTH || EMAIL_FORBIDDEN.test(email)) return null;
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return null;
  const domainLabels = email.slice(at + 1).split(".");
  return domainLabels.every((label) => label.length > 0) ? email : null;
}

export function generateMailboxCode(): string {
  return String(randomInt(100000, 1000000));
}

export function hashMailboxCode(code: string): string {
  const secret = requireSecret("EMAIL_LOOKUP_SECRET");
  return bytesToHex(hmac(sha256, utf8ToBytes(secret), utf8ToBytes(`mailbox-code:${code}`)));
}

export function mailboxCodesEqual(leftHash: string, rightHash: string): boolean {
  try {
    const left = hexToBytes(leftHash);
    const right = hexToBytes(rightHash);
    if (left.length !== right.length || left.length === 0) return false;
    return timingSafeEqual(Buffer.from(left), Buffer.from(right));
  } catch {
    return false;
  }
}

export function pendingIsExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function shouldInvalidatePending(args: { attemptCount: number; expired: boolean }): boolean {
  return args.expired || args.attemptCount >= MAILBOX_CODE_MAX_ATTEMPTS;
}
