// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The shape of the long legal pages (the privacy policy, /delete-account) and
// the small inline syntax their text uses: [label](href) and **bold**.
// components/legal-document.tsx draws them. Client-safe, no React here.

import { contentLocale, isLocale, type BaseLocale, type Locale } from "@/lib/i18n";

/**
 * Which language a legal page shows. `?lang=<tag>` (any UI language) wins over
 * the UI's, so the store listing and reviewers can link a fixed language; it is
 * for display only and never saved. Only Spanish and English texts exist, so
 * other languages read one of them (`fallback`).
 */
export function legalLanguage(
  param: string | null,
  uiLocale: Locale,
): { requested: Locale; lang: BaseLocale; fallback: boolean } {
  const requested = isLocale(param) ? param : uiLocale;
  const lang = contentLocale(requested);
  return { requested, lang, fallback: lang !== requested };
}

/** One line of text: plain words, [label](href) links and **bold**. */
export type Inline = string;

export type LegalBlock =
  | { kind: "p"; text: Inline }
  | { kind: "list"; items: Inline[]; ordered?: boolean }
  /** One kind of data: a title and labelled rows (what, why, legal basis, how long). */
  | { kind: "item"; title: string; rows: { label: string; text: Inline }[] };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  /** "Last updated" line, already formatted. */
  updated?: string;
  intro: LegalBlock[];
  sections: LegalSection[];
};

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string; internal: boolean };

/** Internal paths, https links and mailto: addresses. Anything else is shown as plain text. */
export function isSafeLegalHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//");
  if (href.startsWith("https://")) return href.length > "https://".length;
  if (href.startsWith("mailto:")) return /^mailto:[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(href);
  return false;
}

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function parseInline(text: Inline): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ kind: "text", text: text.slice(last, index) });
    if (match[1] !== undefined && match[2] !== undefined) {
      const href = match[2];
      tokens.push(
        isSafeLegalHref(href)
          ? { kind: "link", text: match[1], href, internal: href.startsWith("/") }
          : { kind: "text", text: match[1] },
      );
    } else if (match[3] !== undefined) {
      tokens.push({ kind: "bold", text: match[3] });
    }
    last = index + match[0].length;
  }
  if (last < text.length) tokens.push({ kind: "text", text: text.slice(last) });
  return tokens;
}

/**
 * Pages these documents link to that exist on the web only (no `.android.tsx`
 * twin). The Android app has no such route, so it opens them on the website.
 */
export const WEB_ONLY_PATHS: readonly string[] = ["/contact", "/delete-account"];

/** Where a link really goes: a web-only page becomes the website's address in the Android app. */
export function resolveLegalHref(
  href: string,
  target: { android: boolean; webOrigin: string },
): { href: string; internal: boolean } {
  if (!href.startsWith("/")) return { href, internal: false };
  const route = href.split(/[?#]/)[0];
  if (target.android && WEB_ONLY_PATHS.includes(route)) return { href: `${target.webOrigin}${href}`, internal: false };
  return { href, internal: true };
}

/** Every inline string of a document, in reading order (for tests and checks). */
export function legalDocTexts(doc: LegalDoc): string[] {
  const out: string[] = [doc.title];
  if (doc.updated) out.push(doc.updated);
  const blocks = [...doc.intro, ...doc.sections.flatMap((section) => section.blocks)];
  for (const section of doc.sections) out.push(section.title);
  for (const block of blocks) {
    if (block.kind === "p") out.push(block.text);
    else if (block.kind === "list") out.push(...block.items);
    else {
      out.push(block.title);
      for (const row of block.rows) out.push(row.label, row.text);
    }
  }
  return out;
}

/** Every link in a document. */
export function legalDocLinks(doc: LegalDoc): { text: string; href: string }[] {
  return legalDocTexts(doc).flatMap((text) =>
    parseInline(text).flatMap((token) => (token.kind === "link" ? [{ text: token.text, href: token.href }] : [])),
  );
}
