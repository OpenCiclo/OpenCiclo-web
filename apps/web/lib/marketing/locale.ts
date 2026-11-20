// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { contentLocale, type BaseLocale, type Locale } from "@/lib/i18n";
import { loadedLocaleModule } from "@/lib/locales/registry";
import { enMarketing, esMarketing, type MarketingCopy } from "@/lib/marketing/copy";

// The landing's copy in any language. Only the public site imports this file,
// so the Spanish and English landing copy never ships with the app's screens.
// Other languages come with their locale file (lib/locales/registry.ts), which
// the app loads when the language is chosen.

const BUNDLED: Record<BaseLocale, MarketingCopy> = { es: esMarketing, en: enMarketing };

/** Until a language has loaded, its landing copy is Spanish or English (see `contentLocale`). */
export function marketingCopy(locale: Locale): MarketingCopy {
  return loadedLocaleModule(locale)?.marketing ?? BUNDLED[contentLocale(locale)];
}
