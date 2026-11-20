// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The host calls for Friends (app/api/friends/**), all through apiFetch. Every
// call names its account (x-ciclo-account): a session that is another
// account's answers 409 account-mismatch (AccountMismatchError), nothing done.

import { accountHeader, HttpError, rejectAccountMismatch } from "@/lib/client/api";
import { apiFetch, type ApiRequestInit } from "@/lib/client/http";
import type { Sealed } from "@/lib/friends/crypto";
import type { BoxKind } from "@/lib/friends/limits";

export type SealedBook = Sealed & { version: number };

export type PutBookResult = { ok: true; version: number } | { ok: false; current: SealedBook | null };

/** What the sync code needs from the host. Tests pass an in-memory one. */
export type FriendsApi = {
  getBook(account: string): Promise<SealedBook | null>;
  putBook(sealed: Sealed, baseVersion: number, account: string): Promise<PutBookResult>;
  deleteBook(account: string): Promise<void>;
  readBoxes(ids: string[], account: string): Promise<Record<string, Sealed>>;
  putBox(box: { id: string; token: string; kind: BoxKind } & Sealed, account: string): Promise<"written" | "conflict">;
  deleteBoxes(items: { id: string; token: string }[], account: string): Promise<void>;
};

async function fail(response: Response): Promise<never> {
  await rejectAccountMismatch(response);
  const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
  throw new HttpError(response.status, payload.error ?? `HTTP ${response.status}`, payload.code);
}

function jsonInit(method: "POST" | "PUT", account: string, body: unknown): ApiRequestInit {
  return {
    method,
    headers: { "content-type": "application/json", ...accountHeader(account) },
    body: JSON.stringify(body),
  };
}

export const hostedFriendsApi: FriendsApi = {
  async getBook(account) {
    const response = await apiFetch("/api/friends/book", { headers: accountHeader(account) });
    if (response.status === 404) {
      const payload = (await response.clone().json().catch(() => ({}))) as { error?: string };
      // A 404 for the account itself (deleted since) is not "no book".
      if (payload.error === "No friend book") return null;
    }
    if (!response.ok) return fail(response);
    return (await response.json()) as SealedBook;
  },

  async putBook(sealed, baseVersion, account) {
    const response = await apiFetch("/api/friends/book", jsonInit("PUT", account, { ...sealed, baseVersion }));
    if (response.status === 409) {
      await rejectAccountMismatch(response);
      const payload = (await response.json().catch(() => ({}))) as { current?: SealedBook | null };
      return { ok: false, current: payload.current ?? null };
    }
    if (!response.ok) return fail(response);
    const payload = (await response.json()) as { version: number };
    return { ok: true, version: payload.version };
  },

  async deleteBook(account) {
    const response = await apiFetch("/api/friends/book/delete", { method: "POST", headers: accountHeader(account) });
    if (!response.ok) await fail(response);
  },

  async readBoxes(ids, account) {
    if (ids.length === 0) return {};
    const response = await apiFetch("/api/friends/boxes/read", jsonInit("POST", account, { ids }));
    if (!response.ok) return fail(response);
    return ((await response.json()) as { boxes: Record<string, Sealed> }).boxes;
  },

  async putBox(box, account) {
    const response = await apiFetch("/api/friends/boxes", jsonInit("PUT", account, box));
    if (response.status === 409) {
      await rejectAccountMismatch(response);
      return "conflict";
    }
    if (!response.ok) await fail(response);
    return "written";
  },

  async deleteBoxes(items, account) {
    if (items.length === 0) return;
    const response = await apiFetch("/api/friends/boxes/delete", jsonInit("POST", account, { items }));
    if (!response.ok) await fail(response);
  },
};
