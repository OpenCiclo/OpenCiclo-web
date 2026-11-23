// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Fragment, Suspense, lazy, useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useCiclo, useTodayIso } from "@/lib/client/ciclo-context";
import { formatIsoUtc } from "@/lib/format-date";
import { daysBetween } from "@/lib/forecast/math";
import type { SymptomId } from "@/lib/diary";
import { daysUnit, type Locale, type Messages } from "@/lib/i18n";
import { cyclePattern, cycleRegularity, cycleVariation, type CycleRow } from "@/lib/patterns/cycle-rows";
import { patternStats, type RecurringSymptom } from "@/lib/patterns/stats";
import { findSymptomMeta, symptomCategoryLabel, symptomLabel } from "@/lib/symptoms/catalog";
import { buildTipContext } from "@/lib/tips/context";
import { selectTips, symptomAdvice } from "@/lib/tips/rules";
import type { TipCard } from "@/lib/tips/types";
import { similarJournalEntries, listJournalEntries, type JournalEntry } from "@/lib/journal/entries";
import { phaseLabel } from "@/lib/cycle/phases";
import { pregnancyStatus } from "@/lib/cycle/segments";
import { nextPeriodStat } from "@/lib/cycle/period-timing";
import { ForecastCard, ForecastDetails } from "@/components/forecast-card";
import { coverageInterval } from "@/components/forecast-chart";
import { NoteViewer } from "@/components/journal/note-viewer";
import { cn } from "@/lib/utils";

// The pregnancy view brings its week-by-week texts with it: loaded only for a diary with a pregnancy going on.
const PregnancyPatterns = lazy(() =>
  import("@/components/patterns/pregnancy-patterns").then((module) => ({ default: module.PregnancyPatterns })),
);

/** The four phase inks, in the order symptoms take them (the same symptom has the same colour on every card). */
const SYMPTOM_INKS = [
  "var(--phase-menstrual-ink)",
  "var(--phase-luteal-ink)",
  "var(--phase-ovulation-ink)",
  "var(--phase-follicular-ink)",
] as const;

const INK = {
  cycles: "var(--phase-menstrual-ink)",
  forecast: "var(--primary)",
  duration: "var(--phase-follicular-ink)",
  symptoms: "var(--phase-luteal-ink)",
  notes: "var(--phase-ovulation-ink)",
  sex: "var(--primary)",
} as const;

const CARD = "animate-fade-up flex flex-col gap-3 rounded-3xl border border-border bg-card p-[18px] text-card-foreground";

/** A text with `{name}` holes, each filled with a piece of markup. */
function fill(template: string, parts: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{[a-zA-Z]+\})/).map((piece, index) => {
    const name = piece.startsWith("{") && piece.endsWith("}") ? piece.slice(1, -1) : null;
    return <Fragment key={index}>{name && name in parts ? parts[name] : piece}</Fragment>;
  });
}

/** A phrase that starts a line elsewhere, placed after "·": lower case, except in German (its nouns keep the capital). */
function midLine(text: string, locale: Locale): string {
  return locale === "de" ? text : text.toLowerCase();
}

function SectionLabel({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <p className={cn("text-xs font-extrabold tracking-[0.07em] uppercase", !color && "text-muted-foreground")} style={color ? { color } : undefined}>
      {children}
    </p>
  );
}

function Headline({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-xl leading-[1.3] text-pretty">{children}</h2>;
}

/** A tip, at the foot of the card it is about. */
function Advice({ tip, t }: { tip: TipCard | undefined; t: Messages }) {
  if (!tip) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <p className="text-[13px] font-extrabold">{t.patternsAdvice}</p>
      <p className="text-sm leading-[1.45] font-bold text-pretty">{tip.title}</p>
      <p className="text-sm leading-[1.45] text-muted-foreground text-pretty">{tip.body}</p>
    </div>
  );
}

/**
 * The Patterns tab. Top to bottom: a sentence that sums up the cycle, the
 * forecast, the last cycles one under another (each starts at day 1, so what
 * lines up repeats), cycle lengths with the averages, recurring symptoms, sex
 * and sex drive in a card of their own (sex is not a symptom), notes
 * from similar days, and a tip at the foot of the card it is about. On the
 * desktop it is the right-hand column of the calendar (see CycleDashboard).
 * Needs an unlocked diary.
 *
 * While a pregnancy goes on the screen is about it (PregnancyPatterns), and
 * the cycles from before it stay below, folded away. After it ends and until
 * her period comes back there is no forecast to show, so no forecast card.
 */
export function PatternsContent() {
  const { t, diary, locale } = useCiclo();
  const today = useTodayIso();
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [closing, setClosing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const stats = useMemo(() => patternStats(diary, today), [diary, today]);
  const pregnancy = useMemo(() => pregnancyStatus(diary.periodStarts, diary.pregnancies ?? []), [diary.periodStarts, diary.pregnancies]);
  const pregnant = pregnancy.kind === "active" ? pregnancy.record : null;
  // No open cycle: nothing is expected, so nothing is forecast (never "no bleeding days yet", never "late").
  const noCycle = pregnancy.kind === "active" || pregnancy.kind === "resuming";
  const pattern = useMemo(() => cyclePattern(diary, stats.periodRuns, stats.recurringSymptoms, stats.recurringSex), [diary, stats]);
  const tips = useMemo(() => selectTips(buildTipContext(diary, today), t), [diary, today, t]);
  const allNotes = useMemo(() => listJournalEntries(diary, stats.nextPeriodDate), [diary, stats.nextPeriodDate]);
  const similarNotes = useMemo(
    () => similarJournalEntries(diary, today, stats.nextPeriodDate, 5),
    [diary, today, stats.nextPeriodDate],
  );

  const closeViewer = useCallback(() => {
    if (!activeEntry || closing) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveEntry(null);
      setClosing(false);
      return;
    }
    setClosing(true);
  }, [activeEntry, closing]);

  const handleViewerExited = useCallback(() => {
    setActiveEntry(null);
    setClosing(false);
  }, []);

  const days = (n: number) => `${n} ${daysUnit(t, locale, n)}`;
  const label = (id: SymptomId) => {
    const meta = findSymptomMeta(id, diary.customSymptoms);
    return meta ? symptomLabel(meta, t) : id;
  };
  const inkOf = (id: SymptomId) => {
    const index = pattern.symptoms.indexOf(id);
    return index >= 0 ? SYMPTOM_INKS[index % SYMPTOM_INKS.length] : "var(--muted-foreground)";
  };

  const history = pattern.completed;
  const lengths = history.map((cycle) => cycle.length ?? 0);
  const variation = cycleVariation(lengths);
  const regularity = cycleRegularity(lengths);
  const forecast = stats.forecastingEnabled ? stats.forecast : null;
  // The forecast as drawn here: a date still ahead. Late, due or missing: the full forecast card says it.
  const upcoming = forecast && stats.nextPeriodDate && stats.nextPeriodInDays !== null && stats.nextPeriodInDays > 0 ? forecast : null;
  const interval = upcoming ? coverageInterval(upcoming.dailyProbabilities, 0.8) : null;
  const empty = stats.avgCycleLength === null && stats.completedCycles.length === 0 && stats.currentCycleDay === null;

  const tipFor = (category: string) => tips.find((tip) => tip.category === category);
  const placed = new Set<string>();
  const place = (category: string, shown: boolean) => {
    const tip = shown ? tipFor(category) : undefined;
    if (tip) placed.add(tip.id);
    return tip;
  };

  // The opening sentences.
  const introNext = !stats.forecastingEnabled
    ? null
    : upcoming && stats.nextPeriodDate && stats.nextPeriodInDays !== null
      ? fill(t.patternsIntroNext, {
          date: <span className="text-primary">{formatIsoUtc(stats.nextPeriodDate, locale, { day: "numeric", month: "long" })}</span>,
          days: days(stats.nextPeriodInDays),
        })
      : stats.nextPeriodInDays !== null && stats.nextPeriodInDays <= 0
        ? t.patternsIntroDue
        : null;
  const lengthPart = stats.avgCycleLength !== null ? <span style={{ color: INK.duration }}>{days(stats.avgCycleLength)}</span> : null;
  const introCycles = !lengthPart
    ? null
    : regularity
      ? fill(
          regularity === "regular" ? t.patternsIntroRegular : regularity === "somewhat" ? t.patternsIntroSomewhat : t.patternsIntroVariable,
          { length: lengthPart },
        )
      : history.length === 1
        ? fill(t.patternsIntroOne, { length: <span style={{ color: INK.duration }}>{days(lengths[0])}</span> })
        : null;

  // The cycle rows: the open cycle first, then the completed ones, newest first.
  const expectedLength = upcoming && pattern.current && stats.nextPeriodDate ? daysBetween(pattern.current.start, stats.nextPeriodDate) : null;
  const expectedSpan =
    interval && pattern.current
      ? { from: daysBetween(pattern.current.start, interval.lower) + 1, to: daysBetween(pattern.current.start, interval.upper) + 1 }
      : null;
  const scale = Math.max(1, ...lengths, stats.currentCycleDay ?? 0, expectedLength ?? 0, expectedSpan?.to ?? 0);
  const pct = (day: number) => `${Math.min(100, Math.max(0, (day / scale) * 100)).toFixed(1)}%`;
  const showsCycles = history.length > 0 || pattern.current !== null;
  const timingLines = pattern.timings.slice(0, 2).map((timing) =>
    (timing.when === "start" ? t.patternsSymptomAtStart : timing.when === "beforePeriod" ? t.patternsSymptomBeforePeriod : t.patternsSymptomAroundDay)
      .replace("{symptom}", label(timing.id))
      .replace("{day}", String(timing.day)),
  );

  // Cycle lengths as bars. The axis starts below the shortest so a few days' difference shows; every bar carries its number.
  const longest = lengths.length ? Math.max(...lengths) : 0;
  const shortest = lengths.length ? Math.min(...lengths) : 0;
  const floor = shortest / 2;
  const barHeight = (value: number) => `${(((value - floor) / Math.max(1, longest - floor)) * 100).toFixed(1)}%`;
  const longestCycle = lengths.filter((value) => value === longest).length === 1 ? history.find((cycle) => cycle.length === longest) : null;
  const showsAverage = stats.avgCycleLength !== null && history.length > 1 && shortest !== longest;
  const recurringCount = stats.recurringSymptoms.filter((item) => item.cycleCount >= 2).length;
  const periodStat = nextPeriodStat(stats.nextPeriodInDays, t);
  const topSex = stats.recurringSex[0];
  const sexAdvice = topSex ? symptomAdvice(topSex.id, topSex.dayCount, t) : null;

  const cyclesTip = place("symptom", showsCycles);
  const durationTip = place("regularity", !empty);
  const notesTip = place("phase", true);
  const otherTips = tips.filter((tip) => !placed.has(tip.id));

  function rowText(cycle: CycleRow): string {
    const names = cycle.marks.map((mark) => label(mark.id)).join(", ");
    const head =
      cycle.length === null
        ? t.patternsRowNow.replace("{day}", String(stats.currentCycleDay ?? 1))
        : t.patternsRowCycle.replace("{month}", formatIsoUtc(cycle.start, locale, { month: "long" })).replace("{days}", days(cycle.length));
    return names ? `${head}: ${names}` : head;
  }

  function cycleRow(cycle: CycleRow) {
    const open = cycle.length === null;
    const length = cycle.length ?? stats.currentCycleDay ?? 1;
    // Two symptoms first logged on (nearly) the same day: the second sits a step higher.
    const marks = [...cycle.marks].sort((a, b) => a.day - b.day);
    let lastLow = -Infinity;
    const placedMarks = marks.map((mark) => {
      const raised = mark.day - lastLow < scale * 0.045;
      if (!raised) lastLow = mark.day;
      return { ...mark, raised };
    });
    return (
      <div key={cycle.start} className="flex items-end gap-2.5">
        <span className={cn("w-10 shrink-0 truncate text-xs", open ? "font-extrabold text-primary" : "font-bold text-muted-foreground")}>
          {open ? t.patternsNow : formatIsoUtc(cycle.start, locale, { month: "short" })}
        </span>
        <div role="img" aria-label={rowText(cycle)} className={cn("relative min-w-0 grow", placedMarks.some((mark) => mark.raised) ? "h-10" : "h-[30px]")}>
          {open && expectedLength ? (
            <span className="absolute bottom-0 left-0 h-3 rounded-full border-2 border-dashed border-border" style={{ width: pct(expectedLength) }} />
          ) : null}
          <span className="animate-grow-x absolute origin-left bottom-0 left-0 h-3 rounded-full bg-muted-foreground/25" style={{ width: pct(length) }} />
          {cycle.bleed > 0 ? (
            <span className="animate-grow-x absolute origin-left bottom-0 left-0 h-3 rounded-full" style={{ width: pct(cycle.bleed), background: INK.cycles }} />
          ) : null}
          {open && expectedSpan ? (
            <span
              className="absolute bottom-0 h-3 rounded-full bg-primary/55"
              style={{ left: pct(expectedSpan.from - 1), width: pct(expectedSpan.to - expectedSpan.from + 1) }}
            />
          ) : null}
          {placedMarks.map((mark) => (
            <span
              key={mark.id}
              className={cn("absolute size-2 -translate-x-1/2 rounded-full", mark.raised ? "bottom-7" : "bottom-[18px]")}
              style={{ left: pct(mark.day - 0.5), background: inkOf(mark.id) }}
            />
          ))}
          {open ? (
            <span
              className="absolute -bottom-px size-3.5 -translate-x-1/2 rounded-full border-[3px] border-card bg-card-foreground"
              style={{ left: pct(length) }}
            />
          ) : null}
        </div>
        <span className={cn("w-[22px] shrink-0 text-right text-xs font-extrabold", open && "text-muted-foreground")}>{length}</span>
      </div>
    );
  }

  const cycles = empty ? (
          <>
            {stats.forecastingEnabled && !noCycle ? <ForecastCard /> : null}
            {pregnant ? null : <p className="text-sm text-muted-foreground">{t.noPatternsYet}</p>}
          </>
        ) : (
          <>
            {!pregnant && (introNext || introCycles) ? (
              <section className="animate-fade-up flex flex-col gap-3.5">
                {stats.currentCycleDay !== null ? (
                  <SectionLabel>{t.patternsIntroToday.replace("{day}", String(stats.currentCycleDay))}</SectionLabel>
                ) : null}
                <p className="font-serif text-[27px] leading-[1.25] text-foreground text-pretty">
                  {introNext}
                  {introNext && introCycles ? " " : null}
                  {introCycles}
                </p>
                {introNext ? <p className="text-sm leading-normal text-muted-foreground">{t.patternsIntroEstimate}</p> : null}
              </section>
            ) : null}

            {stats.forecastingEnabled && !noCycle ? (
              upcoming && stats.nextPeriodDate && stats.nextPeriodInDays !== null ? (
                <>
                  <section className={CARD} style={{ animationDelay: "60ms" }}>
                    <SectionLabel color={INK.forecast}>{t.forecastSection}</SectionLabel>
                    <div className="flex items-end gap-3">
                      <p className="grow font-serif text-[44px] leading-[1.05]">
                        {formatIsoUtc(stats.nextPeriodDate, locale, { day: "numeric", month: "short" })}
                      </p>
                      <span className="mb-1.5 rounded-full border border-primary/60 px-[11px] py-[5px] text-[13px] font-extrabold text-primary">
                        {t.patternsInDays.replace("{days}", days(stats.nextPeriodInDays))}
                      </span>
                    </div>
                    <ForecastBars daily={upcoming.dailyProbabilities} likely={upcoming.mostLikelyDate} interval={interval} locale={locale} label={t.forecastSection} />
                    {interval && interval.lower !== interval.upper ? (
                      <p className="text-sm leading-[1.45] text-pretty">
                        {fill(t.patternsForecastLikely, {
                          start: (
                            <strong>
                              {formatIsoUtc(
                                interval.lower,
                                locale,
                                // The month once when both days share it; English puts the month first, so it keeps both.
                                locale !== "en" && interval.lower.slice(0, 7) === interval.upper.slice(0, 7)
                                  ? { day: "numeric" }
                                  : { day: "numeric", month: "long" },
                              )}
                            </strong>
                          ),
                          end: <strong>{formatIsoUtc(interval.upper, locale, { day: "numeric", month: "long" })}</strong>,
                        })}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      aria-expanded={showDetail}
                      onClick={() => setShowDetail((current) => !current)}
                      className="-my-1.5 min-h-11 self-start text-[13px] font-extrabold text-primary underline-offset-2 hover:underline"
                    >
                      {showDetail ? t.patternsLessDetail : t.patternsMoreDetail}
                    </button>
                  </section>
                  {showDetail ? (
                    <div className="animate-fade-up flex flex-col gap-4">
                      <ForecastDetails />
                    </div>
                  ) : null}
                </>
              ) : (
                <section className="animate-fade-up flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
                  <SectionLabel color={INK.forecast}>{t.forecastSection}</SectionLabel>
                  <ForecastCard />
                </section>
              )
            ) : null}

            {showsCycles ? (
              <section
                className={cn(CARD, "gap-3.5")}
                style={{
                  animationDelay: "120ms",
                  backgroundImage: `linear-gradient(170deg, color-mix(in oklch, ${INK.cycles} 16%, var(--card)) 0%, var(--card) 46%)`,
                }}
              >
                <SectionLabel color={INK.cycles}>{t.patternsCyclesLabel}</SectionLabel>
                <Headline>{timingLines.length ? timingLines.join(" ") : t.patternsCyclesTitle}</Headline>
                <p className="text-[13px] leading-[1.4] text-muted-foreground">{t.patternsCyclesHint}</p>
                <div className="flex flex-col gap-2.5">
                  {pattern.current ? cycleRow(pattern.current) : null}
                  {[...history].reverse().map((cycle) => cycleRow(cycle))}
                  <div aria-hidden className="flex gap-2.5">
                    <span className="w-10 shrink-0" />
                    <div className="relative h-4 min-w-0 grow text-[11px] font-bold text-muted-foreground">
                      {[1, 7, 14, 21, 28, 35, 42].filter((day) => day <= scale).map((day) => (
                        <span key={day} className="absolute whitespace-nowrap" style={{ left: pct(day - 1) }}>
                          {day === 1 ? t.patternsAxisDay.replace("{day}", "1") : day}
                        </span>
                      ))}
                    </div>
                    <span className="w-[22px] shrink-0" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-border pt-3 text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-[18px] rounded-full" style={{ background: INK.cycles }} />
                    {t.patternsLegendPeriod}
                  </span>
                  {pattern.symptoms.map((id) => (
                    <span key={id} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: inkOf(id) }} />
                      {label(id)}
                    </span>
                  ))}
                  {expectedSpan ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-[18px] rounded-full bg-primary/55" />
                      {t.patternsLegendExpected}
                    </span>
                  ) : null}
                </div>
                <Advice tip={cyclesTip} t={t} />
              </section>
            ) : null}

            <section className={cn(CARD, "gap-0 p-0")} style={{ animationDelay: "180ms" }}>
              <div className="flex flex-col gap-3 px-[18px] pt-[18px] pb-3.5">
                <SectionLabel color={INK.duration}>{t.patternsDurationLabel}</SectionLabel>
                {history.length > 0 ? (
                  <>
                    <Headline>
                      {shortest === longest
                        ? days(longest)
                        : t.patternsDurationRange.replace("{min}", String(shortest)).replace("{max}", String(longest))}
                      {longestCycle && shortest !== longest
                        ? ` ${t.patternsDurationLongest.replace("{month}", formatIsoUtc(longestCycle.start, locale, { month: "long" }))}`
                        : null}
                    </Headline>
                    <div
                      role="img"
                      aria-label={`${t.cycleLengthOverTime}: ${lengths.join(", ")}`}
                      className={cn("relative flex h-[132px] items-stretch gap-2.5", showsAverage && "pr-[58px]")}
                    >
                      {showsAverage && stats.avgCycleLength !== null ? (
                        // The average: a dashed line across the bars, named in the gutter to their right.
                        <div className="pointer-events-none absolute inset-x-0 top-[22px] bottom-0">
                          <span className="absolute inset-x-0 border-t-2 border-dashed border-border" style={{ bottom: barHeight(stats.avgCycleLength) }} />
                          <span
                            className="absolute right-0 translate-y-1/2 bg-card pl-1.5 text-[11px] leading-4 font-extrabold whitespace-nowrap text-muted-foreground"
                            style={{ bottom: barHeight(stats.avgCycleLength) }}
                          >
                            {t.patternsAverageMark.replace("{n}", String(stats.avgCycleLength))}
                          </span>
                        </div>
                      ) : null}
                      {history.map((cycle, index) => {
                        const top = cycle === longestCycle;
                        return (
                          <div key={cycle.start} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                            <span className="h-4 text-xs leading-4 font-extrabold" style={top ? { color: INK.duration } : undefined}>
                              {cycle.length}
                            </span>
                            <div className="flex w-full grow items-end">
                              <div
                                className="animate-grow-bar w-full rounded-t-[10px] rounded-b-[4px]"
                                style={{
                                  height: barHeight(cycle.length ?? 0),
                                  animationDelay: `${200 + index * 80}ms`,
                                  background: top ? INK.duration : `color-mix(in oklch, ${INK.duration} 55%, var(--card))`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div aria-hidden className={cn("flex gap-2.5 text-center text-[11px] font-bold text-muted-foreground", showsAverage && "pr-[58px]")}>
                      {history.map((cycle) => (
                        <span key={cycle.start} className="min-w-0 flex-1 truncate">
                          {formatIsoUtc(cycle.start, locale, { month: "short" })}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="grid grid-cols-2 border-t border-border">
                <Stat value={stats.avgCycleLength ?? "—"} unit={daysUnit(t, locale, stats.avgCycleLength)} label={t.avgCycleLength} className="border-r border-b" />
                <Stat value={stats.avgPeriodLength ?? "—"} unit={daysUnit(t, locale, stats.avgPeriodLength)} label={t.avgPeriodLength} className="border-b" />
                <Stat value={stats.currentCycleDay ?? "—"} unit="" label={t.currentCycleDayLabel} className="border-r" />
                {variation !== null ? (
                  <Stat value={`±${variation}`} unit={daysUnit(t, locale, variation)} label={t.patternsVariation} />
                ) : stats.forecastingEnabled ? (
                  <Stat value={periodStat.value} unit={daysUnit(t, locale, periodStat.value)} label={periodStat.label} />
                ) : stats.periodLengthRange ? (
                  <Stat value={`${stats.periodLengthRange.min}–${stats.periodLengthRange.max}`} unit={t.days} label={t.periodLengthRange} />
                ) : (
                  <span />
                )}
              </div>
              {durationTip ? (
                <div className="px-[18px] pb-[18px]">
                  <Advice tip={durationTip} t={t} />
                </div>
              ) : null}
            </section>

            {stats.recurringSymptoms.length > 0 ? (
              <section className={cn(CARD, "gap-3.5")} style={{ animationDelay: "240ms" }}>
                <SectionLabel color={INK.symptoms}>{t.recurringSymptoms}</SectionLabel>
                <Headline>
                  {recurringCount === 0
                    ? t.recurringSymptomsHint
                    : recurringCount === 1
                      ? t.patternsSymptomsOne
                      : t.patternsSymptomsMany.replace("{n}", String(recurringCount))}
                </Headline>
                {stats.recurringSymptoms.map((item) => (
                  <PresenceRow key={item.id} item={item} name={label(item.id)} presence={pattern.presence[item.id]} ink={inkOf(item.id)} t={t} />
                ))}
              </section>
            ) : null}

            {stats.recurringSex.length > 0 ? (
              <section className={cn(CARD, "gap-3.5")} style={{ animationDelay: "270ms" }}>
                <SectionLabel color={INK.sex}>{symptomCategoryLabel("sexAndSexDrive", t)}</SectionLabel>
                <Headline>{t.recurringSymptomsHint}</Headline>
                {stats.recurringSex.map((item) => (
                  <PresenceRow key={item.id} item={item} name={label(item.id)} presence={pattern.presence[item.id]} ink={INK.sex} t={t} />
                ))}
                {topSex && sexAdvice ? (
                  <div className="flex flex-col gap-1 border-t border-border pt-3">
                    <p className="text-sm leading-[1.45] font-bold text-pretty">{label(topSex.id)}</p>
                    <p className="text-sm leading-[1.45] text-muted-foreground text-pretty">{sexAdvice}</p>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className={CARD} style={{ animationDelay: "300ms" }}>
              <SectionLabel color={INK.notes}>{t.patternsNotesLabel}</SectionLabel>
              {similarNotes.length === 0 ? (
                <p className="text-sm leading-normal text-muted-foreground">{allNotes.length === 0 ? t.notesEmpty : t.notesSimilarEmpty}</p>
              ) : (
                <>
                  <Headline>
                    {stats.currentCycleDay !== null ? t.patternsNotesTitle.replace("{day}", String(stats.currentCycleDay)) : t.notesSimilarTitle}
                  </Headline>
                  {similarNotes.map((entry) => {
                    const meta = [
                      formatIsoUtc(
                        entry.iso,
                        locale,
                        entry.iso.slice(0, 4) === today.slice(0, 4) ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" },
                      ),
                      entry.cycleDay !== null ? midLine(t.notesCycleDay.replace("{day}", String(entry.cycleDay)), locale) : null,
                      entry.phase ? midLine(phaseLabel(entry.phase, t), locale) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <button
                        key={entry.iso}
                        type="button"
                        onClick={() => {
                          setClosing(false);
                          setActiveEntry(entry);
                        }}
                        className="flex flex-col gap-1 rounded-2xl rounded-bl-[4px] border border-border bg-background px-3.5 py-3 text-left text-foreground transition-transform active:scale-[0.99]"
                      >
                        <span className="line-clamp-4 text-[15px] leading-[1.4] font-semibold text-pretty whitespace-pre-wrap">{entry.note}</span>
                        <span className="text-xs font-bold text-muted-foreground">{meta}</span>
                      </button>
                    );
                  })}
                </>
              )}
              <Advice tip={notesTip} t={t} />
              <Link href="/diary" className="-my-1.5 inline-flex min-h-11 items-center gap-1 self-start text-[13px] font-extrabold text-primary">
                {t.notesViewAll}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </section>

            {otherTips.length > 0 ? (
              <section className={CARD} style={{ animationDelay: "340ms" }}>
                <SectionLabel color={INK.duration}>{t.personalizedTips}</SectionLabel>
                {otherTips.map((tip, index) => (
                  <div key={tip.id} className={cn("flex flex-col gap-1", index > 0 && "border-t border-border pt-3")}>
                    <Headline>{tip.title}</Headline>
                    <p className="text-sm leading-[1.45] text-muted-foreground text-pretty">{tip.body}</p>
                  </div>
                ))}
              </section>
            ) : null}
          </>
        );

  return (
    <>
      <div className="flex flex-col gap-[22px] pb-4">
        <h1 className="font-serif text-[30px] leading-none font-medium tracking-[-0.01em] text-foreground desktop:text-2xl">{t.patterns}</h1>

        {pregnant ? (
          <Suspense fallback={null}>
            <PregnancyPatterns
              record={pregnant}
              diary={diary}
              today={today}
              locale={locale}
              t={t}
              earlier={empty ? null : { count: history.length, average: stats.avgCycleLength }}
            >
              {cycles}
            </PregnancyPatterns>
          </Suspense>
        ) : (
          cycles
        )}

        <p className="px-2 text-center text-xs leading-[1.45] text-muted-foreground text-pretty">
          {pregnant ? t.pregnancyNotice : t.tipsDisclaimer}
        </p>
      </div>

      {activeEntry ? (
        <NoteViewer
          entry={activeEntry}
          log={diary.days[activeEntry.iso]}
          locale={locale}
          t={t}
          customSymptoms={diary.customSymptoms}
          closing={closing}
          onClose={closeViewer}
          onExited={handleViewerExited}
        />
      ) : null}
    </>
  );
}

/**
 * The chance of the period starting on each day around the most likely one,
 * as bars: the most likely day strongest, the 80% interval in between, the
 * rest faint. Under it, the first, the most likely and the last day drawn.
 */
function ForecastBars({
  daily,
  likely,
  interval,
  locale,
  label,
}: {
  daily: { date: string; probability: number }[];
  likely: string;
  interval: { lower: string; upper: string } | null;
  locale: Locale;
  label: string;
}) {
  const at = daily.findIndex((item) => item.date === likely);
  const from = at < 0 ? 0 : Math.max(0, at - 6);
  const shown = daily.slice(from, at < 0 ? 13 : at + 7);
  if (shown.length < 3) return null;
  const peak = Math.max(...shown.map((item) => item.probability), Number.EPSILON);
  const day = (iso: string) => formatIsoUtc(iso, locale, { day: "numeric", month: "short" });
  return (
    <>
      <div role="img" aria-label={`${label}: ${day(shown[0].date)} – ${day(shown[shown.length - 1].date)}`} className="flex h-24 items-end gap-[5px]">
        {shown.map((item, index) => (
          <span
            key={item.date}
            className={cn(
              "animate-grow-bar min-w-0 flex-1 rounded-t-md rounded-b-[2px]",
              item.date === likely
                ? "bg-primary"
                : interval && item.date >= interval.lower && item.date <= interval.upper
                  ? "bg-primary/50"
                  : "bg-muted-foreground/25",
            )}
            style={{ height: `${Math.max(5, (item.probability / peak) * 100).toFixed(1)}%`, animationDelay: `${150 + index * 30}ms` }}
          />
        ))}
      </div>
      <div aria-hidden className="flex justify-between text-xs font-bold text-muted-foreground">
        <span>{day(shown[0].date)}</span>
        {at >= 0 ? <span className="text-card-foreground">{day(likely)}</span> : null}
        <span>{day(shown[shown.length - 1].date)}</span>
      </div>
    </>
  );
}

/** One recurring entry: its name, a dot per cycle (filled when it was logged in it), and in how many cycles. */
function PresenceRow({
  item,
  name,
  presence,
  ink,
  t,
}: {
  item: RecurringSymptom;
  name: string;
  presence: boolean[] | undefined;
  ink: string;
  t: Messages;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 grow truncate text-[15px] font-bold">{name}</span>
      <span
        role="img"
        aria-label={t.symptomCycleCount.replace("{cycles}", String(item.cycleCount)).replace("{total}", String(item.cycleTotal))}
        className="flex shrink-0 gap-[5px]"
      >
        {(presence ?? []).map((present, index) => (
          <span
            key={index}
            className={cn("size-3 rounded-full", !present && "border-2 border-border")}
            style={present ? { background: ink } : undefined}
          />
        ))}
      </span>
      <span aria-hidden className="w-11 shrink-0 text-right text-xs font-extrabold whitespace-nowrap text-muted-foreground">
        {t.patternsCycleShare.replace("{cycles}", String(item.cycleCount)).replace("{total}", String(item.cycleTotal))}
      </span>
    </div>
  );
}

function Stat({ value, unit, label, className }: { value: number | string; unit: string; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5 border-border px-[18px] py-3.5", className)}>
      <p className="font-serif text-3xl leading-[1.1]">
        {value}
        {unit ? <span className="ml-1.5 font-sans text-[13px] font-bold text-muted-foreground">{unit}</span> : null}
      </p>
      <p className="text-xs leading-snug font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
