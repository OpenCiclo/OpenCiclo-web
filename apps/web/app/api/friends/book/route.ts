// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { MAX_BOOK_CIPHERTEXT_LENGTH } from "@/lib/friends/limits";
import { requireAccount } from "@/lib/server/account";
import { rejectOutdatedClient } from "@/lib/server/client-version";
import { jsonError } from "@/lib/server/env";
import { isSealedBook, readFriendBook, writeFriendBook, friendsUnavailable } from "@/lib/server/friends";
import { apiRoute, readJson } from "@/lib/server/http";
import { limitKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { parseBaseVersion } from "@/lib/server/vault";

// The sealed friend book (lib/friends/book.ts). 404 when Friends is off for
// this account (no book).
export const GET = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  const book = await readFriendBook(getDb(), account.id);
  if (!book) return jsonError("No friend book", 404);
  return Response.json(book);
});

// Compare-and-set like PUT /api/vault: baseVersion 0 creates the book.
export const PUT = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  const parsed = await readJson(request, MAX_BOOK_CIPHERTEXT_LENGTH + 1024);
  if (!parsed.ok) return parsed.response;
  const { ciphertext, nonce } = parsed.body;
  if (!isSealedBook(ciphertext, nonce)) return jsonError("Invalid friend book", 400);
  const baseVersion = parseBaseVersion(parsed.body.baseVersion);
  if (baseVersion === "missing" || baseVersion === "invalid") {
    return jsonError("baseVersion must be a non-negative integer", 400);
  }
  const db = getDb();
  if (!(await takeRateLimit(db, "friends-book-write", limitKey("account", account.id)))) {
    return tooManyRequests();
  }
  const result = await writeFriendBook(db, account.id, { ciphertext: ciphertext as string, nonce: nonce as string }, baseVersion);
  if (!result.ok) {
    return Response.json({ error: "Friend book changed", current: result.current }, { status: 409 });
  }
  return Response.json({ ok: true, version: result.version });
});
