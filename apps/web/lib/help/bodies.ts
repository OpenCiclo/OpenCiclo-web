// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { HELP_ARTICLES } from "@/lib/help/articles";
import { loadHelpMarkdown, stripLeadingH1 } from "@/lib/help/load";

/** Each Help article's markdown, title line removed, by slug (the catalog has the rest). */
export type HelpBodies = Record<string, string>;

/**
 * Every Help article's body, for the Help sheet in Settings (/help.json, built
 * with the app). Server and build only: it reads content/help from disk.
 */
export function helpBodies(): HelpBodies {
  return Object.fromEntries(HELP_ARTICLES.map((article) => [article.slug, stripLeadingH1(loadHelpMarkdown(article.slug))]));
}
