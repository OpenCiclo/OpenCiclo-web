// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { jsonError } from "@/lib/server/env";
import { apiRoute, originAllowed } from "@/lib/server/http";
import { clearSessionCookie } from "@/lib/server/session";

// No body, so no Content-Type check: the Origin check stops another site's
// form from signing people out. Never refused for an outdated app build.
export const POST = apiRoute(async (request: Request) => {
  if (!originAllowed(request)) return jsonError("Forbidden", 403);
  await clearSessionCookie();
  return Response.json({ ok: true });
});
