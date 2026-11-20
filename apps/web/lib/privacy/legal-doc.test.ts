// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { isSafeLegalHref, legalLanguage, parseInline, resolveLegalHref } from "@/lib/privacy/legal-doc";

describe("legal document inline text", () => {
  it("splits links and bold out of plain text", () => {
    expect(parseInline("See [the policy](/privacy) and **this**.")).toEqual([
      { kind: "text", text: "See " },
      { kind: "link", text: "the policy", href: "/privacy", internal: true },
      { kind: "text", text: " and " },
      { kind: "bold", text: "this" },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps https and mailto links, external", () => {
    expect(parseInline("[aepd.es](https://www.aepd.es)")).toEqual([
      { kind: "link", text: "aepd.es", href: "https://www.aepd.es", internal: false },
    ]);
    expect(parseInline("[x@example.org](mailto:x@example.org)")[0]).toMatchObject({ kind: "link", internal: false });
  });

  it("shows any other link as its label only", () => {
    for (const href of ["javascript:void", "http://example.org", "//evil.example", "mailto:", "mailto:nobody"]) {
      expect(isSafeLegalHref(href), href).toBe(false);
      expect(parseInline(`[label](${href})`), href).toEqual([{ kind: "text", text: "label" }]);
    }
  });

  it("sends web-only pages to the website from the Android app", () => {
    const android = { android: true, webOrigin: "https://www.openciclo.com" };
    const web = { android: false, webOrigin: "" };
    expect(resolveLegalHref("/delete-account", android)).toEqual({
      href: "https://www.openciclo.com/delete-account",
      internal: false,
    });
    expect(resolveLegalHref("/contact#top", android)).toEqual({ href: "https://www.openciclo.com/contact#top", internal: false });
    expect(resolveLegalHref("/delete-account", web)).toEqual({ href: "/delete-account", internal: true });
    expect(resolveLegalHref("/privacy", android)).toEqual({ href: "/privacy", internal: true });
    expect(resolveLegalHref("mailto:x@example.org", android)).toEqual({ href: "mailto:x@example.org", internal: false });
  });

  it("lets ?lang= pick the language of a legal page, falling back like Learn", () => {
    expect(legalLanguage("en", "fr")).toEqual({ requested: "en", lang: "en", fallback: false });
    expect(legalLanguage("es", "en")).toEqual({ requested: "es", lang: "es", fallback: false });
    expect(legalLanguage(null, "de")).toEqual({ requested: "de", lang: "en", fallback: true });
    expect(legalLanguage("gl", "en")).toEqual({ requested: "gl", lang: "es", fallback: true });
    // Anything else is ignored: the UI's language stays.
    for (const param of ["", "EN", "xx", "en-GB"]) {
      expect(legalLanguage(param, "es"), param).toEqual({ requested: "es", lang: "es", fallback: false });
    }
  });

  it("leaves text without markup alone", () => {
    expect(parseInline("Plain words, no links.")).toEqual([{ kind: "text", text: "Plain words, no links." }]);
    expect(parseInline("")).toEqual([]);
  });
});
