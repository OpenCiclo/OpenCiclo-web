// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { BOX_KINDS, type BoxKind } from "@/lib/friends/limits";
import { requireAccount } from "@/lib/server/account";
import { rejectOutdatedClient } from "@/lib/server/client-version";
import { jsonError } from "@/lib/server/env";
import { boxExists, isBoxKey, isSealedBox, putBox, friendsUnavailable } from "@/lib/server/friends";
import { apiRoute, readJson } from "@/lib/server/http";
import { GLOBAL_KEY, limitKey, takeRateLimits, tooManyRequests } from "@/lib/server/rate-limit";

// Writes one sealed box (lib/server/friends.ts putBox). 409 when another
// device holds this address. The session is needed for the rate limit only:
// nothing about the account is stored with the box.
export const PUT = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  const parsed = await readJson(request, 4096);
  if (!parsed.ok) return parsed.response;
  const { id, token, ciphertext, nonce, kind } = parsed.body;
  if (!isBoxKey(id) || !isBoxKey(token) || id === token) return jsonError("Invalid box address", 400);
  if (typeof kind !== "string" || !BOX_KINDS.includes(kind as BoxKind)) return jsonError("Invalid box kind", 400);
  if (!isSealedBox(ciphertext, nonce)) return jsonError("Invalid box", 400);
  const db = getDb();
  const accountKey = limitKey("account", account.id);
  const creates = !(await boxExists(db, id));
  const allowed = await takeRateLimits(db, [
    { bucket: "friends-box-write", keyHash: accountKey },
    { bucket: "friends-box-write-day", keyHash: accountKey },
    { bucket: "friends-box-write-global", keyHash: GLOBAL_KEY },
    ...(creates
      ? [
          { bucket: "friends-box-create" as const, keyHash: accountKey },
          { bucket: "friends-box-create-global" as const, keyHash: GLOBAL_KEY },
        ]
      : []),
  ]);
  if (!allowed) return tooManyRequests();
  const result = await putBox(db, {
    id,
    token,
    kind: kind as BoxKind,
    ciphertext: ciphertext as string,
    nonce: nonce as string,
  });
  if (result === "conflict") return jsonError("Box taken", 409);
  return Response.json({ ok: true });
});
