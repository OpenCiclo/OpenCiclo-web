// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@/lib/crypto/bytes";

/**
 * A setting the host needs is missing. `code` (for example
 * `SESSION_SECRET_MISSING`) names only the variable, never its value, so the
 * API's error log (`describeError`) prints it.
 */
export class ConfigError extends Error {
  readonly code: string;
  constructor(variable: string) {
    super(`${variable} is not set`);
    this.name = "ConfigError";
    this.code = `${variable}_MISSING`;
  }
}

export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ConfigError(name);
  }
  return value;
}

export function appUrl(): string {
  return process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function mailFrom(): string {
  return process.env.MAIL_FROM ?? "Ciclo <noreply@localhost>";
}

export function emailLookup(email: string): string {
  const secret = requireSecret("EMAIL_LOOKUP_SECRET");
  const normalized = email.trim().toLowerCase();
  return bytesToHex(hmac(sha256, utf8ToBytes(secret), utf8ToBytes(normalized)));
}

export function hashIp(ip: string): string {
  const secret = requireSecret("EMAIL_LOOKUP_SECRET");
  return bytesToHex(hmac(sha256, utf8ToBytes(secret), utf8ToBytes(ip)));
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
