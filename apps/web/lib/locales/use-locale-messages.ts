// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Locale, Messages } from "@/lib/i18n";
import { loadLocale, messagesFor, subscribeLocales } from "@/lib/locales/registry";

/** The app's texts in `locale`, loading them if needed; re-renders once they arrive. */
export function useLocaleMessages(locale: Locale): Messages {
  const current = useSyncExternalStore(
    subscribeLocales,
    () => messagesFor(locale),
    () => messagesFor(locale),
  );
  useEffect(() => {
    void loadLocale(locale).catch(() => undefined);
  }, [locale]);
  return current;
}
