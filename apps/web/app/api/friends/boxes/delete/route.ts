// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { MAX_BOX_DELETE } from "@/lib/friends/limits";
import { requireAccount } from "@/lib/server/account";
import { jsonError } from "@/lib/server/env";
import { deleteBoxes, isBoxKey, friendsUnavailable } from "@/lib/server/friends";
import { apiRoute, readJson } from "@/lib/server/http";

// Deletes boxes this device wrote (it holds their tokens). A POST, not a DELETE
// with a body. Never refused to an outdated build: tearing down must always work.
export const POST = apiRoute(async (request: Request) => {
  const unavailable = friendsUnavailable();
  if (unavailable) return unavailable;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;
  const parsed = await readJson(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;
  const { items } = parsed.body;
  if (
    !Array.isArray(items) ||
    items.length > MAX_BOX_DELETE ||
    !items.every((item) => item && typeof item === "object" && isBoxKey(item.id) && isBoxKey(item.token))
  ) {
    return jsonError("Invalid boxes", 400);
  }
  const deleted = await deleteBoxes(getDb(), items as { id: string; token: string }[]);
  return Response.json({ ok: true, deleted });
});
