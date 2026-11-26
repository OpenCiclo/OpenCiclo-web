// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Heart } from "lucide-react";

import { CARD, PhaseAura, type AuraColors } from "@/components/calendar/phase-visuals";
import { PhaseCardOverlay, type CardRect } from "@/components/calendar/phase-card-overlay";
import { useIsDesktop } from "@/lib/client/desktop";
import { addDaysIso } from "@/lib/diary";
import { formatIsoUtc } from "@/lib/format-date";
import type { Locale, Messages } from "@/lib/i18n";
import type { DatingMethod, Trimester } from "@/lib/pregnancy/dating";
import type { PregnancyRecord } from "@/lib/pregnancy/record";
import { pregnancyCardData, type PregnancyCardData } from "@/lib/pregnancy/view";
import { cn } from "@/lib/utils";

export const PREGNANCY_AURA: AuraColors = { glow: "var(--pregnancy-aura)", blob: "var(--pregnancy-aura-2)" };
const INK = "var(--pregnancy-ink)";

const TRIMESTER_LABEL: Record<Trimester, keyof Messages> = {
  1: "pregnancyTrimester1",
  2: "pregnancyTrimester2",
  3: "pregnancyTrimester3",
};

const METHOD_LABEL: Record<DatingMethod, keyof Messages> = {
  lmp: "pregnancyMethodLmp",
  dueDate: "pregnancyMethodDueDate",
  ultrasound: "pregnancyMethodUltrasound",
  conception: "pregnancyMethodConception",
  transfer: "pregnancyMethodTransfer",
};

export function trimesterLabel(trimester: Trimester, t: Messages): string {
  return String(t[TRIMESTER_LABEL[trimester]]);
}

export function datingMethodLabel(method: DatingMethod, t: Messages): string {
  return String(t[METHOD_LABEL[method]]);
}

/** "Week 12 and 3 days", counted from zero. */
export function weekTitle(data: Pick<PregnancyCardData, "age">, t: Messages): string {
  const { weeks, days } = data.age;
  const template = days === 0 ? t.pregnancyWeekExact : days === 1 ? t.pregnancyWeekOneDay : t.pregnancyWeekDays;
  return template.replace("{weeks}", String(weeks)).replace("{days}", String(days));
}

function shortDate(iso: string, locale: Locale): string {
  return formatIsoUtc(iso, locale, { day: "numeric", month: "long" });
}

export function dayRange(start: string, end: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  return formatter.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}

/** "27 weeks to go · due 14 July". */
export function weeksLeftLine(data: PregnancyCardData, locale: Locale, t: Messages): string {
  const due = shortDate(data.dueDate, locale);
  const template =
    data.weeksLeft === 0 ? t.pregnancyDueOnly : data.weeksLeft === 1 ? t.pregnancyWeekLeft : t.pregnancyWeeksLeft;
  return template.replace("{weeks}", String(data.weeksLeft)).replace("{date}", due);
}

/** Forty weeks as three arcs, one per trimester, filled up to `progress` (0–1). Also a friend's card when she shares hers. */
export function PregnancyRing({
  progress,
  animate,
  size = 58,
  sizeClass,
  glyphClass = "size-[18px]",
}: {
  progress: number;
  animate: boolean;
  size?: number;
  /** Size classes for the ring, when CSS decides it (the card: bigger on the desktop); it is then drawn in a `size` box and scaled. */
  sizeClass?: string;
  glyphClass?: string;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 4;
  // Trimester shares of 40 weeks: 14, 14, 12.
  const shares = [14 / 40, 14 / 40, 12 / 40];
  let offset = 0;
  const arcs = shares.map((share, index) => {
    const length = share * circumference - gap;
    const from = offset;
    offset += share * circumference;
    const filledShare = Math.max(0, Math.min(1, (progress - from / circumference) / share));
    return { index, from, length, filled: filledShare * length };
  });
  return (
    <div
      className={cn("relative shrink-0", sizeClass, animate && "animate-pop-in")}
      style={sizeClass ? undefined : { width: size, height: size }}
      aria-hidden
    >
      <svg
        width={sizeClass ? "100%" : size}
        height={sizeClass ? "100%" : size}
        viewBox={`0 0 ${size} ${size}`}
        className="block -rotate-90"
      >
        {arcs.map((arc) => (
          <g key={arc.index}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={INK}
              strokeOpacity={0.18}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${arc.length} ${circumference}`}
              strokeDashoffset={-arc.from}
            />
            {arc.filled > 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={INK}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${arc.filled} ${circumference}`}
                strokeDashoffset={-arc.from}
              />
            ) : null}
          </g>
        ))}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" style={{ color: INK }}>
        <Heart className={glyphClass} />
      </span>
    </div>
  );
}

function PregnancyHeader({
  data,
  locale,
  t,
  animate,
}: {
  data: PregnancyCardData;
  locale: Locale;
  t: Messages;
  animate: boolean;
}) {
  const ask = data.askStillGoing;
  return (
    <div className="relative z-[1]">
      <div className={CARD.row}>
        <PregnancyRing
          progress={data.progress}
          animate={animate}
          sizeClass="size-16 desktop:size-[74px]"
          glyphClass="size-5 desktop:size-[23px]"
        />
        <div className={CARD.column}>
          <p className={CARD.label} style={{ color: INK }}>
            {ask ? t.pregnancyCardLabel : `${t.pregnancyCardLabel} · ${trimesterLabel(data.trimester, t)}`}
          </p>
          <p className={CARD.title}>
            {ask ? t.pregnancyStillGoingTitle : weekTitle(data, t)}
          </p>
          {ask ? null : <p className={CARD.meta}>{weeksLeftLine(data, locale, t)}</p>}
        </div>
      </div>
      <p className={CARD.body}>
        {ask ? t.pregnancyStillGoingBody : t.pregnancyNotice}
      </p>
    </div>
  );
}

/** The expanded pregnancy card: dates, how it was dated, trimesters, Learn, and the way out. */
function PregnancyDetails({
  data,
  locale,
  t,
  onChangeDates,
  onEnd,
}: {
  data: PregnancyCardData;
  locale: Locale;
  t: Messages;
  onChangeDates: () => void;
  onEnd: () => void;
}) {
  const [first, second, third] = data.trimesterStarts;
  const trimesters: [Trimester, string, string][] = [
    [1, first, addDaysIso(second, -1)],
    [2, second, addDaysIso(third, -1)],
    [3, third, data.dueDate],
  ];
  return (
    <div className="flex flex-col gap-2">
      <section className="mt-3 rounded-[18px] border border-border px-3.5 py-3 desktop:px-4 desktop:py-3.5">
        <div className="flex items-start gap-3">
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full desktop:size-[38px]"
            style={{ background: "color-mix(in oklch, var(--pregnancy-ink) 18%, transparent)", color: INK }}
          >
            <CalendarDays className="size-[17px] desktop:size-[19px]" aria-hidden />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold desktop:text-base">{t.pregnancyDueDateLabel}</span>
            <span className="mt-px block text-[13px] font-semibold text-muted-foreground first-letter:uppercase desktop:text-sm">
              {formatIsoUtc(data.dueDate, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="mt-1 block text-[13px] text-muted-foreground desktop:text-sm">
              {t.pregnancyWindow
                .replace("{start}", shortDate(data.window.start, locale))
                .replace("{end}", shortDate(data.window.end, locale))}
            </span>
            <span className="mt-1 block text-[13px] text-muted-foreground desktop:text-sm">
              {t.pregnancyDatedBy.replace("{method}", datingMethodLabel(data.record.dating.method, t))}
            </span>
          </span>
          <button
            type="button"
            data-close-card=""
            onClick={onChangeDates}
            className="shrink-0 text-[13px] font-extrabold underline-offset-4 hover:underline desktop:text-sm"
            style={{ color: INK }}
          >
            {t.pregnancyChange}
          </button>
        </div>
      </section>
      <section className="rounded-[18px] border border-border px-3.5 py-3 desktop:px-4 desktop:py-3.5">
        <h3 className="text-[11px] font-extrabold tracking-[0.1em] text-muted-foreground uppercase desktop:text-xs">{t.pregnancyTrimestersTitle}</h3>
        <ul className="mt-1.5 flex flex-col gap-1">
          {trimesters.map(([number, start, end]) => (
            <li
              key={number}
              className={cn("flex items-baseline justify-between gap-3 text-[15px] desktop:text-base", number === data.trimester ? "font-extrabold" : "font-semibold text-card-foreground/80")}
            >
              <span>{trimesterLabel(number, t)}</span>
              <span className="text-[13px] text-muted-foreground desktop:text-sm">{dayRange(start, end, locale)}</span>
            </li>
          ))}
        </ul>
      </section>
      <Link
        href="/learn/healthy-pregnancy"
        className="rounded-[18px] border border-border px-3.5 py-3 desktop:px-4 desktop:py-3.5 text-[15px] font-bold underline-offset-4 hover:underline desktop:text-base"
        style={{ color: INK }}
      >
        {t.pregnancyLearnLink}
      </Link>
      <button
        type="button"
        data-close-card=""
        onClick={onEnd}
        className="mx-auto mt-1 px-3 py-2 text-[13.5px] font-bold text-muted-foreground underline underline-offset-4 desktop:text-[14.5px]"
      >
        {t.pregnancyEndAction}
      </button>
    </div>
  );
}

/**
 * The card above the calendar while a pregnancy goes on, in the phase card's
 * place, with its own colours. Tapping it expands it like the phase card.
 */
export function PregnancyCard({
  record,
  today,
  locale,
  t,
  onChangeDates,
  onEnd,
}: {
  record: PregnancyRecord;
  today: string;
  locale: Locale;
  t: Messages;
  onChangeDates: () => void;
  onEnd: () => void;
}) {
  const data = pregnancyCardData(record, today);
  const isDesktop = useIsDesktop();
  const cardRef = useRef<HTMLElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<CardRect | null>(null);
  const pending = useRef<null | (() => void)>(null);
  const open = origin !== null;
  const restoreFocusRef = useRef(false);
  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    openRef.current?.focus();
  }, [open]);

  function expand() {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }

  // The buttons inside close the card (data-close-card); the sheet opens once it has.
  const details = (): ReactNode => (
    <PregnancyDetails
      data={data}
      locale={locale}
      t={t}
      onChangeDates={() => {
        pending.current = onChangeDates;
      }}
      onEnd={() => {
        pending.current = onEnd;
      }}
    />
  );

  return (
    <>
      <section
        ref={cardRef}
        className={cn(
          "animate-fade-up relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-sm",
          CARD.pad,
          CARD.aura,
          open && !isDesktop && "invisible",
        )}
        style={{ animationDelay: "60ms" }}
      >
        <PhaseAura phase="follicular" next="ovulation" animate colors={PREGNANCY_AURA} />
        <PregnancyHeader data={data} locale={locale} t={t} animate />
        <button
          ref={openRef}
          type="button"
          onClick={expand}
          aria-label={t.pregnancyCardOpen}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden className={cn(CARD.corner, "desktop:top-4 desktop:right-4")}>
            <ChevronDown className={cn("phase-nudge", CARD.cornerIcon)} />
          </span>
        </button>
      </section>
      {origin ? (
        <PhaseCardOverlay
          origin={origin}
          desktop={isDesktop}
          phase="follicular"
          next="ovulation"
          auraColors={PREGNANCY_AURA}
          title={t.pregnancyDetailsTitle}
          header={<PregnancyHeader data={data} locale={locale} t={t} animate={false} />}
          details={details}
          t={t}
          onClosed={() => {
            setOrigin(null);
            const next = pending.current;
            pending.current = null;
            if (next) next();
            else restoreFocusRef.current = true;
          }}
        />
      ) : null}
    </>
  );
}
