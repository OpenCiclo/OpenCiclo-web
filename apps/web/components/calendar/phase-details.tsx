// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { coverageInterval } from "@/lib/forecast/coverage";
import { NEXT_PHASE, PHASE_INK, PhaseGlyph, phaseTint } from "@/components/calendar/phase-visuals";
import { initialProbabilityLabel } from "@/lib/cycle/period-timing";
import { phaseLabel, phaseSeason, type CycleOverview, type CyclePhase, type CycleSeason } from "@/lib/cycle/phases";
import { dayPosition, ovulationPosition, phaseProgress, type CycleTimeline } from "@/lib/cycle/phase-timeline";
import { formatIsoUtc } from "@/lib/format-date";
import type { Locale, Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PhaseCopyKeys = {
  summary: keyof Messages;
  inside: keyof Messages;
  feel: [keyof Messages, keyof Messages, keyof Messages];
  tip: keyof Messages;
};

const COPY: Record<CyclePhase, PhaseCopyKeys> = {
  menstrual: {
    summary: "phaseMenstrualSummary",
    inside: "phaseMenstrualInside",
    feel: ["phaseMenstrualFeel1", "phaseMenstrualFeel2", "phaseMenstrualFeel3"],
    tip: "phaseMenstrualTip",
  },
  follicular: {
    summary: "phaseFollicularSummary",
    inside: "phaseFollicularInside",
    feel: ["phaseFollicularFeel1", "phaseFollicularFeel2", "phaseFollicularFeel3"],
    tip: "phaseFollicularTip",
  },
  ovulation: {
    summary: "phaseOvulationSummary",
    inside: "phaseOvulationInside",
    feel: ["phaseOvulationFeel1", "phaseOvulationFeel2", "phaseOvulationFeel3"],
    tip: "phaseOvulationTip",
  },
  luteal: {
    summary: "phaseLutealSummary",
    inside: "phaseLutealInside",
    feel: ["phaseLutealFeel1", "phaseLutealFeel2", "phaseLutealFeel3"],
    tip: "phaseLutealTip",
  },
};

const SEASON_LABELS: Record<CycleSeason, keyof Messages> = {
  winter: "seasonWinter",
  spring: "seasonSpring",
  summer: "seasonSummer",
  fall: "seasonFall",
};

/** Staggered entrance inside the expanded card (see `.phase-reveal` in globals.css). */
function reveal(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

function dayRange(start: string, end: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}

/** The cycle as one bar per phase, today marked, and its two hormonal halves. */
function CycleBars({
  timeline,
  day,
  t,
  revealIndex,
  className = "mt-4",
}: {
  timeline: CycleTimeline;
  day: number;
  t: Messages;
  revealIndex: number;
  className?: string;
}) {
  const progress = phaseProgress(timeline, day);
  const today = dayPosition(timeline, day) * 100;
  const split = ovulationPosition(timeline);
  return (
    <section className={cn("phase-reveal", className)} style={reveal(revealIndex)}>
      <h3 className="text-[11px] font-extrabold tracking-[0.1em] text-muted-foreground uppercase desktop:text-xs">
        {t.cycleTimelineTitle.replace("{days}", String(timeline.length))}
      </h3>
      <div className="relative mt-7 desktop:mt-8">
        <div
          className="absolute bottom-full flex -translate-x-1/2 flex-col items-center"
          style={{ left: `clamp(20px, ${today}%, calc(100% - 20px))` }}
          aria-hidden
        >
          <span className="rounded-full bg-foreground px-2 py-px text-[11px] font-extrabold tracking-[0.06em] text-background uppercase desktop:text-xs">
            {t.today}
          </span>
          <span className="h-1.5 w-0.5 bg-foreground" />
        </div>
        <div className="flex gap-[3px]">
          {timeline.spans.map((span, index) => (
            <div
              key={span.phase}
              className="h-2.5 min-w-0 overflow-hidden rounded-full"
              style={{ flex: `${span.endDay - span.startDay + 1} 1 0`, background: phaseTint(span.phase, 20) }}
            >
              <div
                className="phase-bar-grow h-full rounded-full"
                style={{
                  width: `${progress[index] * 100}%`,
                  background: PHASE_INK[span.phase],
                  animationDelay: `${300 + index * 140}ms`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-[18px] text-[11px] font-bold text-muted-foreground desktop:h-5 desktop:text-xs" aria-hidden>
          {timeline.spans.map((span) => (
            <span key={span.phase} className="absolute" style={{ left: `${((span.startDay - 1) / timeline.length) * 100}%` }}>
              {span.startDay}
            </span>
          ))}
          <span className="absolute right-0">{timeline.length}</span>
        </div>
        {split !== null ? (
          <div className="mt-1.5">
            <div className="flex h-0.5 gap-[3px]" aria-hidden>
              <span className="rounded-full" style={{ flex: `${split} 1 0`, background: PHASE_INK.follicular }} />
              <span className="rounded-full" style={{ flex: `${1 - split} 1 0`, background: PHASE_INK.luteal }} />
            </div>
            <p className="mt-1 flex flex-wrap justify-between gap-x-3 text-[11px] font-extrabold desktop:text-xs">
              <span style={{ color: PHASE_INK.follicular }}>{t.cycleHalfFirst}</span>
              <span style={{ color: PHASE_INK.luteal }}>{t.cycleHalfSecond}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HowEstimated({
  t,
  onClick,
  phase,
  className,
}: {
  t: Messages;
  onClick: () => void;
  phase: CyclePhase;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 text-[13px] font-extrabold whitespace-nowrap underline-offset-4 hover:underline desktop:text-sm",
        className,
      )}
      style={{ color: PHASE_INK[phase] }}
    >
      {t.howEstimated}
    </button>
  );
}

/**
 * The expanded phase card: the cycle at a glance, each phase with its dates
 * (the current one open: what happens inside, how you may feel, what may
 * help), the next period, and how it is all estimated.
 */
export function PhaseDetails({
  overview,
  timeline,
  phase,
  day,
  locale,
  t,
  onHowEstimated,
}: {
  overview: CycleOverview;
  timeline: CycleTimeline | null;
  phase: CyclePhase;
  day: number;
  locale: Locale;
  t: Messages;
  onHowEstimated: () => void;
}) {
  const [active, setActive] = useState<CyclePhase>(phase);
  const spans = timeline?.spans ?? [];
  const phases: CyclePhase[] = spans.length > 0 ? spans.map((span) => span.phase) : [phase];
  const nextPhase = NEXT_PHASE[phase];
  const days = overview.nextPeriodInDays;
  const nextDate = overview.nextPeriodDate;
  const when =
    days === null ? null : days <= 0 ? t.todayLower : days === 1 ? t.inOneDay : t.inDays.replace("{days}", String(days));
  // The open cycle's window, as the calendar marks it. Not for another cycle's timeline.
  const ovulation =
    overview.ovulation && timeline && overview.ovulation.cycleStart === timeline.cycleStart ? overview.ovulation : null;

  return (
    <div className="flex flex-col">
      {timeline ? <CycleBars timeline={timeline} day={day} t={t} revealIndex={0} /> : null}
      <ul className="mt-3 flex flex-col gap-1.5">
        {phases.map((item, index) => {
          const span = spans.find((entry) => entry.phase === item);
          const open = item === active;
          const copy = COPY[item];
          const season = String(t[SEASON_LABELS[phaseSeason(item)]]);
          return (
            <li key={item} className="phase-reveal" style={reveal(index + 1)}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(item)}
                className="flex w-full gap-3 rounded-[18px] border px-3.5 py-3 text-left transition-colors"
                style={{
                  background: open ? phaseTint(item, 14) : "transparent",
                  borderColor: open ? phaseTint(item, 30) : "transparent",
                }}
              >
                <span
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-full"
                  style={{ background: phaseTint(item, 18), color: PHASE_INK[item] }}
                >
                  <PhaseGlyph phase={item} className="size-[17px]" />
                </span>
                <span className="block min-w-0 flex-1">
                  {/* The dates keep their room on the right; when the name, season and
                      pill do not fit beside them (Nov 30 – Dec 5 on a phone), those wrap. */}
                  <span className="flex items-baseline gap-2">
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
                    <span className="text-[15px] font-extrabold">{phaseLabel(item, t)}</span>
                    <span className="text-xs font-bold text-muted-foreground">{season}</span>
                    {item === phase ? (
                      <span
                        className="self-center rounded-full px-1.5 py-px text-[11px] font-extrabold tracking-[0.08em] text-card uppercase"
                        style={{ background: PHASE_INK[item] }}
                      >
                        {t.phaseNow}
                      </span>
                    ) : item === nextPhase ? (
                      <span className="self-center rounded-full border border-border px-1.5 py-px text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseNext}
                      </span>
                    ) : null}
                    </span>
                    {span ? (
                      <span className="shrink-0 text-xs font-bold whitespace-nowrap text-muted-foreground">
                        {open
                          ? t.phaseDays.replace("{start}", String(span.startDay)).replace("{end}", String(span.endDay))
                          : dayRange(span.start, span.end, locale)}
                      </span>
                    ) : null}
                  </span>
                  {open ? (
                    <span className="block">
                      <span className="mt-2 block text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseInsideLabel}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-[1.45] text-card-foreground/85">{String(t[copy.inside])}</span>
                      <span className="mt-2 block text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseFeelLabel}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-[5px]">
                        {copy.feel.map((key) => (
                          <span
                            key={key}
                            className="rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] px-2.5 py-1 text-[13px] font-bold"
                          >
                            {String(t[key])}
                          </span>
                        ))}
                      </span>
                      <span className="mt-2 block text-[13px] leading-[1.45] text-card-foreground/85">
                        <span className="font-extrabold text-card-foreground">{t.phaseTipLabel} </span>
                        {String(t[copy.tip])}
                      </span>
                      {item === "ovulation" ? (
                        <span className="mt-1.5 block text-xs leading-[1.4] text-muted-foreground">{t.phaseOvulationNote}</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[13px] leading-[1.4] text-muted-foreground">{String(t[copy.summary])}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {ovulation ? (
        <div
          className="phase-reveal mt-2 flex items-center gap-3 rounded-[18px] border border-border px-3.5 py-3"
          style={reveal(phases.length + 1)}
        >
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full"
            style={{ background: phaseTint("ovulation", 18), color: PHASE_INK.ovulation }}
          >
            <PhaseGlyph phase="ovulation" className="size-[17px]" />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold desktop:text-base">{t.ovulationEstimateLabel}</span>
            <span className="mt-px block text-[13px] font-semibold text-muted-foreground first-letter:uppercase">
              {t.ovulationEstimateDetail
                .replace("{date}", formatIsoUtc(ovulation.mostLikely, locale, { weekday: "short", day: "numeric", month: "short" }))
                .replace("{range}", dayRange(ovulation.start, ovulation.end, locale))}
            </span>
            {ovulation.wide ? (
              <span className="mt-1 block text-xs leading-[1.4] text-muted-foreground">{t.ovulationWideNote}</span>
            ) : null}
          </span>
        </div>
      ) : null}
      {nextDate && when ? (
        <div
          className="phase-reveal mt-2 flex items-center gap-3 rounded-[18px] border border-border px-3.5 py-3"
          style={reveal(phases.length + 2)}
        >
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full"
            style={{ background: phaseTint("menstrual", 18), color: PHASE_INK.menstrual }}
          >
            <CalendarDays className="size-[17px]" aria-hidden />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold desktop:text-base">{t.nextPeriodLabel}</span>
            <span className="mt-px block text-[13px] font-semibold text-muted-foreground first-letter:uppercase">
              {t.nextPeriodDetail
                .replace("{date}", formatIsoUtc(nextDate, locale, { weekday: "short", day: "numeric", month: "short" }))
                .replace("{when}", when)}
            </span>
            {/* On its own line: beside the text, the phone's column left the date three words wide. */}
            <HowEstimated t={t} onClick={onHowEstimated} phase={phase} className="mt-1 block py-1 text-left" />
          </span>
        </div>
      ) : null}
      <p
        className="phase-reveal mt-2 text-center text-xs leading-[1.45] text-muted-foreground"
        style={reveal(phases.length + 3)}
      >
        {t.phaseDetailsNotice}
      </p>
    </div>
  );
}

/**
 * The expanded phase card on the desktop, a wide dialog with nothing folded
 * away: the card's header beside the cycle's bars, the phases side by side in
 * the order they come (each with what happens inside, how you may feel and
 * what may help; today's one tinted), then the estimated ovulation and the
 * next period. Same content and wording as PhaseDetails.
 */
export function PhaseDetailsWide({
  header,
  overview,
  timeline,
  phase,
  day,
  locale,
  t,
  onHowEstimated,
}: {
  header: ReactNode;
  overview: CycleOverview;
  timeline: CycleTimeline | null;
  phase: CyclePhase;
  day: number;
  locale: Locale;
  t: Messages;
  onHowEstimated: () => void;
}) {
  const spans = timeline?.spans ?? [];
  const phases: CyclePhase[] = spans.length > 0 ? spans.map((span) => span.phase) : [phase];
  const nextPhase = NEXT_PHASE[phase];
  const days = overview.nextPeriodInDays;
  const nextDate = overview.nextPeriodDate;
  const when =
    days === null ? null : days <= 0 ? t.todayLower : days === 1 ? t.inOneDay : t.inDays.replace("{days}", String(days));
  // The open cycle's window, as the calendar marks it. Not for another cycle's timeline.
  const ovulation =
    overview.ovulation && timeline && overview.ovulation.cycleStart === timeline.cycleStart ? overview.ovulation : null;
  const hasNext = Boolean(nextDate && when);
  const row = "phase-reveal flex items-center gap-3 rounded-[20px] border border-border px-5 py-3.5";
  const rowIcon = "flex size-[38px] shrink-0 items-center justify-center rounded-full";

  return (
    <div className="flex flex-col gap-5">
      <div className={cn("grid items-center gap-10 pr-10", timeline && "grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
        {header}
        {timeline ? <CycleBars timeline={timeline} day={day} t={t} revealIndex={0} className="" /> : null}
      </div>
      <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}>
        {phases.map((item, index) => {
          const span = spans.find((entry) => entry.phase === item);
          const current = item === phase;
          const copy = COPY[item];
          return (
            <li
              key={item}
              aria-current={current ? "true" : undefined}
              className="phase-reveal flex flex-col rounded-[22px] border px-4 py-4"
              style={{
                ...reveal(index + 1),
                background: current ? phaseTint(item, 14) : "transparent",
                borderColor: current ? phaseTint(item, 34) : "var(--border)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className={rowIcon} style={{ background: phaseTint(item, 18), color: PHASE_INK[item] }}>
                  <PhaseGlyph phase={item} className="size-[19px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="text-[17px] leading-tight font-extrabold">{phaseLabel(item, t)}</span>
                    {current ? (
                      <span
                        className="rounded-full px-2 py-px text-xs font-extrabold tracking-[0.08em] text-card uppercase"
                        style={{ background: PHASE_INK[item] }}
                      >
                        {t.phaseNow}
                      </span>
                    ) : item === nextPhase ? (
                      <span className="rounded-full border border-border px-2 py-px text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
                        {t.phaseNext}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-[13px] font-bold text-muted-foreground">{String(t[SEASON_LABELS[phaseSeason(item)]])}</p>
                </div>
              </div>
              {span ? (
                <p className="mt-3 text-[13px] font-bold" style={{ color: PHASE_INK[item] }}>
                  {dayRange(span.start, span.end, locale)}
                  <span className="font-semibold text-muted-foreground">
                    {" · "}
                    {t.phaseDays.replace("{start}", String(span.startDay)).replace("{end}", String(span.endDay))}
                  </span>
                </p>
              ) : null}
              <p className="mt-3 text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">{t.phaseInsideLabel}</p>
              <p className="mt-1 text-sm leading-[1.5] text-pretty text-card-foreground/85">{String(t[copy.inside])}</p>
              <p className="mt-3 text-xs font-extrabold tracking-[0.08em] text-muted-foreground uppercase">{t.phaseFeelLabel}</p>
              <p className="mt-1.5 flex flex-wrap gap-[5px]">
                {copy.feel.map((key) => (
                  <span key={key} className="rounded-full border border-[var(--glass-edge)] bg-[var(--glass)] px-2.5 py-1 text-[13px] font-bold">
                    {String(t[key])}
                  </span>
                ))}
              </p>
              <p className="mt-3 text-sm leading-[1.5] text-pretty text-card-foreground/85">
                <span className="font-extrabold text-card-foreground">{t.phaseTipLabel} </span>
                {String(t[copy.tip])}
              </p>
              {item === "ovulation" ? (
                <p className="mt-2 text-[13px] leading-[1.4] text-muted-foreground">{t.phaseOvulationNote}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      {ovulation || hasNext ? (
        <div className={cn("grid items-stretch gap-3", ovulation && hasNext && "grid-cols-2")}>
          {ovulation ? (
            <div className={row} style={reveal(phases.length + 1)}>
              <span className={rowIcon} style={{ background: phaseTint("ovulation", 18), color: PHASE_INK.ovulation }}>
                <PhaseGlyph phase="ovulation" className="size-[19px]" />
              </span>
              <span className="block min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold desktop:text-base">{t.ovulationEstimateLabel}</span>
                <span className="mt-px block text-sm font-semibold text-muted-foreground first-letter:uppercase">
                  {t.ovulationEstimateDetail
                    .replace("{date}", formatIsoUtc(ovulation.mostLikely, locale, { weekday: "short", day: "numeric", month: "short" }))
                    .replace("{range}", dayRange(ovulation.start, ovulation.end, locale))}
                </span>
                {ovulation.wide ? (
                  <span className="mt-1 block text-[13px] leading-[1.4] text-muted-foreground">{t.ovulationWideNote}</span>
                ) : null}
              </span>
            </div>
          ) : null}
          {nextDate && when ? (
            <div className={row} style={reveal(phases.length + 2)}>
              <span className={rowIcon} style={{ background: phaseTint("menstrual", 18), color: PHASE_INK.menstrual }}>
                <CalendarDays className="size-[19px]" aria-hidden />
              </span>
              <span className="block min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold desktop:text-base">{t.nextPeriodLabel}</span>
                <span className="mt-px block text-sm font-semibold text-muted-foreground first-letter:uppercase">
                  {t.nextPeriodDetail
                    .replace("{date}", formatIsoUtc(nextDate, locale, { weekday: "short", day: "numeric", month: "short" }))
                    .replace("{when}", when)}
                </span>
              </span>
              <HowEstimated t={t} onClick={onHowEstimated} phase={phase} />
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="phase-reveal text-center text-[13px] leading-[1.45] text-muted-foreground" style={reveal(phases.length + 3)}>
        {t.phaseDetailsNotice}
      </p>
    </div>
  );
}

/**
 * The expanded card when the period is due or late: when it is most likely to
 * start, the cycle that has gone by, and what to do when it starts.
 */
export function DueDetails({
  overview,
  timeline,
  day,
  today,
  locale,
  t,
  onHowEstimated,
  onPregnant,
}: {
  overview: CycleOverview;
  timeline: CycleTimeline | null;
  day: number;
  today: string;
  locale: Locale;
  t: Messages;
  onHowEstimated: () => void;
  /** "I'm pregnant": turns pregnancy mode on (PREGNANCY_AVAILABLE). Never suggested, only offered here. */
  onPregnant?: () => void;
}) {
  const forecast = overview.forecast;
  const interval = forecast ? coverageInterval(forecast.dailyProbabilities, 0.8) : null;
  const shortDate = (iso: string) =>
    iso === today ? t.todayLower : formatIsoUtc(iso, locale, { day: "numeric", month: "short" });
  const likely = forecast
    ? [
        t.dueMostLikely.replace("{date}", shortDate(forecast.mostLikelyDate)),
        interval ? t.dueLikelyBy.replace("{date}", shortDate(interval.upper)) : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <div className="flex flex-col">
      {forecast ? (
        <section className="phase-reveal mt-4" style={reveal(1)}>
          {likely ? <p className="text-[13px] font-bold text-card-foreground/85 desktop:text-sm">{likely}</p> : null}
          {overview.initialStartProbability !== null ? (
            <p className="mt-1 text-xs leading-[1.4] text-muted-foreground desktop:text-[13px]">
              {initialProbabilityLabel(overview.initialStartProbability, t)}
            </p>
          ) : null}
        </section>
      ) : null}
      {timeline ? <CycleBars timeline={timeline} day={day} t={t} revealIndex={2} /> : null}
      <div
        className="phase-reveal mt-3 flex items-start gap-3 rounded-[18px] px-3.5 py-3 desktop:px-4 desktop:py-3.5"
        style={{ ...reveal(3), background: phaseTint("menstrual", 14) }}
      >
        <span
          className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-card desktop:size-[38px]"
          style={{ color: PHASE_INK.menstrual }}
        >
          <Plus className="size-[17px] desktop:size-[19px]" aria-hidden />
        </span>
        <p className="text-[13.5px] leading-[1.45] text-card-foreground/85 desktop:text-[14.5px]">
          <span className="font-extrabold text-card-foreground">{t.dueTipStrong}</span> {t.dueTipRest}
        </p>
      </div>
      {/* The link under the notice on a phone, beside it in the desktop dialog. */}
      <div
        className="phase-reveal mt-2.5 flex flex-col items-start gap-1 desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-2.5"
        style={reveal(4)}
      >
        <p className="text-xs leading-[1.4] text-muted-foreground desktop:text-[13px]">{t.dueNotice}</p>
        <HowEstimated t={t} onClick={onHowEstimated} phase="menstrual" className="py-1 desktop:py-0" />
      </div>
      {onPregnant ? (
        <button
          type="button"
          data-close-card=""
          onClick={onPregnant}
          className="phase-reveal mx-auto mt-2 px-3 py-2 text-[13.5px] font-bold text-muted-foreground underline underline-offset-4 desktop:text-[14.5px]"
          style={reveal(5)}
        >
          {t.pregnancyOfferFromDue}
        </button>
      ) : null}
    </div>
  );
}
