// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { unstable_cache } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { LEARN_ARTICLES } from "@/lib/learn/content";
import { dbRowToCatalogEntry, mergeLearnCatalog, type CatalogDbEntry } from "@/lib/learn/catalog";
import type { LearnArticle } from "@/lib/learn/articles";
import { learnArticles } from "@/lib/db/schema";
import { getDb } from "@/lib/db";

/**
 * Cache tag of the public Learn catalog. Every page that reads it (the landing,
 * /learn, each article and its JSON, the sitemap) carries the tag, and the
 * console marks it stale with `revalidateTag(LEARN_CACHE_TAG, "max")` when an
 * article is saved or deleted (lib/server/learn-articles.ts).
 */
export const LEARN_CACHE_TAG = "learn";

async function selectDbLearnEntries(): Promise<CatalogDbEntry[]> {
  const rows = await getDb().select().from(learnArticles);
  return rows
    .map((row) => dbRowToCatalogEntry(row))
    .filter((row): row is CatalogDbEntry => row !== null);
}

/** Every `learn_articles` row, drafts included, for the operator console. Uncached; empty if the database fails. */
export async function loadDbLearnEntries(): Promise<CatalogDbEntry[]> {
  try {
    return await selectDbLearnEntries();
  } catch {
    return [];
  }
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}

let warnedBuildWithoutDb = false;
let buildRows: Promise<CatalogDbEntry[]> | null = null;

/** The rows the public pages merge, read from the database (see `cachedDbLearnEntries`). */
async function readDbLearnEntries(): Promise<CatalogDbEntry[]> {
  // No database configured (a Docker or CI build): the shipped library.
  if (!process.env.DATABASE_URL) return [];
  if (isBuildPhase()) {
    // Emergency switch for shipping a fix while the database is down. Without
    // it a build that cannot read learn_articles fails, because prerendering
    // the shipped library would publish again any article the operator hid.
    if (process.env.LEARN_BUILD_WITHOUT_DB === "1") {
      if (!warnedBuildWithoutDb) {
        warnedBuildWithoutDb = true;
        console.warn(
          "\n" +
            "!!! LEARN_BUILD_WITHOUT_DB=1: building Learn and the landing WITHOUT the learn_articles table.\n" +
            "!!! Operator edits are missing and articles hidden in the console are visible again until\n" +
            "!!! the pages regenerate against the database (within about an hour of it coming back,\n" +
            "!!! or at once on the next save in the console). Unset it for the next build.\n",
        );
      }
      return [];
    }
    // `next build` prerenders every Learn page: one query per build worker.
    buildRows ??= selectDbLearnEntries();
    return buildRows;
  }
  return selectDbLearnEntries();
}

/**
 * `learn_articles` rows in Next's data cache, tagged LEARN_CACHE_TAG and
 * refreshed at least hourly. When the console marks the tag stale, the next
 * regeneration of each page waits for fresh rows; if the database fails
 * then, Next hands back the last rows it had, so the page keeps its last good
 * content instead of failing. Pages also inherit the tag from this call.
 */
const cachedDbLearnEntries = unstable_cache(readDbLearnEntries, ["learn-db-entries"], {
  tags: [LEARN_CACHE_TAG],
  revalidate: 3600,
});

/**
 * The public Learn library: shipped articles merged with `learn_articles`
 * (lib/learn/catalog.ts), through the tagged data cache above. Throws only
 * when the rows have never been cached and the database fails (or during a
 * build that cannot reach it); a page whose regeneration throws keeps serving
 * its previous version.
 */
export async function loadPublishedLearnArticles(): Promise<LearnArticle[]> {
  return mergeLearnCatalog(LEARN_ARTICLES, await cachedDbLearnEntries());
}

/**
 * The shipped library alone (no operator edits), for pages that must not fail
 * when the catalog cannot be read: the landing's featured articles, the sitemap.
 */
export function shippedLearnArticles(): LearnArticle[] {
  return mergeLearnCatalog(LEARN_ARTICLES, []);
}
