// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { unstable_rethrow } from "next/navigation";

import { appUrl, jsonError } from "@/lib/server/env";

/** Most request bodies are a few hundred bytes (kits, codes, keys). */
export const DEFAULT_MAX_JSON_BYTES = 64 * 1024;

export type JsonBody = Record<string, unknown>;

/**
 * The body as text, or null once it passes `maxBytes`. Reads the stream itself,
 * so a chunked body with no Content-Length is cut off at the cap too, instead
 * of being buffered whole first.
 */
async function readTextWithin(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Reads a JSON object body. Answers 415 unless the request says
 * `Content-Type: application/json` (a cross-site form cannot send that without
 * a preflight), 413 when the body is over `maxBytes` (by Content-Length, or
 * while reading a body sent without one), and 400 for malformed JSON or
 * anything but an object. Only routes that take a body call it: logout and
 * `DELETE /api/account` have none.
 */
export async function readJson(
  request: Request,
  maxBytes = DEFAULT_MAX_JSON_BYTES,
): Promise<{ ok: true; body: JsonBody } | { ok: false; response: Response }> {
  const type = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (type !== "application/json") {
    return { ok: false, response: jsonError("Expected application/json", 415) };
  }
  const tooLarge = () => ({ ok: false as const, response: jsonError("Request too large", 413) });
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes) return tooLarge();
  const text = await readTextWithin(request, maxBytes);
  if (text === null) return tooLarge();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, response: jsonError("Invalid JSON", 400) };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, response: jsonError("Expected a JSON object", 400) };
  }
  return { ok: true, body: body as JsonBody };
}

const SAFE_CODE = /^[A-Za-z0-9_.-]{1,48}$/;

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && SAFE_CODE.test(code) ? code : null;
}

function errorName(error: unknown): string {
  if (error instanceof Error && SAFE_CODE.test(error.name)) return error.name;
  return typeof error;
}

/**
 * A log line for a failed request: error names and codes only (for example
 * `DrizzleQueryError <- PostgresError 23505`). Never the message: drizzle puts
 * the SQL and its parameters there (ciphertext, kits, HMACs), and Postgres puts
 * row values in `detail`.
 */
export function describeError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current; depth += 1) {
    const code = errorCode(current);
    parts.push(code ? `${errorName(current)} ${code}` : errorName(current));
    current = current instanceof Error ? current.cause : undefined;
  }
  return parts.join(" <- ");
}

/**
 * Wraps a route handler: an unexpected error becomes a plain 500 and a log line
 * from `describeError`, instead of Next logging the whole error (drizzle's
 * message holds the query parameters). Next's own control-flow errors are
 * rethrown.
 */
export function apiRoute<Rest extends unknown[]>(
  handler: (request: Request, ...rest: Rest) => Promise<Response>,
): (request: Request, ...rest: Rest) => Promise<Response> {
  return async (request: Request, ...rest: Rest) => {
    try {
      return await handler(request, ...rest);
    } catch (error) {
      unstable_rethrow(error);
      console.error(`API ${request.method} ${new URL(request.url).pathname} failed: ${describeError(error)}`);
      return jsonError("Server error", 500);
    }
  };
}

/** The Android app's WebView origin (Capacitor serves the bundle from https://localhost). */
export const ANDROID_APP_ORIGIN = "https://localhost";

/** The iOS app's WebView origin (a WKWebView cannot serve https itself, so Capacitor uses its own scheme). */
export const IOS_APP_ORIGIN = "capacitor://localhost";

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * For requests that change state without a body (logout): a missing Origin is
 * accepted (the apps' native HTTP may send none, and so do some same-origin
 * requests); otherwise it must be this host, APP_URL, or one of the apps.
 */
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  return (
    origin === originOf(request.url) ||
    origin === originOf(appUrl()) ||
    origin === ANDROID_APP_ORIGIN ||
    origin === IOS_APP_ORIGIN
  );
}
