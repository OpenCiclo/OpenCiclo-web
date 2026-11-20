// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { jsonError } from "@/lib/server/env";
import { requireConsoleApi } from "@/lib/server/console";
import { apiRoute, readJson } from "@/lib/server/http";
import { deleteLearnArticle, loadLearnEditorPayload, parseUpsertLearnInput, upsertLearnArticle } from "@/lib/server/learn-articles";

export const dynamic = "force-dynamic";

// An article in both languages with its sources is well under this.
const MAX_ARTICLE_BYTES = 1024 * 1024;

type Context = { params: Promise<{ slug: string }> };

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = apiRoute(async (_request: Request, { params }: Context) => {
  const access = await requireConsoleApi();
  if (!access.ok) return access.response;
  const { slug } = await params;
  const payload = await loadLearnEditorPayload(slug);
  if (!payload) return jsonError("Not found", 404);
  return Response.json(payload);
});

export const PUT = apiRoute(async (request: Request, { params }: Context) => {
  const access = await requireConsoleApi();
  if (!access.ok) return access.response;
  const { slug: pathSlug } = await params;
  const parsed = await readJson(request, MAX_ARTICLE_BYTES);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  const slug = pathSlug === "new" ? text(body.slug)?.trim() ?? "" : pathSlug;
  const result = parseUpsertLearnInput({
    slug,
    category: text(body.category) ?? "",
    reviewedAt: text(body.reviewedAt) ?? "",
    status: text(body.status) ?? "draft",
    sources: body.sources,
    es: body.es,
    en: body.en,
  });
  if (!result.ok) return jsonError(result.error, 400);
  await upsertLearnArticle(result.entry);
  return Response.json({ ok: true, slug: result.entry.slug });
});

export const DELETE = apiRoute(async (_request: Request, { params }: Context) => {
  const access = await requireConsoleApi();
  if (!access.ok) return access.response;
  const { slug } = await params;
  const deleted = await deleteLearnArticle(slug);
  if (!deleted) return jsonError("Not found", 404);
  return Response.json({ ok: true });
});
