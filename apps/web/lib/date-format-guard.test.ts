// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Diary days are YYYY-MM-DD read as UTC midnights. Formatted or taken apart on
// the local clock, they show the day before west of UTC. The unit tests run in
// New York to catch that in lib/, but components are not rendered in tests, so
// this scans the client source for the patterns behind those bugs.

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCANNED = ["app", "components", "lib"];
// Server code formats real instants (sign-in days, console stats), not diary days.
const SKIPPED = ["app/api/", "lib/server/"];

type Source = { file: string; text: string };

function clientSources(): Source[] {
  const files: Source[] = [];
  for (const folder of SCANNED) {
    for (const entry of readdirSync(join(webRoot, folder), { recursive: true, encoding: "utf8" })) {
      const file = `${folder}/${entry.split(sep).join("/")}`;
      if (!/\.(ts|tsx)$/.test(file) || /\.test\.ts$/.test(file)) continue;
      if (SKIPPED.some((prefix) => file.startsWith(prefix))) continue;
      files.push({ file, text: readFileSync(join(webRoot, file), "utf8") });
    }
  }
  return files;
}

/** The text between the parentheses that open at `open`, and the index of the closing one. */
function callArguments(text: string, open: number): { args: string; close: number } {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return { args: text.slice(open + 1, i), close: i };
    }
  }
  return { args: text.slice(open + 1), close: text.length };
}

/** Whether a call's argument list has more than one argument (a comma outside brackets and strings). */
function hasSeveralArguments(args: string): boolean {
  let depth = 0;
  for (let i = 0; i < args.length; i += 1) {
    const char = args[i];
    if (char === '"' || char === "'" || char === "`") {
      for (i += 1; i < args.length && args[i] !== char; i += 1) {
        if (args[i] === "\\") i += 1;
      }
    } else if (char === "(" || char === "[" || char === "{") depth += 1;
    else if (char === ")" || char === "]" || char === "}") depth -= 1;
    else if (char === "," && depth === 0) return args.slice(i + 1).trim() !== "";
  }
  return false;
}

function lineOf(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function findCalls(sources: Source[], pattern: RegExp, isBad: (call: { args: string; after: string }) => boolean) {
  const found: string[] = [];
  for (const { file, text } of sources) {
    for (const match of text.matchAll(pattern)) {
      const { args, close } = callArguments(text, match.index + match[0].length - 1);
      if (isBad({ args, after: text.slice(close + 1, close + 40) })) {
        found.push(`${file}:${lineOf(text, match.index)} ${match[0].trim()}`);
      }
    }
  }
  return found;
}

// With or without `new`; Intl.DateTimeFormat() can be called as a function.
const DATE_TIME_FORMAT = /(?:new\s+)?Intl\.DateTimeFormat\(/g;
// Date#toLocaleString/DateString/TimeString. Numbers: use Intl.NumberFormat.
const TO_LOCALE_STRING = /\.toLocale(?:Date|Time)?String\(/g;

describe("client date formatting", () => {
  const sources = clientSources();

  it("finds the client source", () => {
    expect(sources.some((item) => item.file === "lib/format-date.ts")).toBe(true);
    expect(sources.some((item) => item.file === "components/forecast-card.tsx")).toBe(true);
    expect(sources.some((item) => item.file.startsWith("lib/server/"))).toBe(false);
  });

  it("gives every date formatter a timeZone", () => {
    // Use formatIsoUtc (lib/format-date.ts) for a diary day. A real instant
    // (a save time) passes the chosen zone: resolveTimeZone(timeZone).
    const missing = [
      ...findCalls(
        sources,
        DATE_TIME_FORMAT,
        // Reading the device zone (resolvedOptions) formats nothing.
        ({ args, after }) => !args.includes("timeZone") && !/^\s*\.resolvedOptions\(/.test(after),
      ),
      ...findCalls(sources, TO_LOCALE_STRING, ({ args }) => !args.includes("timeZone")),
      // These always print the local clock and take no zone.
      ...findCalls(sources, /\.to(?:Date|Time)String\(/g, () => true),
    ];
    expect(missing).toEqual([]);
  });

  it("formats diary days in UTC, never in a chosen zone", () => {
    // A file that turns a day key into a UTC midnight (`${iso}T00:00:00Z`)
    // must read it back in UTC. Any other zone shows the day before west of
    // UTC, or the day after east of it.
    const wrong: string[] = [];
    for (const { file, text } of sources) {
      if (!text.includes("T00:00:00Z")) continue;
      for (const match of text.matchAll(DATE_TIME_FORMAT)) {
        const { args, close } = callArguments(text, match.index + match[0].length - 1);
        if (/^\s*\.resolvedOptions\(/.test(text.slice(close + 1, close + 40))) continue;
        if (!/timeZone:\s*"UTC"/.test(args)) wrong.push(`${file}:${lineOf(text, match.index)}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it("reads and changes dates on the UTC clock only", () => {
    // Day math is getUTC*/setUTC* on UTC midnights; the person's clock comes
    // from todayIsoIn() / useTodayIso().
    const local: string[] = [];
    const pattern = /\.(?:get|set)(?:Date|Day|Month|FullYear|Hours|Minutes)\(/g;
    for (const { file, text } of sources) {
      for (const match of text.matchAll(pattern)) {
        local.push(`${file}:${lineOf(text, match.index)} ${match[0]}`);
      }
    }
    expect(local).toEqual([]);
  });

  it("builds dates from parts in UTC only", () => {
    // new Date(2026, 11, 5) is local midnight: 05:00 UTC in New York, and the
    // day before in UTC east of it. Use new Date(Date.UTC(2026, 11, 5)).
    expect(findCalls(sources, /\bnew\s+Date\(/g, ({ args }) => hasSeveralArguments(args))).toEqual([]);
  });
});

describe("the date formatting scan", () => {
  // The scan's own checks, on snippets of the bugs it is meant to catch.
  function scan(text: string) {
    const source = [{ file: "sample.tsx", text }];
    return {
      formatter: [
        ...findCalls(
          source,
          DATE_TIME_FORMAT,
          ({ args, after }) => !args.includes("timeZone") && !/^\s*\.resolvedOptions\(/.test(after),
        ),
        ...findCalls(source, TO_LOCALE_STRING, ({ args }) => !args.includes("timeZone")),
      ],
      localDate: findCalls(source, /\bnew\s+Date\(/g, ({ args }) => hasSeveralArguments(args)),
    };
  }

  it("flags formatters without a zone, with or without new", () => {
    expect(scan('new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)').formatter).toHaveLength(1);
    expect(scan('Intl.DateTimeFormat(locale, { weekday: "short" }).format(d)').formatter).toHaveLength(1);
    expect(scan("new Date(`${iso}T00:00:00Z`).toLocaleString(locale, { weekday: \"short\" })").formatter).toHaveLength(1);
    expect(scan("date.toLocaleDateString(locale)").formatter).toHaveLength(1);
  });

  it("lets zoned formatters and the device-zone lookup through", () => {
    expect(scan('new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" })').formatter).toEqual([]);
    expect(scan("Intl.DateTimeFormat().resolvedOptions().timeZone").formatter).toEqual([]);
    expect(scan("text.toLocaleLowerCase(locale)").formatter).toEqual([]);
  });

  it("flags local dates built from parts", () => {
    expect(scan("new Date(year, month - 1, day).toISOString()").localDate).toHaveLength(1);
    expect(scan("new Date(Date.UTC(year, month - 1, day))").localDate).toEqual([]);
    expect(scan("new Date(`${iso}T00:00:00Z`)").localDate).toEqual([]);
    expect(scan("new Date()").localDate).toEqual([]);
  });
});
