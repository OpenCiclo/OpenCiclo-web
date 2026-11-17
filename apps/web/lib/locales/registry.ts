// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { contentLocale, messages, type BaseLocale, type Locale, type Messages } from "@/lib/i18n";
import { enMail, esMail, type MailCopy } from "@/lib/mail-copy";
import { enMarketing, esMarketing, type MarketingCopy } from "@/lib/marketing/copy";

// Every text of one language: the app (Messages), the landing (MarketingCopy),
// and the code email (MailCopy). Spanish and English ship with every page.
// The others are one file each in this folder, loaded the first time they are
// needed, so a page never carries ten languages it does not show. No React here:
// the server reads mail copy from this file (use-locale-messages.ts has the hook).

export type LocaleModule = {
  messages: Messages;
  marketing: MarketingCopy;
  mail: MailCopy;
};

type LoadedLocale = Exclude<Locale, BaseLocale>;

const BUNDLED: Record<BaseLocale, LocaleModule> = {
  es: { messages: messages.es, marketing: esMarketing, mail: esMail },
  en: { messages: messages.en, marketing: enMarketing, mail: enMail },
};

const LOADERS: Record<LoadedLocale, () => Promise<{ default: LocaleModule }>> = {
  "pt-BR": () => import("./pt-BR"),
  fr: () => import("./fr"),
  de: () => import("./de"),
  it: () => import("./it"),
  nl: () => import("./nl"),
  pl: () => import("./pl"),
  ca: () => import("./ca"),
  "ca-valencia": () => import("./ca-valencia"),
  eu: () => import("./eu"),
  gl: () => import("./gl"),
};

const loaded = new Map<Locale, LocaleModule>();
const pending = new Map<Locale, Promise<LocaleModule>>();
const listeners = new Set<() => void>();

function isBundled(locale: Locale): locale is BaseLocale {
  return locale === "es" || locale === "en";
}

/** The language's texts if they are ready, or null while they still have to load. */
export function localeModule(locale: Locale): LocaleModule | null {
  return isBundled(locale) ? BUNDLED[locale] : (loaded.get(locale) ?? null);
}

/** Loads a language once. Resolves at once for Spanish and English. */
export function loadLocale(locale: Locale): Promise<LocaleModule> {
  const ready = localeModule(locale);
  if (ready) return Promise.resolve(ready);
  let promise = pending.get(locale);
  if (!promise) {
    promise = LOADERS[locale as LoadedLocale]()
      .then(({ default: module }) => {
        loaded.set(locale, module);
        for (const listener of listeners) listener();
        return module;
      })
      .finally(() => pending.delete(locale));
    pending.set(locale, promise);
  }
  return promise;
}

/** Calls `listener` whenever another language finishes loading. */
export function subscribeLocales(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Until a language has loaded, its texts are Spanish or English (see `contentLocale`). */
function moduleOrFallback(locale: Locale): LocaleModule {
  return localeModule(locale) ?? BUNDLED[contentLocale(locale)];
}

export function messagesFor(locale: Locale): Messages {
  return moduleOrFallback(locale).messages;
}

export function marketingCopy(locale: Locale): MarketingCopy {
  return moduleOrFallback(locale).marketing;
}

/** For the server, which can wait for the file. */
export async function mailCopy(locale: Locale): Promise<MailCopy> {
  try {
    return (await loadLocale(locale)).mail;
  } catch {
    return BUNDLED[contentLocale(locale)].mail;
  }
}
