// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { ChevronRight } from "lucide-react";

import { appVersionLabel } from "@/lib/app-target";
import { useCiclo } from "@/lib/client/ciclo-context";
import type { HelpBodies } from "@/lib/help/bodies";
import { HELP_SECTIONS, findHelpArticle, helpArticlesInSection } from "@/lib/help/articles";
import { MarkdownDocument } from "@/lib/help/markdown";
import { contentLocale } from "@/lib/i18n";
import type { LicenseReport } from "@/lib/licenses/collect";
import { privacyPolicy } from "@/lib/privacy/policy";
import { Card } from "@/components/ui/card";
import { LegalDocument } from "@/components/legal-document";
import { LicensesList } from "@/components/licenses-view";
import { ReadingSheet, SheetLoadState } from "@/components/reading-sheet";

type Doc = "privacy" | "help" | "licenses";

/**
 * Settings' "About" card: the privacy policy, Help and the open-source
 * licenses, each opened in a sheet over Settings (no page change), and the
 * version of the app.
 */
export function SettingsAbout() {
  const { t } = useCiclo();
  const [open, setOpen] = useState<Doc | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const rows: { doc: Doc; label: string }[] = [
    { doc: "privacy", label: t.privacy },
    { doc: "help", label: t.helpDocs },
    { doc: "licenses", label: t.licensesTitle },
  ];
  return (
    <Card className="mt-4 flex flex-col gap-1 rounded-3xl">
      <p className="mb-1 font-medium">{t.aboutTitle}</p>
      {rows.map((row) => (
        <button
          key={row.doc}
          type="button"
          onClick={() => setOpen(row.doc)}
          className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/60 active:bg-muted"
        >
          {row.label}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      ))}
      <p className="mt-2 text-xs text-muted-foreground">{t.appVersion.replace("{version}", appVersionLabel())}</p>
      {open === "privacy" ? <PrivacySheet onClose={close} /> : null}
      {open === "help" ? <HelpSheet onClose={close} /> : null}
      {open === "licenses" ? <LicensesSheet onClose={close} /> : null}
    </Card>
  );
}

function PrivacySheet({ onClose }: { onClose: () => void }) {
  const { t, locale } = useCiclo();
  const lang = contentLocale(locale);
  const fallback = lang !== locale;
  const doc = privacyPolicy(lang);
  return (
    <ReadingSheet title={doc.title} onClose={onClose}>
      <LegalDocument
        doc={doc}
        hideTitle
        lang={fallback ? lang : undefined}
        badge={fallback ? (lang === "es" ? t.learnSpanishOnly : t.learnEnglishOnly) : undefined}
      />
    </ReadingSheet>
  );
}

/**
 * A JSON file built with the app (/help.json, /licenses.json), fetched when
 * its sheet opens. Same origin on the web; a file inside the Android app.
 */
function useBuiltJson<T>(path: string) {
  const [state, setState] = useState<{ data: T | null; failed: boolean }>({ data: null, failed: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) setState({ data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [path, attempt]);
  const retry = useCallback(() => {
    setState({ data: null, failed: false });
    setAttempt((value) => value + 1);
  }, []);
  return { ...state, retry };
}

function LicensesSheet({ onClose }: { onClose: () => void }) {
  const { t } = useCiclo();
  const { data, failed, retry } = useBuiltJson<LicenseReport>("/licenses.json");
  return (
    <ReadingSheet title={t.licensesTitle} onClose={onClose}>
      {data ? <LicensesList report={data} /> : <SheetLoadState failed={failed} onRetry={retry} />}
    </ReadingSheet>
  );
}

const HELP_ARTICLE_PATH = /^\/help\/([a-z0-9-]+)\/?$/;

/** Help (English, like /help): the index, and an article in the same sheet. */
function HelpSheet({ onClose }: { onClose: () => void }) {
  const { t } = useCiclo();
  const { data, failed, retry } = useBuiltJson<HelpBodies>("/help.json");
  const [slug, setSlug] = useState<string | null>(null);
  const article = slug ? findHelpArticle(slug) : undefined;

  // A link to another Help article opens it here; other app links leave
  // Settings as links do (the sheet goes with the screen).
  function onLinkClick(event: MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as HTMLElement).closest("a");
    const match = anchor ? HELP_ARTICLE_PATH.exec(anchor.getAttribute("href") ?? "") : null;
    if (!match || !findHelpArticle(match[1])) return;
    event.preventDefault();
    event.stopPropagation();
    setSlug(match[1]);
  }

  if (article) {
    const body = data?.[article.slug];
    return (
      <ReadingSheet
        title={article.title}
        eyebrow={t.helpDocs}
        onClose={onClose}
        onBack={() => setSlug(null)}
        contentKey={article.slug}
      >
        <div lang="en" className="flex flex-col gap-4" onClickCapture={onLinkClick}>
          <p className="text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
          {body !== undefined ? <MarkdownDocument source={body} /> : <SheetLoadState failed={failed} onRetry={retry} />}
        </div>
      </ReadingSheet>
    );
  }

  return (
    <ReadingSheet title="How Ciclo works" eyebrow={t.helpDocs} onClose={onClose} contentKey="index">
      <div lang="en" className="flex flex-col gap-6">
        {HELP_SECTIONS.map((section) => (
          <section key={section.id} className="flex flex-col gap-2">
            <h3 className="font-serif text-xl">{section.title}</h3>
            <ul className="flex flex-col gap-2">
              {helpArticlesInSection(section.id).map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => setSlug(item.slug)}
                    className="block w-full rounded-2xl bg-background p-4 text-left transition-transform active:scale-[0.99]"
                  >
                    <span className="block font-serif text-lg">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ReadingSheet>
  );
}
