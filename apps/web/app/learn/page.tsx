// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { LearnIndex } from "@/components/learn/learn-index";
import { toLearnSummary } from "@/lib/learn/articles";
import { loadPublishedLearnArticles } from "@/lib/learn/load";

// Static, regenerated at most hourly, and soon after the console saves an
// article (the Learn catalog's cache tag, lib/learn/load.ts). The list
// carries summaries; an article's body loads when it opens.
export const revalidate = 3600;

export default async function LearnPage() {
  const articles = await loadPublishedLearnArticles();
  return <LearnIndex articles={articles.map(toLearnSummary)} />;
}
