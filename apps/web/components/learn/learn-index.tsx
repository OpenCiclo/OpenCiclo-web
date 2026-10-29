// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useCiclo } from "@/lib/client/ciclo-context";
import { useIsGhost } from "@/lib/client/ghost";
import { formatIsoUtc } from "@/lib/format-date";
import {
  LEARN_CATEGORIES,
  LEARN_CATEGORY_COPY,
  articleCopy,
  hasArticleCopy,
  relatedArticles,
  type LearnArticle,
  type LearnCategory,
} from "@/lib/learn/articles";
import { cn } from "@/lib/utils";

/** Pixels from the top of the screen where the compact bar's filters sit. */
const BAR_PADDING = 8;
/** The magnifier bubble's width plus the gap after it: how far the filters move to make room. */
const BUBBLE_ROOM = 52;

export function LearnIndex({ articles }: { articles: LearnArticle[] }) {
  const { t, locale } = useCiclo();
  const ghost = useIsGhost();
  // Scrolled down, the search box and the filters turn into a compact bar
  // stuck to the top: a magnifier bubble, and the filters beside it, which
  // scroll sideways. The bar takes over when the filters reach the top, and
  // the block it replaces scrolls away as before, so the list never jumps.
  const chipsRef = useRef<HTMLDivElement>(null);
  const barChipsRef = useRef<HTMLDivElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  // The bubble opened the search box in the bar: it keeps the bar up while
  // it has the focus, so the keyboard stays put even when fewer results make
  // the page short. With text in it, the bar shows the box instead of the bubble.
  const [barSearch, setBarSearch] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [category, setCategory] = useState<LearnCategory | null>(null);
  const [query, setQuery] = useState("");
  const activeArticle = useMemo(
    () => (activeSlug ? articles.find((article) => article.slug === activeSlug) ?? null : null),
    [activeSlug, articles],
  );
  const activeCopy = activeArticle ? articleCopy(activeArticle, locale) : null;
  const activeLang = activeArticle && !hasArticleCopy(activeArticle, locale) ? "en" : undefined;
  const activeRelated = useMemo(
    () => (activeArticle ? relatedArticles(activeArticle, articles) : []),
    [activeArticle, articles],
  );

  const categories = useMemo(
    () => LEARN_CATEGORIES.filter((value) => articles.some((article) => article.category === value)),
    [articles],
  );

  const groups = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return categories
      .filter((value) => category === null || value === category)
      .map((value) => ({
        category: value,
        articles: articles.filter((article) => {
          if (article.category !== value) return false;
          if (!needle) return true;
          const copy = articleCopy(article, locale);
          return `${copy.title} ${copy.summary}`.toLocaleLowerCase(locale).includes(needle);
        }),
      }))
      .filter((group) => group.articles.length > 0)
      .map((group, index, all) => ({
        ...group,
        // Position of the group's first card across the whole list, for the staggered fade-in.
        firstCard: all.slice(0, index).reduce((count, previous) => count + previous.articles.length, 0),
      }));
  }, [articles, categories, category, query, locale]);

  const compact = scrolledPast || barSearch;

  useEffect(() => {
    // A ghost (see TabGhosts) sits at the top and out of sight: never compact.
    if (ghost) return;
    const row = chipsRef.current;
    if (!row) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const top = entry.rootBounds?.top ?? BAR_PADDING;
        setScrolledPast(entry.intersectionRatio < 1 && entry.boundingClientRect.top < top);
      },
      { rootMargin: `-${BAR_PADDING}px 0px 0px 0px`, threshold: 1 },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, [ghost]);

  // The two rows of filters show the same chips: hand over how far they
  // were scrolled, so the one taking over starts where the other was.
  useLayoutEffect(() => {
    const from = compact ? chipsRef.current : barChipsRef.current;
    const to = compact ? barChipsRef.current : chipsRef.current;
    if (from && to) to.scrollLeft = from.scrollLeft;
  }, [compact]);

  // On Android, hiding the keyboard keeps the focus in the box. Empty, it
  // closes once the list is scrolled, and the bubble and filters come back.
  useEffect(() => {
    if (!barSearch || query !== "") return;
    const close = () => (document.activeElement as HTMLElement | null)?.blur();
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [barSearch, query]);

  /** From the bar, a new filter or search starts the list again right under the bar. */
  function showListTop() {
    const row = chipsRef.current;
    if (!compact || !row) return;
    window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - BAR_PADDING + 1, behavior: "instant" });
  }

  const closeOverlay = useCallback(() => {
    if (!activeArticle || closing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveSlug(null);
      setClosing(false);
      return;
    }
    setClosing(true);
  }, [activeArticle, closing]);

  useEffect(() => {
    if (!activeArticle || closing) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeOverlay();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeArticle, closing, closeOverlay]);

  return (
    <AppShell>
      <h1 className="mb-3 font-serif text-xl text-foreground">{t.learn}</h1>
      <div className="flex flex-col gap-5 pb-4">
        {/* The compact bar. Sticky and of no height, so it takes no room in
            the list; it shows only once the filters below reach the top. */}
        <div className="sticky top-0 z-20 -mx-5 -mb-5 h-0">
          <div
            aria-hidden={!compact}
            inert={!compact}
            className={cn(
              "absolute inset-x-0 top-0 transition-opacity duration-200 motion-reduce:transition-none",
              compact ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {/* Blurred and see-through, it runs on a little below the bar and
                fades out there, so the list does not end at a hard edge. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -bottom-6 bg-background/90 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
            />
            {barSearch || (compact && query !== "") ? (
              <label className="relative mx-5 my-2 block">
                <span className="sr-only">{t.learnSearchPlaceholder}</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  autoFocus={barSearch}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    // Not for an emptied box: that scroll would close it mid-edit.
                    if (event.target.value) showListTop();
                  }}
                  onBlur={() => setBarSearch(false)}
                  placeholder={t.learnSearchPlaceholder}
                  className="flex min-h-11 w-full rounded-full border border-input bg-card py-2 pr-4 pl-10 text-base shadow-sm md:text-sm"
                />
              </label>
            ) : (
              <>
                {/* The filters run the whole width, under the bubble: scrolled
                    left, they slip behind its circle. */}
                <div
                  ref={barChipsRef}
                  role="group"
                  aria-label={t.learnCategoriesLabel}
                  className={cn(
                    // As tall as the bubble with its margin, so both sit on one line.
                    "relative flex h-15 items-center gap-2 overflow-x-auto pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    "transition-transform duration-300 ease-out motion-reduce:transition-none",
                  )}
                  style={{
                    paddingLeft: `calc(1.25rem + ${BUBBLE_ROOM}px)`,
                    transform: compact ? undefined : `translateX(-${BUBBLE_ROOM}px)`,
                  }}
                >
                  <CategoryChips
                    categories={categories}
                    category={category}
                    onPick={(value) => {
                      setCategory(value);
                      showListTop();
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t.learnSearchPlaceholder}
                  onClick={() => setBarSearch(true)}
                  className={cn(
                    "absolute top-2 left-5 grid size-11 place-items-center rounded-full border border-input bg-card shadow-sm transition-transform duration-300 active:scale-95 motion-reduce:transition-none",
                    compact ? "scale-100" : "scale-50",
                  )}
                >
                  <Search className="size-4 text-muted-foreground" aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="animate-fade-up flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">{t.learnSearchPlaceholder}</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.learnSearchPlaceholder}
              className="flex min-h-11 w-full rounded-full border border-input bg-card py-2 pr-4 pl-10 text-base shadow-sm md:text-sm"
            />
          </label>
          <div
            ref={chipsRef}
            role="group"
            aria-label={t.learnCategoriesLabel}
            aria-hidden={compact}
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <CategoryChips categories={categories} category={category} onPick={setCategory} />
          </div>
        </div>

        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.learnNoResults}</p>
        ) : null}

        {groups.map((group) => (
          <section key={group.category} aria-labelledby={`learn-group-${group.category}`} className="flex flex-col gap-3">
            <div className="px-1">
              <h2 id={`learn-group-${group.category}`} className="font-serif text-xl text-foreground">
                {t[LEARN_CATEGORY_COPY[group.category].title]}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t[LEARN_CATEGORY_COPY[group.category].description]}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {group.articles.map((article, index) => {
                const copy = articleCopy(article, locale);
                const lang = hasArticleCopy(article, locale) ? undefined : "en";
                const delay = 60 + Math.min(group.firstCard + index, 6) * 50;
                return (
                  <li key={article.slug}>
                    <Link
                      href={`/learn/${article.slug}`}
                      onClick={(event) => {
                        event.preventDefault();
                        setClosing(false);
                        setActiveSlug(article.slug);
                      }}
                      className="animate-fade-up block rounded-3xl bg-card p-5 shadow-sm transition-transform active:scale-[0.99]"
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      <h3 lang={lang} className="font-serif text-xl text-card-foreground">{copy.title}</h3>
                      <p lang={lang} className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.summary}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {activeArticle && activeCopy ? (
        // Phones: the card fills the screen with the same 1rem margin on every
        // side (plus the status bar / gesture bar insets). Larger screens: centered.
        <div className="fixed inset-0 z-50 flex justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t.close}
            onClick={closeOverlay}
            className={closing ? "animate-overlay-out absolute inset-0 bg-foreground/40" : "animate-overlay-in absolute inset-0 bg-foreground/40"}
          />
          <article
            role="dialog"
            aria-modal="true"
            aria-label={activeCopy.title}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) return;
              if (closing) {
                setActiveSlug(null);
                setClosing(false);
              }
            }}
            className={
              closing
                ? "animate-learn-card-out relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-2xl sm:h-auto sm:max-h-[88vh]"
                : "animate-learn-card-in relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-2xl sm:h-auto sm:max-h-[88vh]"
            }
          >
            <div className="shrink-0 border-b border-border px-5 py-4">
              <button
                type="button"
                onClick={closeOverlay}
                aria-label={t.close}
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
              >
                <X className="size-5" />
              </button>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {t[LEARN_CATEGORY_COPY[activeArticle.category].title]}
              </p>
              <h2 lang={activeLang} className="mt-1 pr-10 font-serif text-2xl text-card-foreground">{activeCopy.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.learnReviewed}: {formatIsoUtc(activeArticle.reviewedAt, locale, { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {activeLang ? <Badge className="mt-2">{t.learnEnglishOnly}</Badge> : null}
            </div>
            {/* Keyed so the scroll position resets when a related article replaces the current one. */}
            <div key={activeArticle.slug} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
              <p lang={activeLang} className="text-sm leading-relaxed text-muted-foreground">{activeCopy.summary}</p>
              {activeCopy.sections.map((section) => (
                <section key={section.heading} lang={activeLang} className="rounded-3xl bg-background p-4">
                  <h3 className="font-serif text-lg text-card-foreground">{section.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                </section>
              ))}
              <p lang={activeLang} className="rounded-3xl border border-primary/20 bg-primary/8 p-4 text-sm leading-relaxed text-muted-foreground">
                {activeCopy.notice}
              </p>
              <section>
                <h3 className="font-serif text-lg text-foreground">{t.learnSources}</h3>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {activeArticle.sources.map((source) => (
                    <li key={source.href}>
                      <a href={source.href} className="text-primary underline" target="_blank" rel="noreferrer">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              {activeRelated.length > 0 ? (
                <section>
                  <h3 className="font-serif text-lg text-foreground">{t.learnRelated}</h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {activeRelated.map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/learn/${related.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveSlug(related.slug);
                          }}
                          lang={hasArticleCopy(related, locale) ? undefined : "en"}
                          className="block rounded-3xl bg-background p-4 font-serif text-base text-card-foreground transition-transform active:scale-[0.99]"
                        >
                          {articleCopy(related, locale).title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}
    </AppShell>
  );
}

/** The filters: all articles, then one chip per category. */
function CategoryChips({
  categories,
  category,
  onPick,
}: {
  categories: LearnCategory[];
  category: LearnCategory | null;
  onPick: (value: LearnCategory | null) => void;
}) {
  const { t } = useCiclo();
  return (
    <>
      <CategoryChip active={category === null} onClick={() => onPick(null)}>
        {t.learnAll}
      </CategoryChip>
      {categories.map((value) => (
        <CategoryChip key={value} active={category === value} onClick={() => onPick(value)}>
          {t[LEARN_CATEGORY_COPY[value].title]}
        </CategoryChip>
      ))}
    </>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all active:scale-95",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
