// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MarkdownDocument, isInternalHref } from "@/lib/help/markdown";

// Next's Link, marked: a plain <a href> (a full page load) does not pass.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { ...rest, href, "data-next-link": "" }, children),
}));

function render(source: string): string {
  return renderToStaticMarkup(createElement(MarkdownDocument, { source }));
}

describe("Help links", () => {
  it("tells app paths from other links", () => {
    expect(isInternalHref("/help/email-vs-phrase")).toBe(true);
    expect(isInternalHref("/settings")).toBe(true);
    expect(isInternalHref("//example.com/x")).toBe(false);
    expect(isInternalHref("https://www.openciclo.com")).toBe(false);
    expect(isInternalHref("#section")).toBe(false);
  });

  it("renders app paths with Next's Link, in the same tab", () => {
    const html = render("See [the phrase](/help/email-vs-phrase).");
    expect(html).toMatch(/<a [^>]*href="\/help\/email-vs-phrase"[^>]*data-next-link=""/);
    expect(html).not.toContain("target=");
  });

  it("keeps external links plain, in a new tab", () => {
    const html = render("See [the code](https://github.com/OpenCiclo) and [//x](//example.com).");
    expect(html).not.toContain("data-next-link");
    expect(html).toMatch(/href="https:\/\/github.com\/OpenCiclo"[^>]*target="_blank"/);
  });
});
