// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { LEARN_ARTICLES } from "./content";
import { learnArticleJsonPath, loadLearnArticle, loadShippedArticle } from "./bodies";

describe("Learn article bodies", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("finds every shipped article in the file of its own category, as the Android app loads it", async () => {
    for (const article of LEARN_ARTICLES) {
      expect(await loadShippedArticle(article.slug, article.category), article.slug).toEqual(article);
    }
  });

  it("asks the web host for the article's JSON, and reads a 404 as no article", async () => {
    const article = LEARN_ARTICLES[0];
    const fetchMock = vi.fn(async (url: string) =>
      url === learnArticleJsonPath(article.slug)
        ? new Response(JSON.stringify(article), { status: 200 })
        : new Response("", { status: 404 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(await loadLearnArticle(article.slug, article.category)).toEqual(article);
    expect(await loadLearnArticle("no-such-article", "cycle")).toBeNull();
    expect(learnArticleJsonPath("a b")).toBe("/learn/a%20b/article.json");
  });

  it("throws on a server error or an answer for another article, so the overlay offers to retry", async () => {
    const article = LEARN_ARTICLES[0];
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    await expect(loadLearnArticle(article.slug, article.category)).rejects.toThrow("503");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(LEARN_ARTICLES[1]), { status: 200 })));
    await expect(loadLearnArticle(article.slug, article.category)).rejects.toThrow("unexpected");
  });
});
