// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { notFound } from "next/navigation";

import { LearnArticleView } from "@/components/learn/learn-article-view";
import { relatedArticles, toLearnSummary } from "@/lib/learn/articles";
import { isLearnSlugParam } from "@/lib/learn/catalog";
import { LEARN_ARTICLES } from "@/lib/learn/content";
import { loadPublishedLearnArticles } from "@/lib/learn/load";

// Static, regenerated at most hourly, and soon after the console saves an
// article (the Learn catalog's cache tag, lib/learn/load.ts). Shipped slugs
// are prerendered; an article only in `learn_articles` renders on its first
// visit and is cached from then on. Anything else is a 404.
export const revalidate = 3600;

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function LearnArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLearnSlugParam(slug)) notFound();
  const articles = await loadPublishedLearnArticles();
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const related = relatedArticles(article, articles).map(toLearnSummary);
  return <LearnArticleView article={article} related={related} />;
}
