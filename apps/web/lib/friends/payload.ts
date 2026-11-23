// Copyright Â© 2026 Emma Flora Harbison & Luis Rey SÃ¡nchez
// SPDX-License-Identifier: Apache-2.0

// The messages two friends' devices exchange, sealed in boxes (lib/friends/crypto.ts),
// and how a card reads a friend's status. Pure: no React, no network.
//
// A status carries the current cycle as three numbers (its start, the expected
// next start, the expected bleed length), never the diary. The viewer's device
// turns them into phases with the same heuristic as the phase card
// (`cycleTimeline`), so the card stays right on days the sharer does not open
// the app. Symptoms, notes from the diary, flow and past cycles are never sent.
//
// A pregnancy is in a status only when she chose to share it: then the status
// carries its due date instead of a cycle, and the viewer's device shows the
// week (lib/pregnancy/friends.ts).

import { cycleOverview, type CyclePhase, type PhaseSource } from "@/lib/cycle/phases";
import { cycleTimeline } from "@/lib/cycle/phase-timeline";
import { isIsoDate, type Diary } from "@/lib/diary";
import { daysBetween } from "@/lib/forecast/math";
import { isExchangePublicKey } from "@/lib/friends/crypto";
import { MAX_NAME_LENGTH, MAX_NOTE_LENGTH } from "@/lib/friends/limits";
import {
  PREGNANCY_DAYS,
  STILL_GOING_ASK_DAYS,
  gestationalAge,
  gestationalDays,
  trimesterFor,
  type Trimester,
} from "@/lib/pregnancy/dating";
import { friendsSource, sharedPregnancy } from "@/lib/pregnancy/friends";

export const MESSAGE_VERSION = 1;

/** What the sharer chose to show besides the phase. */
export type ShareChoices = { day: boolean; expected: boolean };

export type FriendNote = { text: string; date: string };

/** The invite box: who invites, and the public half of the invite's exchange key. */
export type InviteMessage = { t: "invite"; v: number; selfId: string; name: string; at: string; pub: string };

/** The handshake box: the joiner's answer, with the public half of its exchange key. */
export type HandshakeMessage = { t: "handshake"; v: number; selfId: string; name: string; at: string; pub: string };

export type StatusCycle = { start: string; next: string; bleed: number };

export type StatusMessage = {
  t: "status";
  v: number;
  selfId: string;
  name: string;
  /** The sharer's date when this was written. */
  at: string;
  state: "sharing" | "paused" | "ended";
  /** The current cycle, or null when there is no estimate to share. */
  cycle: StatusCycle | null;
  /** Bleeding logged on `date` (the sharer's today when written). */
  observed: { date: string; cycleDay: number } | null;
  show: ShareChoices;
  note: FriendNote | null;
  /** Only when she shares her pregnancy: its due date. Absent otherwise (builds from before it ignore it). */
  pregnancy?: { due: string };
};

/** A note is shown for this many days, counting the day it was written. */
export const NOTE_DAYS = 2;
/** After the expected start, how long the card says "period expected about now". */
export const DUE_DAYS = 5;
/**
 * A status written longer ago than this reads as "no recent update". Below the
 * status box's life (BOX_TTL_DAYS.status), so a card says "no recent update"
 * before the box can expire.
 */
export const STALE_AFTER_DAYS = 30;

/** The bleed lengths a status may carry; the writer clamps, the reader refuses others. */
const MIN_BLEED = 1;
const MAX_BLEED = 30;

const DEFAULT_BLEED = 5;

/** A name or note cut to its limit, without control characters. */
export function cleanText(text: string, max: number): string {
  return Array.from(text.replace(/[\u0000-\u001f\u007f]+/g, " ").trim()).slice(0, max).join("");
}

export type SharerProfile = {
  selfId: string;
  name: string;
  show: ShareChoices;
  note: FriendNote | null;
  paused: boolean;
  /** The id of the pregnancy she chose to share (the friend book's `pregnancy`), if any. */
  pregnancy?: string | null;
};

/**
 * What the sharer's device sends: today's phase inputs from the diary, through
 * `cycleOverview` (the phase card's source). With the forecast off only bleeding
 * logged today is sent; with no period start there is nothing to estimate. A
 * pregnancy in the diary is in it only when she chose to share that one
 * (`profile.pregnancy`): then the status is its due date and no cycle.
 * Otherwise friends see the diary without it, or her usual cycle simulated
 * (`friendsSource`, lib/pregnancy/friends.ts).
 */
export function buildStatus(diary: Diary, today: string, profile: SharerProfile): StatusMessage {
  const base = {
    t: "status" as const,
    v: MESSAGE_VERSION,
    selfId: profile.selfId,
    name: cleanText(profile.name, MAX_NAME_LENGTH),
    at: today,
    show: { ...profile.show },
  };
  if (profile.paused) {
    return { ...base, state: "paused", cycle: null, observed: null, note: null };
  }
  const note = profile.note ? { text: cleanText(profile.note.text, MAX_NOTE_LENGTH), date: profile.note.date } : null;
  const shared = sharedPregnancy(diary, profile.pregnancy, today);
  if (shared) {
    return { ...base, state: "sharing", cycle: null, observed: null, note: note?.text ? note : null, pregnancy: shared };
  }
  const source = friendsSource(diary, today);
  if (source.kind === "simulated") {
    const bleed = Math.min(
      MAX_BLEED,
      Math.max(MIN_BLEED, Math.round(cycleOverview(diary, today).expectedPeriodLength ?? DEFAULT_BLEED)),
    );
    return {
      ...base,
      state: "sharing",
      cycle: { start: source.cycle.start, next: source.cycle.next, bleed },
      observed: null,
      note: note?.text ? note : null,
    };
  }
  const overview = cycleOverview(source.diary, today);
  const phase = overview.currentPhase;
  const observed = phase?.source === "observed" ? { date: today, cycleDay: phase.cycleDay } : null;
  let cycle: StatusCycle | null = null;
  if (overview.forecastingEnabled && phase && overview.nextPeriodDate && overview.nextPeriodDate > phase.cycleStart) {
    cycle = {
      start: phase.cycleStart,
      next: overview.nextPeriodDate,
      bleed: Math.min(MAX_BLEED, Math.max(MIN_BLEED, Math.round(overview.expectedPeriodLength ?? DEFAULT_BLEED))),
    };
  }
  return { ...base, state: "sharing", cycle, observed, note: note?.text ? note : null };
}

/** The status a removed friend receives: nothing but "this friendship ended". */
export function endedStatus(selfId: string, today: string): StatusMessage {
  return {
    t: "status",
    v: MESSAGE_VERSION,
    selfId,
    name: "",
    at: today,
    state: "ended",
    cycle: null,
    observed: null,
    show: { day: false, expected: false },
    note: null,
  };
}

export type FriendView =
  | {
      kind: "phase";
      phase: CyclePhase;
      source: PhaseSource;
      /** Null when the sharer does not show it. */
      cycleDay: number | null;
      /** Days until the expected start; null when the sharer does not show it. */
      daysToNext: number | null;
    }
  | { kind: "due" }
  /** She shares her pregnancy: the week on the viewer's date, counted from zero like her own card. */
  | { kind: "pregnancy"; weeks: number; days: number; trimester: Trimester; progress: number }
  | { kind: "noEstimate" }
  | { kind: "stale" }
  | { kind: "paused" }
  | { kind: "ended" };

/**
 * What a friend's card shows on the viewer's `today`. A viewer a day behind the
 * sharer (another time zone) reads the sharer's date instead, so a period just
 * logged never shows as the day before.
 */
export function readStatus(status: StatusMessage, today: string): FriendView {
  if (status.state === "ended") return { kind: "ended" };
  if (status.state === "paused") return { kind: "paused" };
  const date = today < status.at ? status.at : today;
  if (daysBetween(status.at, date) > STALE_AFTER_DAYS) return { kind: "stale" };
  if (status.pregnancy) {
    // Past 42 weeks her own card stops counting too; her next status says what comes after.
    const total = gestationalDays(status.pregnancy.due, date);
    if (total < 0 || total >= STILL_GOING_ASK_DAYS) return { kind: "noEstimate" };
    const age = gestationalAge(status.pregnancy.due, date);
    return {
      kind: "pregnancy",
      weeks: age.weeks,
      days: age.days,
      trimester: trimesterFor(age.totalDays),
      progress: Math.min(1, age.totalDays / PREGNANCY_DAYS),
    };
  }
  if (status.observed && status.observed.date === date) {
    return {
      kind: "phase",
      phase: "menstrual",
      source: "observed",
      cycleDay: status.show.day ? status.observed.cycleDay : null,
      daysToNext: null,
    };
  }
  const cycle = status.cycle;
  if (!cycle) return { kind: "noEstimate" };
  const sinceExpected = daysBetween(cycle.next, date);
  if (sinceExpected >= DUE_DAYS) return { kind: "stale" };
  if (sinceExpected >= 0) {
    // The phase heuristic keeps saying "luteal" after the expected start; the
    // phase card shows the expected period instead (`showsPeriodDue`).
    if (status.show.expected) return { kind: "due" };
    return { kind: "phase", phase: "luteal", source: "estimated", cycleDay: null, daysToNext: null };
  }
  const timeline = cycleTimeline(cycle.start, cycle.next, cycle.bleed);
  const day = daysBetween(cycle.start, date) + 1;
  const span = timeline?.spans.find((item) => day >= item.startDay && day <= item.endDay);
  if (!span) return { kind: "noEstimate" };
  return {
    kind: "phase",
    phase: span.phase,
    source: "estimated",
    cycleDay: status.show.day ? day : null,
    daysToNext: status.show.expected ? -sinceExpected : null,
  };
}

/** The friend's note while it is fresh (written today or yesterday for the viewer), else null. */
export function visibleNote(status: StatusMessage, today: string): FriendNote | null {
  if (status.state !== "sharing" || !status.note) return null;
  const age = daysBetween(status.note.date, today);
  return age >= -1 && age < NOTE_DAYS ? status.note : null;
}

// Parsing: a friend's device may run another version, or be broken. Anything
// that does not have the expected shape is dropped, never trusted.

type Unknown = Record<string, unknown>;

function isObject(value: unknown): value is Unknown {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && isIsoDate(value);
}

function isHexId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{32}$/.test(value);
}

function isName(value: unknown): value is string {
  return typeof value === "string" && Array.from(value).length <= MAX_NAME_LENGTH;
}

function isDay(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 400;
}

function isVersion(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

export function parseInviteMessage(value: unknown): InviteMessage | null {
  if (!isObject(value) || value.t !== "invite" || !isVersion(value.v)) return null;
  if (!isHexId(value.selfId) || !isName(value.name) || !isDate(value.at)) return null;
  if (!isExchangePublicKey(value.pub)) return null;
  return { t: "invite", v: value.v as number, selfId: value.selfId, name: value.name, at: value.at, pub: value.pub };
}

export function parseHandshakeMessage(value: unknown): HandshakeMessage | null {
  if (!isObject(value) || value.t !== "handshake" || !isVersion(value.v)) return null;
  if (!isHexId(value.selfId) || !isName(value.name) || !isDate(value.at)) return null;
  if (!isExchangePublicKey(value.pub)) return null;
  return { t: "handshake", v: value.v as number, selfId: value.selfId, name: value.name, at: value.at, pub: value.pub };
}

function parseCycle(value: unknown): StatusCycle | null | undefined {
  if (value === null) return null;
  if (!isObject(value) || !isDate(value.start) || !isDate(value.next)) return undefined;
  if (!(value.next > value.start) || daysBetween(value.start, value.next) > 400) return undefined;
  if (typeof value.bleed !== "number" || !Number.isFinite(value.bleed) || value.bleed < MIN_BLEED || value.bleed > MAX_BLEED) {
    return undefined;
  }
  return { start: value.start, next: value.next, bleed: value.bleed };
}

function parseObserved(value: unknown): StatusMessage["observed"] | undefined {
  if (value === null) return null;
  if (!isObject(value) || !isDate(value.date) || !isDay(value.cycleDay)) return undefined;
  return { date: value.date, cycleDay: value.cycleDay };
}

/** The shared pregnancy: null when the status has none, undefined when it is malformed. */
function parsePregnancy(value: unknown): { due: string } | null | undefined {
  if (value === undefined || value === null) return null;
  if (!isObject(value) || !isDate(value.due)) return undefined;
  return { due: value.due };
}

function parseNote(value: unknown): FriendNote | null | undefined {
  if (value === null) return null;
  if (!isObject(value) || typeof value.text !== "string" || !isDate(value.date)) return undefined;
  if (Array.from(value.text).length > MAX_NOTE_LENGTH) return undefined;
  return { text: value.text, date: value.date };
}

export function parseStatusMessage(value: unknown): StatusMessage | null {
  if (!isObject(value) || value.t !== "status" || !isVersion(value.v)) return null;
  if (!isHexId(value.selfId) || !isName(value.name) || !isDate(value.at)) return null;
  if (value.state !== "sharing" && value.state !== "paused" && value.state !== "ended") return null;
  const cycle = parseCycle(value.cycle);
  const observed = parseObserved(value.observed);
  const note = parseNote(value.note);
  const pregnancy = parsePregnancy(value.pregnancy);
  if (cycle === undefined || observed === undefined || note === undefined || pregnancy === undefined) return null;
  const show = isObject(value.show) ? value.show : {};
  return {
    ...(pregnancy && value.state === "sharing" ? { pregnancy } : {}),
    t: "status",
    v: value.v as number,
    selfId: value.selfId,
    name: value.name,
    at: value.at,
    state: value.state,
    cycle,
    observed,
    show: { day: show.day === true, expected: show.expected === true },
    note,
  };
}
