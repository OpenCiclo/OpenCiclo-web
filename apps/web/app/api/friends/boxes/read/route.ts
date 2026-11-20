// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { MAX_BOX_READ } from "@/lib/friends/limits";
import { requireAccount } from "@/lib/server/account";
import { rejectOutdatedClient } from "@/lib/server/client-version";
import { jsonError } from "@/lib/server/env";
import { isBoxKey, readBoxes, friendsUnavailable } from "@/lib/server/friends";
import { apiRoute, readJson } from "@/lib/server/http";
import { limitKey, takeRateLimit, tooManyRequests } from "@/lib/server/rate-limit";

// Reads sealed boxes by id. A POST so the ids travel in the body, never in a
// URL that request logs keep. Boxes that do not exist or expired are left out.
export const POST = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  const parsed = await readJson(request, 8 * 1024);
  if (!parsed.ok) return parsed.response;
  const { ids } = parsed.body;
  if (!Array.isArray(ids) || ids.length > MAX_BOX_READ || !ids.every(isBoxKey)) {
    return jsonError("Invalid box ids", 400);
  }
  const db = getDb();
  if (!(await takeRateLimit(db, "friends-box-read", limitKey("account", account.id)))) {
    return tooManyRequests();
  }
  return Response.json({ boxes: await readBoxes(db, [...new Set(ids as string[])]) });
});
