// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { notFound } from "next/navigation";

import { isLearnSlugParam } from "@/lib/learn/catalog";
import { LEARN_ARTICLES } from "@/lib/learn/content";
import { loadPublishedLearnArticles } from "@/lib/learn/load";

// One published article as JSON, for the Learn overlay on the web
// (loadLearnArticle in lib/learn/bodies.ts): the index ships summaries only.
// Cached like the article page next to it, and marked stale with it when the
// console saves an article (the Learn catalog's cache tag, lib/learn/load.ts).
export const revalidate = 3600;

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }));
}

const HEADERS = { "X-Robots-Tag": "noindex" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A malformed slug can never exist: a 404 before any read (Next caches it for good).
  if (!isLearnSlugParam(slug)) notFound();
  const article = (await loadPublishedLearnArticles()).find((item) => item.slug === slug);
  // Not published (yet): a 404 cached like the page, which the console's next
  // save refreshes. Not notFound(): from a route handler Next caches that a year.
  if (!article) return Response.json({ error: "Not found" }, { status: 404, headers: HEADERS });
  return Response.json(article, { headers: HEADERS });
}
