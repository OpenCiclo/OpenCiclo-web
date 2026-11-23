// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { getDb } from "@/lib/db";
import { requireConsoleApi } from "@/lib/server/console";
import { jsonError } from "@/lib/server/env";
import { deleteFeedback } from "@/lib/server/feedback";
import { apiRoute } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type Context = { params: Promise<{ id: string }> };

/** The console deletes one feedback message (the operator read or handled it). */
export const DELETE = apiRoute(async (_request: Request, { params }: Context) => {
  const access = await requireConsoleApi();
  if (!access.ok) return access.response;
  const { id } = await params;
  if (!UUID.test(id)) return jsonError("Not found", 404);
  const deleted = await deleteFeedback(getDb(), id);
  if (!deleted) return jsonError("Not found", 404);
  return Response.json({ ok: true });
});
