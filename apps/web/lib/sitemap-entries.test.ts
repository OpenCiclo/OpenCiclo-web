// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PRODUCTION_SITE_ORIGIN, PUBLIC_PAGES, sitemapEntries, sitemapOrigin } from "./sitemap-entries";

const publicDir = path.join(__dirname, "..", "public");

function robotsSitemapUrl(): URL {
  const line = readFileSync(path.join(publicDir, "robots.txt"), "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("Sitemap:"));
  return new URL(line?.slice("Sitemap:".length).trim() ?? "");
}

describe("sitemap origin", () => {
  it("is the canonical origin robots.txt advertises, not production's apex APP_URL", () => {
    const advertised = robotsSitemapUrl();
    expect(advertised.origin).toBe(PRODUCTION_SITE_ORIGIN);
    expect(advertised.pathname).toBe("/sitemap.xml");
    // A crawler follows robots.txt to the sitemap; every URL in it stays on that origin.
    const origin = sitemapOrigin({ host: advertised.host, proto: "https", fallback: "https://openciclo.com" });
    expect(origin).toBe(PRODUCTION_SITE_ORIGIN);
    for (const entry of sitemapEntries(origin, [{ slug: "cycle-phases", reviewedAt: "2026-10-16" }], ["what-ciclo-is"])) {
      expect(new URL(entry.url).origin).toBe(advertised.origin);
    }
  });

  it("takes SITE_URL first, then the request's host, then APP_URL", () => {
    const fallback = "https://openciclo.com";
    expect(sitemapOrigin({ siteUrl: "https://www.example.org/", host: "other.test", fallback })).toBe(
      "https://www.example.org",
    );
    expect(sitemapOrigin({ host: "WWW.OpenCiclo.com", proto: "https", fallback })).toBe("https://www.openciclo.com");
    expect(sitemapOrigin({ host: "localhost:3000", fallback })).toBe("http://localhost:3000");
    expect(sitemapOrigin({ host: "evil.test/<script>", fallback })).toBe(fallback);
    expect(sitemapOrigin({ host: "www.openciclo.com", proto: "javascript", fallback })).toBe(fallback);
    expect(sitemapOrigin({ host: null, fallback })).toBe(fallback);
  });
});

describe("sitemap", () => {
  it("lists the public pages, each Learn article with its review date, and each Help article", () => {
    const entries = sitemapEntries(
      "https://www.example.org/",
      [{ slug: "cycle-phases", reviewedAt: "2026-10-16" }],
      ["what-ciclo-is"],
    );
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://www.example.org/",
      "https://www.example.org/learn",
      "https://www.example.org/help",
      "https://www.example.org/privacy",
      "https://www.example.org/contact",
      "https://www.example.org/learn/cycle-phases",
      "https://www.example.org/help/what-ciclo-is",
    ]);
    expect(entries.find((entry) => entry.url.endsWith("/cycle-phases"))?.lastModified).toBe("2026-10-16");
  });

  it("names no page that robots.txt keeps crawlers out of", () => {
    const disallowed = readFileSync(path.join(publicDir, "robots.txt"), "utf8")
      .split("\n")
      .filter((line) => line.startsWith("Disallow:"))
      .map((line) => line.slice("Disallow:".length).trim());
    expect(disallowed).toEqual(["/api/", "/console", "/dev-"]);
    for (const page of PUBLIC_PAGES) {
      expect(disallowed.some((prefix) => page.startsWith(prefix))).toBe(false);
    }
  });
});

describe("security.txt (RFC 9116)", () => {
  const text = readFileSync(path.join(publicDir, ".well-known", "security.txt"), "utf8");
  const field = (name: string) =>
    text
      .split(/\r?\n/)
      .find((line) => line.startsWith(`${name}:`))
      ?.slice(name.length + 1)
      .trim();

  it("names a private reporting channel and the languages", () => {
    expect(field("Contact")).toBe("https://github.com/OpenCiclo/OpenCiclo-web/security/advisories/new");
    expect(field("Preferred-Languages")).toBe("en, es");
  });

  it("has not expired, and gets renewed a month ahead", () => {
    // An expired security.txt must be ignored by readers (RFC 9116, 2.5.5).
    // When this fails, move Expires about a year ahead (no more than a year).
    const expires = Date.parse(field("Expires") ?? "");
    expect(Number.isNaN(expires)).toBe(false);
    expect(expires - Date.now()).toBeGreaterThan(30 * 24 * 60 * 60 * 1000);
  });
});
