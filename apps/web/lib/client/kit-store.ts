// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { HttpError, accountHeader, rejectAccountMismatch } from "@/lib/client/api";
import { UpdateRequiredError, apiFetch } from "@/lib/client/http";
import { UnsupportedKitError, unwrapMnemonic, type WrappedKit } from "@/lib/crypto/wrap";
import type { Locale } from "@/lib/i18n";

const KITS_KEY = "ciclo.kits";
const LAST_EMAIL_KEY = "ciclo.lastEmail";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

export class MailNotConfiguredError extends Error {
  constructor() {
    super("MAIL_NOT_CONFIGURED");
    this.name = "MailNotConfiguredError";
  }
}

export class RateLimitedError extends Error {
  constructor() {
    super("RATE_LIMITED");
    this.name = "RateLimitedError";
  }
}

export class InvalidConfirmError extends Error {
  constructor() {
    super("INVALID_CONFIRM");
    this.name = "InvalidConfirmError";
  }
}

function hasBrowserStorage() {
  return typeof window !== "undefined";
}

function loadAll(): Record<string, WrappedKit> {
  if (!hasBrowserStorage()) return {};
  try {
    const raw = localStorage.getItem(KITS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, WrappedKit>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const at = normalized.indexOf("@");
  if (at <= 0 || at === normalized.length - 1) return "***";
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  return `${local.charAt(0)}***@${domain}`;
}

export function saveLocalKit(email: string, kit: WrappedKit) {
  if (!hasBrowserStorage()) return;
  const normalized = normalizeEmail(email);
  const all = loadAll();
  all[normalized] = kit;
  localStorage.setItem(KITS_KEY, JSON.stringify(all));
  localStorage.setItem(LAST_EMAIL_KEY, normalized);
}

export function loadLocalKit(email: string): WrappedKit | null {
  return loadAll()[normalizeEmail(email)] ?? null;
}

export function lastEmail(): string {
  if (!hasBrowserStorage()) return "";
  return localStorage.getItem(LAST_EMAIL_KEY) ?? "";
}

export function clearLocalKits() {
  if (!hasBrowserStorage()) return;
  localStorage.removeItem(KITS_KEY);
  localStorage.removeItem(LAST_EMAIL_KEY);
}

export async function fetchRemoteKit(email: string): Promise<WrappedKit> {
  const response = await apiFetch("/api/recovery/fetch", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: normalizeEmail(email) }),
  });
  // The server answers every email the same way (decoy kit if there is no
  // account), so only the rate limit gets its own message. A 5xx says nothing
  // about the email either: it is the host failing, not a wrong password.
  if (response.status === 429) throw new RateLimitedError();
  if (response.status >= 500) throw new HttpError(response.status, `HTTP ${response.status}`);
  if (!response.ok) throw new InvalidCredentialsError();
  return (await response.json()) as WrappedKit;
}

/**
 * POST /api/recovery/register: stores `kit` for `email` on the signed-in account
 * (a new address gets a 6-digit code mail; `pending: false` means the address was
 * already this account's and its kit was replaced). `account`: the public-key hash
 * of the wallet whose phrase `kit` wraps; the host refuses (AccountMismatchError)
 * when its session is another account's.
 */
export async function postRecoveryKit(
  email: string,
  kit: WrappedKit,
  locale: Locale,
  account: string,
): Promise<{ pending: boolean }> {
  const response = await apiFetch("/api/recovery/register", {
    method: "POST",
    headers: { "content-type": "application/json", ...accountHeader(account) },
    body: JSON.stringify({ email, locale, ...kit }),
  });
  if (response.status === 503) throw new MailNotConfiguredError();
  if (response.status === 429) throw new RateLimitedError();
  await rejectAccountMismatch(response);
  // HttpError: a 401 (session expired) signs in again and retries (retryAfterSignInOnce),
  // like the AccountMismatchError above.
  if (!response.ok) throw new HttpError(response.status, "Recovery kit was not saved");
  const payload = (await response.json()) as { pending?: boolean };
  return { pending: payload.pending !== false };
}

/** POST /api/recovery/confirm with the 6-digit code, for the account `account` names (see postRecoveryKit). */
export async function confirmRecoveryCode(code: string, account: string) {
  const response = await apiFetch("/api/recovery/confirm", {
    method: "POST",
    headers: { "content-type": "application/json", ...accountHeader(account) },
    body: JSON.stringify({ code }),
  });
  // No session (the app was closed, its cookie not kept), a session for another
  // account, or the host failing is not a wrong code: the first two sign in again,
  // the last is reported as it is.
  await rejectAccountMismatch(response);
  if (response.status === 401 || response.status >= 500) {
    throw new HttpError(response.status, "Could not confirm");
  }
  if (!response.ok) throw new InvalidConfirmError();
}

type OpenKitDeps = {
  loadLocal: (email: string) => WrappedKit | null;
  fetchRemote: (email: string) => Promise<WrappedKit>;
  unwrap: (kit: WrappedKit, password: string) => Promise<string>;
};

const defaultOpenKitDeps: OpenKitDeps = {
  loadLocal: loadLocalKit,
  fetchRemote: fetchRemoteKit,
  unwrap: unwrapMnemonic,
};

/**
 * Opens the phrase with an email and password. Tries the kit cached on this
 * device first; when it does not open (the password may have been changed on
 * another device), asks the host for its kit. Only a kit that does not open is
 * "wrong email or password" (InvalidCredentialsError; a decoy never opens, so
 * unknown emails look the same). A kit with parameters this build does not take
 * asks for an update. Network and host failures are thrown as they come. The
 * caller saves `kit` on this device only once the sign-in it opens succeeds.
 */
export async function openKit(
  email: string,
  password: string,
  deps: OpenKitDeps = defaultOpenKitDeps,
): Promise<{ mnemonic: string; kit: WrappedKit }> {
  const normalized = normalizeEmail(email);
  const cached = deps.loadLocal(normalized);
  if (cached) {
    try {
      return { mnemonic: await deps.unwrap(cached, password), kit: cached };
    } catch (cause) {
      if (cause instanceof UnsupportedKitError) throw new UpdateRequiredError("kit");
      // Fall through to the host's kit.
    }
  }
  const kit = await deps.fetchRemote(normalized);
  try {
    return { mnemonic: await deps.unwrap(kit, password), kit };
  } catch (cause) {
    if (cause instanceof UnsupportedKitError) throw new UpdateRequiredError("kit");
    throw new InvalidCredentialsError();
  }
}
