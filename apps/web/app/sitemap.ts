// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";

import { HELP_ARTICLES } from "@/lib/help/articles";
import type { LearnArticle } from "@/lib/learn/articles";
import { loadPublishedLearnArticles, shippedLearnArticles } from "@/lib/learn/load";
import { appUrl } from "@/lib/server/env";
import { sitemapEntries, sitemapOrigin } from "@/lib/sitemap-entries";

// Built per request: its URLs use the origin it was asked on (or SITE_URL),
// and crawlers fetch a sitemap rarely.
export const dynamic = "force-dynamic";

async function learnArticles(): Promise<LearnArticle[]> {
  try {
    return await loadPublishedLearnArticles();
  } catch (error) {
    unstable_rethrow(error);
    // Never a 500 for crawlers: the shipped library's slugs while the database is down.
    return shippedLearnArticles();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const request = await headers();
  const origin = sitemapOrigin({
    siteUrl: process.env.SITE_URL,
    host: request.get("x-forwarded-host") ?? request.get("host"),
    proto: request.get("x-forwarded-proto"),
    fallback: appUrl(),
  });
  return sitemapEntries(
    origin,
    await learnArticles(),
    HELP_ARTICLES.map((article) => article.slug),
  );
}
