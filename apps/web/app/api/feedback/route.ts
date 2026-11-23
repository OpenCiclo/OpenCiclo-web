// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/server/env";
import { insertFeedback, parseFeedback } from "@/lib/server/feedback";
import { apiRoute, readJson } from "@/lib/server/http";
import { GLOBAL_KEY, sourceKey, takeRateLimits, tooManyRequests } from "@/lib/server/rate-limit";

// Feedback from Settings. Anonymous: no session is read and nothing about the
// sender is stored but what the form sends (lib/server/feedback.ts). Not
// refused to outdated Android builds: feedback should always get through.
const MAX_FEEDBACK_JSON_BYTES = 16 * 1024;

export const POST = apiRoute(async (request: Request) => {
  const parsed = await readJson(request, MAX_FEEDBACK_JSON_BYTES);
  if (!parsed.ok) return parsed.response;
  const feedback = parseFeedback(parsed.body, request.headers);
  if (!feedback.ok) return jsonError(feedback.error, 400);

  const db = getDb();
  const source = sourceKey(request);
  const allowed = await takeRateLimits(db, [
    { bucket: "feedback-submit", keyHash: source },
    { bucket: "feedback-submit-day", keyHash: source },
    { bucket: "feedback-submit-global", keyHash: GLOBAL_KEY },
  ]);
  if (!allowed) return tooManyRequests();
  await insertFeedback(db, feedback.value);
  return Response.json({ ok: true });
});
