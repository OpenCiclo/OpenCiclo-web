// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { MetadataRoute } from "next";

/** The public site's pages that are not lists of articles. Robots may crawl these (public/robots.txt). */
export const PUBLIC_PAGES = ["/", "/learn", "/help", "/privacy", "/contact"] as const;

/**
 * The official site's canonical origin: robots.txt advertises its sitemap
 * here. The apex (openciclo.com, production's APP_URL) redirects to it.
 */
export const PRODUCTION_SITE_ORIGIN = "https://www.openciclo.com";

const HOST_PATTERN = /^[a-z0-9.-]+(?::\d{1,5})?$/i;

/**
 * The origin the sitemap's URLs use: `SITE_URL` when set, else the origin the
 * sitemap was requested on (so it matches the robots.txt that pointed there),
 * else `fallback` (APP_URL). Never APP_URL first: production's is the apex,
 * which only redirects.
 */
export function sitemapOrigin({
  siteUrl,
  host,
  proto,
  fallback,
}: {
  siteUrl?: string;
  host?: string | null;
  proto?: string | null;
  fallback: string;
}): string {
  if (siteUrl) return new URL(siteUrl).origin;
  const name = host?.split(",")[0]?.trim();
  if (name && HOST_PATTERN.test(name)) {
    const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(name);
    const scheme = proto?.split(",")[0]?.trim() || (local ? "http" : "https");
    if (scheme === "http" || scheme === "https") return `${scheme}://${name.toLowerCase()}`;
  }
  return new URL(fallback).origin;
}

/**
 * The sitemap (app/sitemap.ts): the public pages, every published Learn
 * article (dated by its review) and every Help article, under `origin` (no
 * trailing slash). Never an app screen, the console or the API.
 */
export function sitemapEntries(
  origin: string,
  learn: { slug: string; reviewedAt: string }[],
  helpSlugs: string[],
): MetadataRoute.Sitemap {
  const base = origin.replace(/\/+$/, "");
  return [
    ...PUBLIC_PAGES.map((page) => ({ url: page === "/" ? `${base}/` : `${base}${page}` })),
    ...learn.map((article) => ({
      url: `${base}/learn/${encodeURIComponent(article.slug)}`,
      lastModified: article.reviewedAt,
    })),
    ...helpSlugs.map((slug) => ({ url: `${base}/help/${encodeURIComponent(slug)}` })),
  ];
}
