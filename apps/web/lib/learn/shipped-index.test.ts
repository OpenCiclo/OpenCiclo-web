// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { toLearnSummary } from "@/lib/learn/articles";
import { LEARN_ARTICLES } from "@/lib/learn/content";

import { LEARN_SUMMARIES } from "./shipped-index";

// lib/learn/shipped-index.ts is written by this test from the shipped library.
// When an article's slug, category, date, title or summary changes, the first
// test fails; regenerate the file with `npm run learn-index`
// (`vitest run lib/learn/shipped-index.test.ts -u`) and commit it.
const HEADER = `// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Generated from lib/learn/content by lib/learn/shipped-index.test.ts. Do not
// edit: change the article, then run \`npm run learn-index\`.
// The summaries of the shipped Learn library (LEARN_ARTICLES), for client code
// that lists it (the Learn tab's ghost), so no screen loads every article body.

import type { LearnArticleSummary } from "@/lib/learn/articles";

export const LEARN_SUMMARIES: LearnArticleSummary[] = `;

describe("shipped Learn index", () => {
  it("is generated from the shipped library", async () => {
    const source = `${HEADER}${JSON.stringify(LEARN_ARTICLES.map(toLearnSummary), null, 2)};\n`;
    await expect(source).toMatchFileSnapshot("./shipped-index.ts");
  });

  it("holds the summary of every shipped article, in order, and nothing of the bodies", () => {
    expect(LEARN_SUMMARIES).toEqual(LEARN_ARTICLES.map(toLearnSummary));
    for (const summary of LEARN_SUMMARIES) {
      expect(Object.keys(summary.en).sort()).toEqual(["summary", "title"]);
      expect(summary).not.toHaveProperty("sources");
    }
  });
});
