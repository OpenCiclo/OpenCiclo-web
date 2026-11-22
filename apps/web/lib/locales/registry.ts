// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { IS_IOS_APP, IS_NATIVE_APP } from "@/lib/app-target";
import { contentLocale, messages, type BaseLocale, type Locale, type Messages } from "@/lib/i18n";
import { withAndroidCopy } from "@/lib/locales/android-copy";
import { withIosCopy } from "@/lib/locales/ios-copy";
import { enMail, esMail, type MailCopy } from "@/lib/mail-copy";
import type { MarketingCopy } from "@/lib/marketing/copy";

// Every text of one language: the app (Messages), the landing (MarketingCopy),
// and the code email (MailCopy). Spanish and English app texts ship with every
// page; their landing copy only with the public site (`marketingCopy` in
// lib/marketing/locale.ts), so app screens never carry it. The other languages
// are one file each in this folder, loaded the first time they are needed, so
// a page never carries ten languages it does not show. No React here: the
// server reads mail copy from this file (use-locale-messages.ts has the hook).

export type LocaleModule = {
  messages: Messages;
  marketing: MarketingCopy;
  mail: MailCopy;
};

type LoadedLocale = Exclude<Locale, BaseLocale>;

const BUNDLED: Record<BaseLocale, Omit<LocaleModule, "marketing">> = {
  es: { messages: messages.es, mail: esMail },
  en: { messages: messages.en, mail: enMail },
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

/**
 * The texts of a language other than Spanish and English once its file has
 * loaded, or null (always null for those two: their landing copy is not here).
 */
export function loadedLocaleModule(locale: Locale): LocaleModule | null {
  return loaded.get(locale) ?? null;
}

/** Loads a language once. Resolves at once for Spanish and English, with no landing copy. */
export function loadLocale(locale: Locale): Promise<Omit<LocaleModule, "marketing">> {
  if (isBundled(locale)) return Promise.resolve(BUNDLED[locale]);
  const ready = loaded.get(locale);
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
function moduleOrFallback(locale: Locale): Omit<LocaleModule, "marketing"> {
  return (isBundled(locale) ? BUNDLED[locale] : loaded.get(locale)) ?? BUNDLED[contentLocale(locale)];
}

// One swapped copy per language, so the hook's snapshot stays the same object.
const appMessages = new WeakMap<Messages, Messages>();

/**
 * The app's texts. The apps get their own wording where the web says "browser"
 * (android-copy.ts), and the iOS app also where Android names its own things
 * (Google Play, the fingerprint: ios-copy.ts).
 */
export function messagesFor(locale: Locale): Messages {
  const messages = moduleOrFallback(locale).messages;
  if (!IS_NATIVE_APP) return messages;
  let swapped = appMessages.get(messages);
  if (!swapped) {
    swapped = IS_IOS_APP ? withIosCopy(messages) : withAndroidCopy(messages);
    appMessages.set(messages, swapped);
  }
  return swapped;
}

/** For the server, which can wait for the file. */
export async function mailCopy(locale: Locale): Promise<MailCopy> {
  try {
    return (await loadLocale(locale)).mail;
  } catch {
    return BUNDLED[contentLocale(locale)].mail;
  }
}
