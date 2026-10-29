// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useCiclo } from "@/lib/client/ciclo-context";
import { LEARN_CATEGORY_COPY, articleCopy, hasArticleCopy, type LearnArticle } from "@/lib/learn/articles";
import { formatIsoUtc } from "@/lib/format-date";

export function LearnArticleView({ article, related }: { article: LearnArticle | null; related: LearnArticle[] }) {
  const { t, locale } = useCiclo();
  if (!article) {
    return (
      <AppShell>
        <Link href="/learn" className="text-sm font-medium text-primary underline">
          {t.backToLearn}
        </Link>
      </AppShell>
    );
  }
  const copy = articleCopy(article, locale);
  const lang = hasArticleCopy(article, locale) ? undefined : "en";

  return (
    <AppShell size="reading">
      <article className="flex flex-col gap-5 pb-4 desktop:gap-6">
        <header className="animate-fade-up">
          <Link href="/learn" className="text-sm font-medium text-primary underline">
            {t.backToLearn}
          </Link>
          <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">
            {t[LEARN_CATEGORY_COPY[article.category].title]}
          </p>
          <h1 lang={lang} className="mt-1 font-serif text-3xl leading-tight text-foreground desktop:mt-2 desktop:text-5xl desktop:tracking-tight desktop:text-balance">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.learnReviewed}: {formatIsoUtc(article.reviewedAt, locale, { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {lang ? <Badge className="mt-2">{t.learnEnglishOnly}</Badge> : null}
        </header>
        <p lang={lang} className="text-sm leading-relaxed text-muted-foreground desktop:text-lg desktop:text-pretty">{copy.summary}</p>
        {copy.sections.map((section) => (
          <section key={section.heading} lang={lang} className="rounded-3xl bg-card p-5 shadow-sm desktop:border desktop:border-border/70 desktop:p-7">
            <h2 className="font-serif text-lg text-card-foreground desktop:text-2xl">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground desktop:mt-3 desktop:text-base">{section.body}</p>
          </section>
        ))}
        <p lang={lang} className="rounded-3xl border border-primary/20 bg-primary/8 p-4 text-sm leading-relaxed text-muted-foreground">
          {copy.notice}
        </p>
        <section>
          <h2 className="font-serif text-lg text-foreground">{t.learnSources}</h2>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {article.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} className="text-primary underline" target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
        {related.length > 0 ? (
          <section>
            <h2 className="font-serif text-lg text-foreground">{t.learnRelated}</h2>
            <ul className="mt-2 flex flex-col gap-2 desktop:mt-3 desktop:grid desktop:grid-cols-2 desktop:gap-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/learn/${item.slug}`}
                    lang={hasArticleCopy(item, locale) ? undefined : "en"}
                    className="block rounded-3xl bg-card p-4 font-serif text-base text-card-foreground shadow-sm transition-transform active:scale-[0.99] desktop:h-full desktop:border desktop:border-border/70 desktop:p-5 desktop:hover:-translate-y-0.5"
                  >
                    {articleCopy(item, locale).title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}
