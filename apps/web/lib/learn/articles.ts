// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { contentLocale, type BaseLocale, type Locale, type Messages } from "@/lib/i18n";

export const LEARN_CATEGORIES = [
  "cycle",
  "periods",
  "symptoms",
  "conditions",
  "intimate-health",
  "fertility",
  "contraception",
  "pregnancy",
  "sexual-health",
  "menopause",
  "mind",
  "lifestyle",
  "puberty",
  "care",
] as const;

export type LearnCategory = (typeof LEARN_CATEGORIES)[number];

export function isLearnCategory(value: string): value is LearnCategory {
  return (LEARN_CATEGORIES as readonly string[]).includes(value);
}

// Categories that existing learn_articles rows may still use.
const LEGACY_CATEGORIES: Record<string, LearnCategory> = {
  mucus: "cycle",
};

export function normalizeLearnCategory(value: string): LearnCategory | null {
  if (isLearnCategory(value)) return value;
  return LEGACY_CATEGORIES[value] ?? null;
}

export const LEARN_CATEGORY_COPY: Record<LearnCategory, { title: keyof Messages; description: keyof Messages }> = {
  cycle: { title: "learnCategoryCycle", description: "learnCategoryCycleDescription" },
  periods: { title: "learnCategoryPeriods", description: "learnCategoryPeriodsDescription" },
  symptoms: { title: "learnCategorySymptoms", description: "learnCategorySymptomsDescription" },
  conditions: { title: "learnCategoryConditions", description: "learnCategoryConditionsDescription" },
  "intimate-health": { title: "learnCategoryIntimateHealth", description: "learnCategoryIntimateHealthDescription" },
  fertility: { title: "learnCategoryFertility", description: "learnCategoryFertilityDescription" },
  contraception: { title: "learnCategoryContraception", description: "learnCategoryContraceptionDescription" },
  pregnancy: { title: "learnCategoryPregnancy", description: "learnCategoryPregnancyDescription" },
  "sexual-health": { title: "learnCategorySexualHealth", description: "learnCategorySexualHealthDescription" },
  menopause: { title: "learnCategoryMenopause", description: "learnCategoryMenopauseDescription" },
  mind: { title: "learnCategoryMind", description: "learnCategoryMindDescription" },
  lifestyle: { title: "learnCategoryLifestyle", description: "learnCategoryLifestyleDescription" },
  puberty: { title: "learnCategoryPuberty", description: "learnCategoryPubertyDescription" },
  care: { title: "learnCategoryCare", description: "learnCategoryCareDescription" },
};

export type LearnSource = {
  label: string;
  href: string;
};

export type LearnArticleCopy = {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  notice: string;
};

export type LearnArticle = {
  slug: string;
  category: LearnCategory;
  reviewedAt: string;
  sources: LearnSource[];
  related?: string[];
  // Optional until translated; the Spanish UI falls back to English.
  es?: LearnArticleCopy;
  en: LearnArticleCopy;
};

/** The part of an article's copy that a list shows. */
export type LearnSummaryCopy = Pick<LearnArticleCopy, "title" | "summary">;

/**
 * An article as a list shows it: no sections, notice, sources or related
 * links. Lists (the Learn index, the landing, related links) get these; the
 * body is loaded when an article opens (`lib/learn/bodies.ts`).
 */
export type LearnArticleSummary = {
  slug: string;
  category: LearnCategory;
  reviewedAt: string;
  es?: LearnSummaryCopy;
  en: LearnSummaryCopy;
};

export function toLearnSummary(article: LearnArticle): LearnArticleSummary {
  const copy = ({ title, summary }: LearnArticleCopy): LearnSummaryCopy => ({ title, summary });
  return {
    slug: article.slug,
    category: article.category,
    reviewedAt: article.reviewedAt,
    ...(article.es ? { es: copy(article.es) } : {}),
    en: copy(article.en),
  };
}

/**
 * The language an article shows in for `locale`. Articles exist in English and
 * often Spanish; other languages fall back to Spanish or English (`contentLocale`).
 */
export function articleCopyLocale(article: { es?: unknown }, locale: Locale): BaseLocale {
  return contentLocale(locale) === "es" && article.es ? "es" : "en";
}

export function hasArticleCopy(article: { es?: unknown }, locale: Locale): boolean {
  return articleCopyLocale(article, locale) === locale;
}

/** `lang` for the article's text: set only when it is not in the UI language. */
export function articleLang(article: { es?: unknown }, locale: Locale): BaseLocale | undefined {
  return hasArticleCopy(article, locale) ? undefined : articleCopyLocale(article, locale);
}

/** The article's copy (full, or a summary's) in the language it shows in for `locale`. */
export function articleCopy<Copy>(article: { es?: Copy; en: Copy }, locale: Locale): Copy {
  return article[articleCopyLocale(article, locale)] ?? article.en;
}

/** The articles `article` links to, in its order, picked from `articles` (full or summaries). */
export function relatedArticles<Item extends { slug: string }>(
  article: { related?: string[] },
  articles: Item[],
): Item[] {
  const bySlug = new Map(articles.map((item) => [item.slug, item]));
  return (article.related ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Item => item !== undefined);
}
