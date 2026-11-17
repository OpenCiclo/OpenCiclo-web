// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { LOCALES, messages } from "@/lib/i18n";
import { enMail, esMail } from "@/lib/mail-copy";
import { enMarketing, esMarketing } from "@/lib/marketing/copy";
import type { LocaleModule } from "@/lib/locales/registry";

// Every language file in this folder, checked against English: the same keys,
// the same {placeholders}, nothing empty, and the landing's links, icons and
// list lengths unchanged. Run one language with `-t <tag>`.

const files = import.meta.glob<{ default: LocaleModule }>("./*.ts", { eager: true });

const modules: Record<string, LocaleModule> = {
  es: { messages: messages.es, marketing: esMarketing, mail: esMail },
  en: { messages: messages.en, marketing: enMarketing, mail: enMail },
};
for (const [path, file] of Object.entries(files)) {
  const tag = path.replace("./", "").replace(".ts", "");
  // Skip the registry, the hook and the tests: only language files hold a LocaleModule.
  if (!(LOCALES as readonly string[]).includes(tag)) continue;
  modules[tag] = file.default;
}

const english = modules.en;

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{[a-zA-Z]+\}/g)].map((match) => match[0]).sort();
}

/** Leaves of a nested copy object as path → value, keeping array positions. */
function leaves(value: unknown, path = ""): Map<string, unknown> {
  const out = new Map<string, unknown>();
  if (Array.isArray(value)) {
    value.forEach((item, index) => leaves(item, `${path}[${index}]`).forEach((v, k) => out.set(k, v)));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      leaves(item, path ? `${path}.${key}` : key).forEach((v, k) => out.set(k, v));
    }
  } else {
    out.set(path, value);
  }
  return out;
}

// Fields that are identifiers or links, not text: they must match English exactly.
const VERBATIM = /(^|\.)(href|icon|key|external)$/;

describe("locale files", () => {
  it("cover every language in LOCALES, and nothing else", () => {
    expect(Object.keys(modules).sort()).toEqual([...LOCALES].sort());
  });

  for (const tag of LOCALES) {
    describe(tag, () => {
      const locale = modules[tag];

      it("has the same app keys as English, none empty, with the same placeholders", () => {
        expect(Object.keys(locale.messages).sort()).toEqual(Object.keys(english.messages).sort());
        for (const [key, text] of Object.entries(locale.messages)) {
          const reference = english.messages[key as keyof typeof english.messages];
          expect(typeof text, key).toBe("string");
          expect(text.trim(), key).not.toBe("");
          expect(placeholders(text), key).toEqual(placeholders(reference));
        }
      });

      it("has the landing's shape, links and icons unchanged", () => {
        const mine = leaves(locale.marketing);
        const reference = leaves(english.marketing);
        expect([...mine.keys()].sort()).toEqual([...reference.keys()].sort());
        for (const [path, value] of reference) {
          if (VERBATIM.test(path)) {
            expect(mine.get(path), path).toEqual(value);
          } else if (typeof value === "string") {
            const text = mine.get(path);
            expect(typeof text, path).toBe("string");
            expect((text as string).trim(), path).not.toBe("");
            expect(placeholders(text as string), path).toEqual(placeholders(value));
          }
        }
      });

      it("has a code email whose first paragraph ends with {code}", () => {
        expect(locale.mail.subject.trim()).not.toBe("");
        expect(locale.mail.paragraphs).toHaveLength(english.mail.paragraphs.length);
        expect(locale.mail.paragraphs[0]).toMatch(/\{code\}[\s.]*$/);
        for (const paragraph of locale.mail.paragraphs.slice(1)) {
          expect(paragraph.trim()).not.toBe("");
          expect(paragraph).not.toContain("{code}");
        }
      });
    });
  }
});
