// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { dayRange, trimesterLabel, weekTitle, weeksLeftLine } from "@/components/pregnancy/pregnancy-card";
import { Badge } from "@/components/ui/badge";
import type { Diary } from "@/lib/diary";
import { PREGNANCY_WEEKS_AVAILABLE } from "@/lib/features";
import { formatIsoUtc } from "@/lib/format-date";
import { contentLocale, type Locale, type Messages } from "@/lib/i18n";
import {
  GUIDE_SOURCES,
  PREGNANCY_GUIDE,
  fetalSize,
  sizeSeries,
  weekGuide,
  type FetalSize,
  type PregnancyGuideCopy,
} from "@/lib/pregnancy/guide";
import {
  babyMovementLog,
  comingUp,
  milestoneDates,
  pregnancySymptomWeeks,
  weekDates,
  type MilestoneDate,
} from "@/lib/pregnancy/patterns";
import type { PregnancyRecord } from "@/lib/pregnancy/record";
import { pregnancyCardData } from "@/lib/pregnancy/view";
import { findSymptomMeta, symptomLabel } from "@/lib/symptoms/catalog";
import { cn } from "@/lib/utils";

const INK = {
  pregnancy: "var(--pregnancy-ink)",
  baby: "var(--phase-follicular-ink)",
  body: "var(--phase-luteal-ink)",
  next: "var(--phase-ovulation-ink)",
  call: "var(--phase-menstrual-ink)",
} as const;

const CARD = "animate-fade-up flex flex-col gap-3 rounded-3xl border border-border bg-card p-[18px] text-card-foreground";
/** The last week with its own text; later ones read the last. */
const LAST_WEEK = 41;
/** Milestones the "coming up" card shows before "the whole pregnancy". */
const NEXT_SHOWN = 3;

function Label({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <p className={cn("text-xs font-extrabold tracking-[0.07em] uppercase", !color && "text-muted-foreground")} style={color ? { color } : undefined}>
      {children}
    </p>
  );
}

function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

/** "8.5 cm", "45 g" or "1.2 kg", in the reader's number format. */
function sizeText(size: FetalSize, locale: Locale): string {
  const number = (value: number, digits: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  if (size.kind === "length") return size.mm < 10 ? `${number(size.mm, 0)} mm` : `${number(size.mm / 10, 1)} cm`;
  return size.grams < 1000 ? `${number(size.grams, 0)} g` : `${number(size.grams / 1000, 1)} kg`;
}

/**
 * Patterns while a pregnancy goes on. Top to bottom: where she is (week,
 * trimester, the forty weeks as three bars), then, week by week (she can look
 * at any week), the baby's typical size and development and what her own body
 * commonly does; what she logged in the diary, week by week; what usually
 * comes next, with dates counted from her due date; and when to call. The
 * cycles from before the pregnancy (`children`, Patterns' usual cards) stay
 * on the screen, folded away behind one row.
 *
 * The week texts are general information in Spanish and English only
 * (lib/pregnancy/guide.ts, with their sources) and show only with
 * PREGNANCY_WEEKS_AVAILABLE. Nothing here celebrates, and past 42 weeks with no
 * end logged it stops counting, like the card.
 */
export function PregnancyPatterns({
  record,
  diary,
  today,
  locale,
  t,
  earlier,
  children,
}: {
  record: PregnancyRecord;
  diary: Diary;
  today: string;
  locale: Locale;
  t: Messages;
  /** The cycles from before the pregnancy that `children` draws; null when there are none. */
  earlier: { count: number; average: number | null } | null;
  children?: ReactNode;
}) {
  const data = useMemo(() => pregnancyCardData(record, today), [record, today]);
  const lang = contentLocale(locale);
  const guide = PREGNANCY_GUIDE[lang];
  const currentWeek = data.age.weeks;
  const [picked, setPicked] = useState<number | null>(null);
  const [wholeTimeline, setWholeTimeline] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showEarlier, setShowEarlier] = useState(false);
  const earlierId = useId();
  const timelineId = useId();
  const sourcesId = useId();
  const week = Math.min(LAST_WEEK, Math.max(0, picked ?? currentWeek));
  const logged = useMemo(() => pregnancySymptomWeeks(diary, record.dueDate, today), [diary, record.dueDate, today]);
  const movements = useMemo(() => babyMovementLog(diary, record.dueDate, today), [diary, record.dueDate, today]);
  const milestones = useMemo(() => milestoneDates(record.dueDate, today), [record.dueDate, today]);
  const next = useMemo(() => comingUp(record.dueDate, today, NEXT_SHOWN), [record.dueDate, today]);
  const shortDate = (iso: string) => formatIsoUtc(iso, locale, { day: "numeric", month: "short" });

  // Her cycles from before: one row, and under it (when open) the cards Patterns always shows.
  const before = earlier ? (
    <>
      <button
        type="button"
        aria-expanded={showEarlier}
        aria-controls={earlierId}
        onClick={() => setShowEarlier((current) => !current)}
        className="animate-fade-up flex items-center gap-3 rounded-3xl border border-border bg-card px-[18px] py-4 text-left text-card-foreground"
        style={{ animationDelay: "300ms" }}
      >
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="text-[15px] font-bold">{guide.earlierLabel}</span>
          <span className="text-[13px] text-muted-foreground">
            {[
              earlier.count > 0 ? fillText(earlier.count === 1 ? guide.earlierOne : guide.earlierCount, { count: earlier.count }) : null,
              earlier.average !== null ? fillText(guide.earlierAverage, { days: earlier.average }) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <ChevronDown className={cn("size-[18px] shrink-0 transition-transform", showEarlier && "rotate-180")} aria-hidden />
      </button>
      {showEarlier ? (
        <div id={earlierId} className="flex flex-col gap-[22px]">
          {children}
        </div>
      ) : null}
    </>
  ) : null;

  if (data.askStillGoing) {
    return (
      <>
        <section className="animate-fade-up flex flex-col gap-3.5">
          <p className="font-serif text-[27px] leading-[1.25] text-foreground text-pretty">{t.pregnancyStillGoingTitle}</p>
          <p className="text-sm leading-normal text-muted-foreground">{t.pregnancyStillGoingBody}</p>
        </section>
        {before}
      </>
    );
  }

  // The forty weeks as three bars, one per trimester, filled up to today.
  const shares = [14, 14, 12];
  let weeksBefore = 0;
  const bars = shares.map((share) => {
    const filled = Math.max(0, Math.min(1, (data.progress * 40 - weeksBefore) / share));
    weeksBefore += share;
    return { share, filled };
  });

  const info = weekGuide(lang, week);
  const size = fetalSize(week);
  const series = sizeSeries(week);
  const peak = Math.max(1, ...series.map((item) => (item.size.kind === "length" ? item.size.mm : item.size.grams)));
  const dates = weekDates(record.dueDate, week);
  const chips = [-2, -1, 0, 1, 2].map((step) => week + step).filter((value) => value >= 0 && value <= LAST_WEEK);
  const weekName = (value: number) => t.pregnancyWeekExact.replace("{weeks}", String(value));

  function when(item: MilestoneDate): string {
    if (item.now) return guide.now;
    if (item.past) return guide.done;
    if (item.inDays === 1) return guide.tomorrow;
    return fillText(guide.inDays, { days: item.inDays });
  }

  function milestoneRow(item: MilestoneDate, index: number, list: MilestoneDate[]) {
    const copy = guide.milestones[item.id];
    return (
      <div key={item.id} className={cn("flex items-start gap-3", index > 0 && "border-t border-border pt-3", item.past && "opacity-60")}>
        <span className="w-[62px] shrink-0 rounded-xl bg-muted px-1 py-1.5 text-center text-xs leading-tight font-extrabold">
          {shortDate(item.start)}
          {item.end ? <span className="block font-bold text-muted-foreground">{shortDate(item.end)}</span> : null}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] leading-snug font-bold">{copy.title}</p>
          <p className="text-[13px] leading-[1.4] text-muted-foreground text-pretty">{copy.detail}</p>
          {item.past && index < list.length ? null : (
            <p className="text-xs font-extrabold" style={{ color: item.now ? INK.next : undefined }}>
              {when(item)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="animate-fade-up flex flex-col gap-3.5">
        <Label>
          {t.today} · {trimesterLabel(data.trimester, t)}
        </Label>
        <p className="font-serif text-[27px] leading-[1.25] text-foreground text-pretty">
          <span style={{ color: INK.pregnancy }}>{weekTitle(data, t)}</span>
        </p>
        <div role="img" aria-label={`${weekTitle(data, t)} · ${trimesterLabel(data.trimester, t)}`} className="flex items-center gap-1">
          {bars.map((bar, index) => (
            <span key={index} className="relative h-2 overflow-hidden rounded-full bg-muted" style={{ flex: `${bar.share} 1 0` }}>
              <span className="animate-grow-x absolute inset-y-0 left-0 origin-left rounded-full" style={{ width: `${(bar.filled * 100).toFixed(1)}%`, background: INK.pregnancy }} />
            </span>
          ))}
        </div>
        <p className="text-sm leading-normal text-muted-foreground">{weeksLeftLine(data, locale, t)}</p>
      </section>

      {PREGNANCY_WEEKS_AVAILABLE ? (
        <>
          {lang !== locale ? <Badge className="self-start">{lang === "es" ? t.learnSpanishOnly : t.learnEnglishOnly}</Badge> : null}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={guide.earlierWeek}
              disabled={week <= 0}
              onClick={() => setPicked(week - 1)}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition-transform active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft className="size-[18px]" aria-hidden />
            </button>
            <div className="flex min-w-0 grow items-center gap-1.5">
              {chips.map((value) => {
                const selected = value === week;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={weekName(value)}
                    onClick={() => setPicked(value === currentWeek ? null : value)}
                    className={cn(
                      "h-11 min-w-0 rounded-full text-sm transition-colors",
                      selected
                        ? "grow-[2.4] basis-0 bg-primary px-2 font-extrabold text-primary-foreground"
                        : "grow basis-0 border font-bold text-muted-foreground",
                      !selected && (value > currentWeek ? "border-dashed border-border" : "border-border"),
                      !selected && value === currentWeek && "text-card-foreground",
                    )}
                  >
                    <span className="block truncate">{selected ? weekName(value) : value}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label={guide.laterWeek}
              disabled={week >= LAST_WEEK}
              onClick={() => setPicked(week + 1)}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition-transform active:scale-90 disabled:opacity-40"
            >
              <ChevronRight className="size-[18px]" aria-hidden />
            </button>
          </div>
          <p className="-mt-3 flex min-h-6 items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
            <span>{dayRange(dates.start, dates.end, locale)}</span>
            {week !== currentWeek ? (
              <button type="button" onClick={() => setPicked(null)} className="min-h-11 font-extrabold text-primary underline-offset-2 hover:underline">
                {guide.backToNow}
              </button>
            ) : null}
          </p>

          <section key={`baby-${week}`} className={cn(CARD, "gap-3.5")}>
            <Label color={INK.baby}>{fillText(guide.babyLabel, { week })}</Label>
            <h2 className="font-serif text-xl leading-[1.3] text-pretty">
              {size ? fillText(size.kind === "length" ? guide.sizeLength : guide.sizeWeight, { size: sizeText(size, locale) }) : info.babyTitle}
            </h2>
            {size && series.length > 2 ? (
              <>
                <div role="img" aria-label={fillText(guide.sizeChart, { from: series[0].week, to: series[series.length - 1].week })} className="flex h-[104px] items-end gap-2">
                  {series.map((item, index) => {
                    const value = item.size.kind === "length" ? item.size.mm : item.size.grams;
                    const chosen = item.week === week;
                    return (
                      <div key={item.week} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                        {chosen ? (
                          <span className="text-xs leading-4 font-extrabold whitespace-nowrap" style={{ color: INK.baby }}>
                            {sizeText(item.size, locale)}
                          </span>
                        ) : null}
                        <span
                          className={cn("animate-grow-bar w-full rounded-t-lg rounded-b-[3px]", item.week > currentWeek && !chosen && "border-2 border-dashed border-border")}
                          style={{
                            height: `${Math.max(6, (value / peak) * 80).toFixed(1)}%`,
                            animationDelay: `${index * 40}ms`,
                            background: chosen
                              ? INK.baby
                              : item.week > currentWeek
                                ? undefined
                                : `color-mix(in oklch, ${INK.baby} 45%, var(--card))`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div aria-hidden className="flex gap-2 text-center text-[11px] font-bold text-muted-foreground">
                  {series.map((item) => (
                    <span key={item.week} className={cn("min-w-0 flex-1", item.week === week && "text-card-foreground")}>
                      {item.week}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
            <ul className="flex flex-col gap-2.5 border-t border-border pt-3">
              {info.baby.map((fact) => (
                <li key={fact} className="flex gap-2.5 text-sm leading-[1.45]">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: INK.baby }} />
                  <span className="text-pretty">{fact}</span>
                </li>
              ))}
            </ul>
            {size ? <p className="text-xs leading-[1.45] text-muted-foreground text-pretty">{size.kind === "length" ? guide.lengthNote : guide.weightNote}</p> : null}
          </section>

          <section key={`body-${week}`} className={CARD} style={{ animationDelay: "60ms" }}>
            <Label color={INK.body}>{guide.bodyLabel}</Label>
            {info.body.map((line) => (
              <p key={line} className="text-sm leading-[1.5] text-pretty">
                {line}
              </p>
            ))}
          </section>
        </>
      ) : null}

      {logged.rows.length > 0 ? (
        <section className={cn(CARD, "gap-3.5")} style={{ animationDelay: "120ms" }}>
          <Label color={INK.pregnancy}>{guide.logLabel}</Label>
          <h2 className="font-serif text-xl leading-[1.3] text-pretty">{guide.logTitle}</h2>
          <div
            role="img"
            aria-label={logged.rows
              .map((row) => `${symptomName(row.id, diary, t)}: ${fillText(guide.logDays, { days: row.total })}`)
              .join(". ")}
            className="grid items-center gap-[3px]"
            style={{ gridTemplateColumns: `minmax(0, 7rem) repeat(${logged.weeks.length}, minmax(0, 1fr))` }}
          >
            {logged.rows.map((row) => (
              <FragmentRow key={row.id} name={symptomName(row.id, diary, t)} days={row.days} />
            ))}
            <span className="text-[11px] font-bold text-muted-foreground">{guide.weekAxis}</span>
            {logged.weeks.map((value, index) => (
              <span
                key={value}
                className={cn("text-center text-[11px] font-bold", value === currentWeek ? "font-extrabold text-card-foreground" : "text-muted-foreground")}
              >
                {index % 2 === (logged.weeks.length - 1) % 2 ? value : ""}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-border pt-3 text-xs font-bold text-muted-foreground">
            {guide.logLegend.map((text, level) => (
              <span key={text} className="flex items-center gap-1.5">
                <span className="size-3.5 rounded-[4px]" style={{ background: HEAT[level + 1] }} />
                {text}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {movements.first ? (
        // Not ranked with the symptoms: only the days she marked, never a count of movements.
        <section className={cn(CARD, "gap-3")} style={{ animationDelay: "150ms" }}>
          <Label color={INK.pregnancy}>{t.symptomBabyMovement}</Label>
          <p className="text-sm leading-[1.5] text-pretty">
            {fillText(guide.movementFirst, { date: shortDate(movements.first.date), week: movements.first.week })}
          </p>
          <div
            role="img"
            aria-label={movements.weeks
              .map((value, index) => fillText(guide.movementWeek, { week: value, days: movements.days[index] }))
              .join(". ")}
            className="grid items-center gap-[3px]"
            style={{ gridTemplateColumns: `minmax(0, 7rem) repeat(${movements.weeks.length}, minmax(0, 1fr))` }}
          >
            <FragmentRow name={fillText(guide.logDays, { days: movements.total })} days={movements.days} />
            <span className="text-[11px] font-bold text-muted-foreground">{guide.weekAxis}</span>
            {movements.weeks.map((value, index) => (
              <span
                key={value}
                className={cn("text-center text-[11px] font-bold", value === currentWeek ? "font-extrabold text-card-foreground" : "text-muted-foreground")}
              >
                {index % 2 === (movements.weeks.length - 1) % 2 ? value : ""}
              </span>
            ))}
          </div>
          <p className="text-xs leading-[1.45] text-muted-foreground text-pretty">{guide.movementNote}</p>
        </section>
      ) : null}

      <section className={CARD} style={{ animationDelay: "180ms" }}>
        <Label color={INK.next}>{guide.nextLabel}</Label>
        <div id={timelineId} className="flex flex-col gap-3">
          {(wholeTimeline ? milestones : next).map(milestoneRow)}
        </div>
        <p className="text-xs leading-[1.45] text-muted-foreground text-pretty">{guide.nextNote}</p>
        <button
          type="button"
          aria-expanded={wholeTimeline}
          aria-controls={timelineId}
          onClick={() => setWholeTimeline((current) => !current)}
          className="-my-1.5 min-h-11 self-start text-[13px] font-extrabold text-primary underline-offset-2 hover:underline"
        >
          {wholeTimeline ? guide.nextLess : guide.nextAll}
        </button>
      </section>

      <section className={CARD} style={{ animationDelay: "240ms" }}>
        <Label color={INK.call}>{guide.callLabel}</Label>
        <p className="text-sm leading-[1.5] text-pretty">{guide.callBody}</p>
        <p className="text-[13px] leading-[1.45] text-muted-foreground text-pretty">{guide.callEmergency}</p>
      </section>

      {before}

      <div className="flex flex-col gap-2 px-2">
        <button
          type="button"
          aria-expanded={showSources}
          aria-controls={sourcesId}
          onClick={() => setShowSources((current) => !current)}
          className="inline-flex min-h-11 items-center gap-1 self-center text-xs font-extrabold text-muted-foreground underline-offset-2 hover:underline"
        >
          {guide.sourcesLabel}
          <ChevronDown className={cn("size-3.5 transition-transform", showSources && "rotate-180")} aria-hidden />
        </button>
        {showSources ? (
          <ul id={sourcesId} className="flex flex-col gap-1.5 text-xs leading-[1.45] text-muted-foreground">
            {GUIDE_SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

/** Cell colours of the weekly log: none, 1–2 days, 3–4 days, 5–7 days. */
const HEAT = [
  "transparent",
  "color-mix(in oklch, var(--pregnancy-ink) 30%, var(--card))",
  "color-mix(in oklch, var(--pregnancy-ink) 60%, var(--card))",
  "var(--pregnancy-ink)",
] as const;

function heatLevel(days: number): 0 | 1 | 2 | 3 {
  if (days <= 0) return 0;
  if (days <= 2) return 1;
  if (days <= 4) return 2;
  return 3;
}

function symptomName(id: Parameters<typeof findSymptomMeta>[0], diary: Diary, t: Messages): string {
  const meta = findSymptomMeta(id, diary.customSymptoms);
  return meta ? symptomLabel(meta, t) : id;
}

/** One symptom of the weekly log: its name, then a cell per week. */
function FragmentRow({ name, days }: { name: string; days: number[] }) {
  return (
    <>
      <span className="truncate pr-1 text-[13px] font-bold">{name}</span>
      {days.map((count, index) => {
        const level = heatLevel(count);
        return (
          <span
            key={index}
            className={cn("h-5 rounded-[5px]", level === 0 && "border-[1.5px] border-border")}
            style={level === 0 ? undefined : { background: HEAT[level] }}
          />
        );
      })}
    </>
  );
}

export type { PregnancyGuideCopy };
