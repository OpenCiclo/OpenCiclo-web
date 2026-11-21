// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { SunCalc } from "@zonneplan/suncalc";

export const MOON_PHASE_IDS = [
  "newMoon",
  "waxingCrescent",
  "firstQuarter",
  "waxingGibbous",
  "fullMoon",
  "waningGibbous",
  "lastQuarter",
  "waningCrescent",
] as const;

export type MoonPhaseId = (typeof MOON_PHASE_IDS)[number];

export type LunarDayInfo = {
  phaseId: MoonPhaseId;
  /** Continuous phase in [0, 1): 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  phase: number;
  /** Illuminated fraction in [0, 1]. */
  fraction: number;
  /** Rounded illuminated percentage for accessible labels. */
  percent: number;
  waxing: boolean;
  isMajor: boolean;
};

const MAJOR_PHASES: ReadonlySet<MoonPhaseId> = new Set([
  "newMoon",
  "firstQuarter",
  "fullMoon",
  "lastQuarter",
]);

/** Classify a continuous phase value into one of the eight named phases. */
export function classifyMoonPhase(phase: number): MoonPhaseId {
  const normalized = ((phase % 1) + 1) % 1;
  return MOON_PHASE_IDS[Math.round(normalized * 8) % 8];
}

/**
 * A day's moon never changes, and the calendar asks for the same days on every
 * render (each cell, its two neighbours, the month beside it while swiping),
 * so answers are kept by day. Bounded: a few years of days, then it starts over.
 */
const CACHE_LIMIT = 2000;
const dayInfoCache = new Map<string, LunarDayInfo>();
const mainPhaseDayCache = new Map<string, boolean>();

/**
 * Lunar illumination for a diary ISO date (YYYY-MM-DD).
 * Uses UTC noon so the day does not flip with local midnight.
 * The same object comes back for the same day: treat it as read-only.
 */
export function lunarDayInfo(iso: string): LunarDayInfo {
  const known = dayInfoCache.get(iso);
  if (known) return known;
  if (dayInfoCache.size >= CACHE_LIMIT) dayInfoCache.clear();
  const info = computeLunarDayInfo(iso);
  dayInfoCache.set(iso, info);
  return info;
}

function computeLunarDayInfo(iso: string): LunarDayInfo {
  const date = new Date(`${iso}T12:00:00.000Z`);
  const { phase, fraction, angle } = new SunCalc(date).getMoonIllumination();
  const phaseId = classifyMoonPhase(phase);
  return {
    phaseId,
    phase,
    fraction,
    percent: Math.round(fraction * 100),
    waxing: angle < 0,
    isMajor: MAJOR_PHASES.has(phaseId),
  };
}

const DAY_MS = 86_400_000;

function shiftDay(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T12:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** How far a phase is from the nearest main one (new, first quarter, full, last quarter), in phase units. */
function distanceToMainPhase(phase: number): number {
  const position = (((phase % 1) + 1) % 1) * 4;
  return Math.abs(position - Math.round(position)) / 4;
}

/**
 * Whether a main phase falls on this day: of the days around it, the one
 * closest to a new moon, a quarter or a full moon. Unlike `isMajor` (true for
 * the three or four days a phase's name covers) this is true for one day per
 * phase, about every seven days.
 */
export function isMainPhaseDay(iso: string): boolean {
  const known = mainPhaseDayCache.get(iso);
  if (known !== undefined) return known;
  if (mainPhaseDayCache.size >= CACHE_LIMIT) mainPhaseDayCache.clear();
  const here = distanceToMainPhase(lunarDayInfo(iso).phase);
  const main =
    here < distanceToMainPhase(lunarDayInfo(shiftDay(iso, -1)).phase) &&
    here <= distanceToMainPhase(lunarDayInfo(shiftDay(iso, 1)).phase);
  mainPhaseDayCache.set(iso, main);
  return main;
}

/** The next full or new moon after `iso` (never that day itself): the day it falls on, and which of the two. */
export function nextFullOrNewMoon(iso: string): { iso: string; phaseId: "fullMoon" | "newMoon" } | null {
  for (let offset = 1; offset <= 31; offset += 1) {
    const day = shiftDay(iso, offset);
    if (!isMainPhaseDay(day)) continue;
    const { phaseId } = lunarDayInfo(day);
    if (phaseId === "fullMoon" || phaseId === "newMoon") return { iso: day, phaseId };
  }
  return null;
}
