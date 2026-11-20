// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { LOCALES, messages, type Messages } from "@/lib/i18n";
import { ANDROID_COPY, withAndroidCopy } from "@/lib/locales/android-copy";
import type { LocaleModule } from "@/lib/locales/registry";

// The language files only (locales.test.ts imports every .ts next to it, so this test lives here).
const files = import.meta.glob<{ default: LocaleModule }>(["./locales/*.ts", "!./locales/*.test.ts"], {
  eager: true,
});
const all: Record<string, Messages> = { es: messages.es, en: messages.en };
for (const [path, file] of Object.entries(files)) {
  const tag = path.replace("./locales/", "").replace(".ts", "");
  if ((LOCALES as readonly string[]).includes(tag)) all[tag] = file.default.messages;
}

// "browser" in the twelve languages, as the web copy spells it.
const BROWSER = /navegador|browser|navigateur|przeglądar|nabigatzaile/i;

describe("withAndroidCopy", () => {
  it("puts the Android wording in place of the web one and keeps the rest", () => {
    const android = withAndroidCopy(messages.en);
    expect(android.passwordHint).toBe(messages.en.passwordHintAndroid);
    expect(android.welcomeCta).toBe(messages.en.welcomeCtaAndroid);
    expect(android.disclaimer).toBe(messages.en.disclaimer);
    // The input is left alone.
    expect(messages.en.passwordHint).not.toBe(messages.en.passwordHintAndroid);
  });

  it.each(Object.keys(all))("%s: the Android wording never says browser", (tag) => {
    const copy = all[tag];
    for (const [webKey, androidKey] of Object.entries(ANDROID_COPY) as Array<[keyof Messages, keyof Messages]>) {
      expect(copy[webKey], `${tag}.${webKey}`).toMatch(BROWSER);
      expect(copy[androidKey], `${tag}.${androidKey}`).not.toMatch(BROWSER);
    }
  });
});

describe("messagesFor", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("swaps the Android wording in the Android build, always the same object", async () => {
    vi.stubEnv("NEXT_PUBLIC_CICLO_TARGET", "android");
    vi.resetModules();
    const { messagesFor } = await import("@/lib/locales/registry");
    expect(messagesFor("es").keepLoggedInHint).toBe(messages.es.keepLoggedInHintAndroid);
    // useSyncExternalStore needs a stable snapshot.
    expect(messagesFor("es")).toBe(messagesFor("es"));
  });

  it("keeps the web wording on the web", async () => {
    vi.resetModules();
    const { messagesFor } = await import("@/lib/locales/registry");
    expect(messagesFor("es").keepLoggedInHint).toBe(messages.es.keepLoggedInHint);
    expect(messagesFor("es")).toBe(messagesFor("es"));
  });
});
