// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { requireAccount } from "@/lib/server/account";
import { jsonError } from "@/lib/server/env";
import { apiRoute, readJson } from "@/lib/server/http";
import { confirmPendingMailbox } from "@/lib/server/mailbox-store";
import { limitKey, sourceKey, takeRateLimits, tooManyRequests } from "@/lib/server/rate-limit";
import { rejectOutdatedClient } from "@/lib/server/client-version";

export const POST = apiRoute(async (request: Request) => {
  const outdated = rejectOutdatedClient(request);
  if (outdated) return outdated;
  const { error, account } = await requireAccount(request);
  if (error || !account) return error;

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const db = getDb();
  // Each code allows five attempts; these cap how many codes one client or one
  // account can try to guess.
  const allowed = await takeRateLimits(db, [
    { bucket: "recovery-confirm", keyHash: sourceKey(request) },
    { bucket: "recovery-confirm-account", keyHash: limitKey("account", account.id) },
  ]);
  if (!allowed) return tooManyRequests();

  if ((await confirmPendingMailbox(db, account.id, parsed.body.code)) !== "confirmed") {
    return jsonError("Could not confirm", 400);
  }
  return Response.json({ ok: true });
});
