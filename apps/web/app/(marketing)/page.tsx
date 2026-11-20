// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { unstable_rethrow } from "next/navigation";

import { SitePage } from "./site-page";
import { toLearnSummary, type LearnArticle } from "@/lib/learn/articles";
import { loadPublishedLearnArticles, shippedLearnArticles } from "@/lib/learn/load";
import { todayIsoUtc } from "@/lib/diary";

// Static, regenerated at most hourly, and soon after the console saves an
// article (the Learn catalog's cache tag, lib/learn/load.ts).
export const revalidate = 3600;

async function featuredArticles(): Promise<LearnArticle[]> {
  try {
    return await loadPublishedLearnArticles();
  } catch (error) {
    unstable_rethrow(error);
    // The landing never fails because of Learn: with the database down and
    // nothing cached, it features shipped articles.
    console.error("Landing: Learn catalog unavailable, featuring shipped articles", error);
    return shippedLearnArticles();
  }
}

export default async function MarketingPage() {
  const articles = await featuredArticles();
  return <SitePage featured={articles.slice(0, 3).map(toLearnSummary)} renderedOn={todayIsoUtc()} />;
}
