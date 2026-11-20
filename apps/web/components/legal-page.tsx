// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useCiclo } from "@/lib/client/ciclo-context";
import type { BaseLocale } from "@/lib/i18n";
import { messagesFor } from "@/lib/locales/registry";
import { legalLanguage, type LegalDoc } from "@/lib/privacy/legal-doc";
import { LegalDocument } from "@/components/legal-document";

/**
 * A legal page (/privacy, /delete-account) in the UI's language, or in the one
 * `?lang=` names. The query is read in the browser, so the prerendered page
 * shows the UI's language until it loads; nothing is saved.
 */
export function LegalPage({ build, children }: { build: (lang: BaseLocale) => LegalDoc; children?: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <LegalPageBody build={build} param={null}>
          {children}
        </LegalPageBody>
      }
    >
      <LegalPageFromUrl build={build}>{children}</LegalPageFromUrl>
    </Suspense>
  );
}

function LegalPageFromUrl({ build, children }: { build: (lang: BaseLocale) => LegalDoc; children?: React.ReactNode }) {
  const param = useSearchParams().get("lang");
  return (
    <LegalPageBody build={build} param={param}>
      {children}
    </LegalPageBody>
  );
}

function LegalPageBody({
  build,
  param,
  children,
}: {
  build: (lang: BaseLocale) => LegalDoc;
  param: string | null;
  children?: React.ReactNode;
}) {
  const { locale } = useCiclo();
  const view = legalLanguage(param, locale);
  const words = messagesFor(view.requested);
  return (
    <LegalDocument
      doc={build(view.lang)}
      lang={view.lang !== locale ? view.lang : undefined}
      badge={view.fallback ? (view.lang === "es" ? words.learnSpanishOnly : words.learnEnglishOnly) : undefined}
    >
      {children}
    </LegalDocument>
  );
}
