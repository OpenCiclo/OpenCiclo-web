// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { IS_NATIVE_APP } from "@/lib/app-target";
import type { LearnArticle, LearnCategory } from "@/lib/learn/articles";

// Article bodies for the Learn overlay, loaded when an article opens. Lists
// carry summaries only (LearnArticleSummary), so no screen ships the library.

/** The shipped articles of each category, each file its own chunk, loaded on first use. */
const SHIPPED_BY_CATEGORY: Record<LearnCategory, () => Promise<LearnArticle[]>> = {
  cycle: () => import("@/lib/learn/content/cycle").then((module) => module.CYCLE_ARTICLES),
  periods: () => import("@/lib/learn/content/periods").then((module) => module.PERIODS_ARTICLES),
  symptoms: () => import("@/lib/learn/content/symptoms").then((module) => module.SYMPTOMS_ARTICLES),
  conditions: () => import("@/lib/learn/content/conditions").then((module) => module.CONDITIONS_ARTICLES),
  "intimate-health": () =>
    import("@/lib/learn/content/intimate-health").then((module) => module.INTIMATE_HEALTH_ARTICLES),
  fertility: () => import("@/lib/learn/content/fertility").then((module) => module.FERTILITY_ARTICLES),
  contraception: () => import("@/lib/learn/content/contraception").then((module) => module.CONTRACEPTION_ARTICLES),
  pregnancy: () => import("@/lib/learn/content/pregnancy").then((module) => module.PREGNANCY_ARTICLES),
  "sexual-health": () => import("@/lib/learn/content/sexual-health").then((module) => module.SEXUAL_HEALTH_ARTICLES),
  menopause: () => import("@/lib/learn/content/menopause").then((module) => module.MENOPAUSE_ARTICLES),
  mind: () => import("@/lib/learn/content/mind").then((module) => module.MIND_ARTICLES),
  lifestyle: () => import("@/lib/learn/content/lifestyle").then((module) => module.LIFESTYLE_ARTICLES),
  puberty: () => import("@/lib/learn/content/puberty").then((module) => module.PUBERTY_ARTICLES),
  care: () => import("@/lib/learn/content/care").then((module) => module.CARE_ARTICLES),
};

/** A shipped article (`LEARN_ARTICLES`), loading only its category's file. Null if it is not there. */
export async function loadShippedArticle(slug: string, category: LearnCategory): Promise<LearnArticle | null> {
  const articles = await SHIPPED_BY_CATEGORY[category]();
  return articles.find((article) => article.slug === slug) ?? null;
}

/**
 * Where the web serves one published article as JSON: operator edits merged,
 * cached like the article page (app/learn/[slug]/article.json/route.ts).
 */
export function learnArticleJsonPath(slug: string): string {
  return `/learn/${encodeURIComponent(slug)}/article.json`;
}

function isLearnArticle(value: unknown): value is LearnArticle {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<LearnArticle>;
  return (
    typeof record.slug === "string" &&
    typeof record.category === "string" &&
    typeof record.reviewedAt === "string" &&
    Array.isArray(record.sources) &&
    typeof record.en === "object" &&
    record.en !== null &&
    Array.isArray(record.en.sections)
  );
}

/**
 * The full article for the Learn overlay. The Android app has the shipped
 * library only (operator edits arrive with the next release), so it loads the
 * category's file; the web asks the host, which merges `learn_articles`. Null
 * when the article is not published (any more); throws when it cannot load.
 */
export async function loadLearnArticle(slug: string, category: LearnCategory): Promise<LearnArticle | null> {
  if (IS_NATIVE_APP) return loadShippedArticle(slug, category);
  const response = await fetch(learnArticleJsonPath(slug), { headers: { accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Learn article ${slug}: HTTP ${response.status}`);
  const body: unknown = await response.json();
  if (!isLearnArticle(body) || body.slug !== slug) throw new Error(`Learn article ${slug}: unexpected response`);
  return body;
}
