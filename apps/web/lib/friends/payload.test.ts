// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { cycleOverview } from "@/lib/cycle/phases";
import { showsPeriodDue } from "@/lib/cycle/phase-timeline";
import { addDaysIso, parseDiary } from "@/lib/diary";
import { newExchangeKeys } from "@/lib/friends/crypto";
import { BOX_TTL_DAYS } from "@/lib/friends/limits";

import {
  buildStatus,
  endedStatus,
  parseHandshakeMessage,
  parseInviteMessage,
  parseStatusMessage,
  readStatus,
  STALE_AFTER_DAYS,
  visibleNote,
  type SharerProfile,
  type StatusMessage,
} from "./payload";

function diaryWithStarts(starts: string[], extraDays: Record<string, object> = {}, settings: object = {}) {
  const days = Object.fromEntries(starts.map((iso) => [iso, { flow: "medium", symptoms: {} }]));
  return parseDiary({ schemaVersion: 3, locale: "en", periodStarts: starts, days: { ...days, ...extraDays }, ...settings });
}

const STARTS = ["2026-07-01", "2026-07-29", "2026-08-26", "2026-09-23"];
const SELF = "0123456789abcdef0123456789abcdef";

const profile: SharerProfile = {
  selfId: SELF,
  name: "Emma",
  show: { day: true, expected: true },
  note: null,
  paused: false,
};

describe("friend status", () => {
  it("keeps showing what the sharer's own phase card shows, on every day until the expected period", () => {
    const diary = diaryWithStarts(STARTS);
    const published = "2026-09-26";
    const status = buildStatus(diary, published, profile);
    expect(status.cycle?.start).toBe("2026-09-23");
    let checked = 0;
    for (let offset = 0; offset < 40; offset += 1) {
      const day = addDaysIso(published, offset);
      const overview = cycleOverview(diary, day);
      const view = readStatus(status, day);
      if (showsPeriodDue(overview)) {
        expect(view.kind === "due" || view.kind === "stale", day).toBe(true);
        continue;
      }
      // Bleeding logged on the start day is "observed" for the sharer; the
      // status was written later, so the viewer reads the estimate (same phase).
      expect(view, day).toMatchObject({ kind: "phase", phase: overview.currentPhase?.phase });
      if (view.kind === "phase") {
        expect(view.cycleDay).toBe(overview.currentPhase?.cycleDay);
        expect(view.daysToNext).toBe(overview.nextPeriodInDays);
      }
      checked += 1;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("sends only the current cycle: no symptoms, notes, flow or past starts", () => {
    const diary = diaryWithStarts(STARTS, {
      "2026-09-25": { flow: "heavy", symptoms: { cramps: "severe" }, note: "private words" },
    });
    const text = JSON.stringify(buildStatus(diary, "2026-09-25", profile));
    expect(text).not.toContain("private words");
    expect(text).not.toContain("cramps");
    expect(text).not.toContain("heavy");
    expect(text).not.toContain("2026-08-26");
  });

  it("shows bleeding logged today as observed, on that day only", () => {
    const diary = diaryWithStarts(STARTS, { "2026-09-24": { flow: "light", symptoms: {} } });
    const status = buildStatus(diary, "2026-09-24", profile);
    expect(status.observed).toEqual({ date: "2026-09-24", cycleDay: 2 });
    expect(readStatus(status, "2026-09-24")).toMatchObject({ kind: "phase", phase: "menstrual", source: "observed", cycleDay: 2 });
    const nextDay = cycleOverview(diary, "2026-09-25").currentPhase;
    expect(readStatus(status, "2026-09-25")).toMatchObject({ phase: nextDay?.phase, source: "estimated", cycleDay: 3 });
  });

  it("with the forecast off, sends only bleeding logged today", () => {
    const off = { forecastingEnabled: false };
    const quiet = buildStatus(diaryWithStarts(STARTS, {}, off), "2026-09-28", profile);
    expect(quiet.cycle).toBeNull();
    expect(readStatus(quiet, "2026-09-28")).toEqual({ kind: "noEstimate" });
    const bleeding = buildStatus(diaryWithStarts(STARTS, {}, off), "2026-09-23", profile);
    expect(bleeding.cycle).toBeNull();
    expect(readStatus(bleeding, "2026-09-23")).toMatchObject({ kind: "phase", phase: "menstrual", source: "observed" });
    expect(readStatus(bleeding, "2026-09-24")).toEqual({ kind: "noEstimate" });
  });

  it("has nothing to estimate without a period start", () => {
    const status = buildStatus(diaryWithStarts([]), "2026-09-28", profile);
    expect(status.cycle).toBeNull();
    expect(status.observed).toBeNull();
    expect(readStatus(status, "2026-09-28")).toEqual({ kind: "noEstimate" });
  });

  it("says the period is expected about now for a few days, then that there is no recent update, never days late", () => {
    const status = buildStatus(diaryWithStarts(STARTS), "2026-10-01", profile);
    const next = status.cycle!.next;
    expect(readStatus(status, next)).toEqual({ kind: "due" });
    expect(readStatus(status, addDaysIso(next, 4))).toEqual({ kind: "due" });
    expect(readStatus(status, addDaysIso(next, 5))).toEqual({ kind: "stale" });
    const hidden = buildStatus(diaryWithStarts(STARTS), "2026-10-01", { ...profile, show: { day: false, expected: false } });
    expect(readStatus(hidden, next)).toEqual({ kind: "phase", phase: "luteal", source: "estimated", cycleDay: null, daysToNext: null });
  });

  it("hides the cycle day and the days to the period when the sharer chose so", () => {
    const status = buildStatus(diaryWithStarts(STARTS), "2026-09-30", { ...profile, show: { day: false, expected: false } });
    expect(readStatus(status, "2026-09-30")).toMatchObject({ kind: "phase", cycleDay: null, daysToNext: null });
  });

  it("reads the sharer's date for a viewer a day behind, so a period just logged never shows as the day before", () => {
    const diary = diaryWithStarts([...STARTS, "2026-10-21"]);
    const status = buildStatus(diary, "2026-10-21", profile);
    expect(readStatus(status, "2026-10-20")).toMatchObject({ kind: "phase", phase: "menstrual", source: "observed" });
  });

  it("sends nothing but the state while paused or ended", () => {
    const paused = buildStatus(diaryWithStarts(STARTS), "2026-09-30", { ...profile, paused: true, note: { text: "hi", date: "2026-09-30" } });
    expect(paused).toMatchObject({ state: "paused", cycle: null, observed: null, note: null });
    expect(readStatus(paused, "2026-09-30")).toEqual({ kind: "paused" });
    const ended = endedStatus(SELF, "2026-09-30");
    expect(ended).toMatchObject({ state: "ended", name: "", cycle: null });
    expect(readStatus(ended, "2026-09-30")).toEqual({ kind: "ended" });
  });

  it("shows a note on the day it was written and the next", () => {
    const status = buildStatus(diaryWithStarts(STARTS), "2026-09-30", { ...profile, note: { text: " sore today ", date: "2026-09-30" } });
    expect(visibleNote(status, "2026-09-30")).toEqual({ text: "sore today", date: "2026-09-30" });
    expect(visibleNote(status, "2026-10-01")).not.toBeNull();
    expect(visibleNote(status, "2026-10-02")).toBeNull();
  });

  it("reads an old status as no recent update, before its box could expire", () => {
    const status = buildStatus(diaryWithStarts(STARTS), "2026-09-30", profile);
    expect(readStatus(status, "2026-12-15")).toEqual({ kind: "stale" });
    expect(STALE_AFTER_DAYS).toBeLessThan(BOX_TTL_DAYS.status);
  });
});

describe("parsing a friend's messages", () => {
  const status: StatusMessage = buildStatus(diaryWithStarts(STARTS), "2026-09-30", { ...profile, note: { text: "hi", date: "2026-09-30" } });

  it("keeps a well-formed status as it is", () => {
    expect(parseStatusMessage(JSON.parse(JSON.stringify(status)))).toEqual(status);
  });

  it("drops anything with the wrong shape", () => {
    const broken = [
      null,
      [],
      { ...status, t: "invite" },
      { ...status, state: "gone" },
      { ...status, selfId: "nope" },
      { ...status, name: "x".repeat(41) },
      { ...status, at: "2026-02-30" },
      { ...status, cycle: { start: "2026-09-23", next: "2026-09-20", bleed: 5 } },
      { ...status, cycle: { start: "2026-09-23", next: "2026-10-21", bleed: 99 } },
      { ...status, observed: { date: "2026-09-30", cycleDay: 0 } },
      { ...status, note: { text: "x".repeat(141), date: "2026-09-30" } },
    ];
    for (const value of broken) expect(parseStatusMessage(value)).toBeNull();
  });

  it("reads show switches as off unless they are exactly true", () => {
    expect(parseStatusMessage({ ...status, show: { day: "yes" } })?.show).toEqual({ day: false, expected: false });
  });

  it("checks invites and handshakes, which carry a public exchange key and never a secret", async () => {
    const { publicKey } = await newExchangeKeys();
    const invite = { t: "invite", v: 1, selfId: SELF, name: "Emma", at: "2026-09-30", pub: publicKey };
    expect(parseInviteMessage(invite)).toEqual(invite);
    expect(parseInviteMessage({ ...invite, selfId: 3 })).toBeNull();
    expect(parseInviteMessage({ ...invite, pub: undefined })).toBeNull();
    const handshake = { t: "handshake", v: 1, selfId: SELF, name: "Ana", at: "2026-09-30", pub: publicKey };
    expect(parseHandshakeMessage(handshake)).toEqual(handshake);
    expect(parseHandshakeMessage({ ...handshake, pub: "short" })).toBeNull();
    // The old shape with a joiner secret R is refused.
    expect(parseHandshakeMessage({ ...handshake, pub: undefined, r: "A".repeat(43) })).toBeNull();
  });

  it("always writes what it reads back, whatever the bleed length in the diary", () => {
    const days: Record<string, object> = {};
    // A 35-day bleed logged by mistake: the status clamps it rather than becoming unreadable.
    for (let offset = 0; offset < 35; offset += 1) days[addDaysIso("2026-09-23", offset)] = { flow: "light", symptoms: {} };
    const diary = diaryWithStarts(STARTS, days);
    for (let offset = 0; offset < 40; offset += 1) {
      const built = buildStatus(diary, addDaysIso("2026-09-23", offset), profile);
      expect(parseStatusMessage(JSON.parse(JSON.stringify(built)))).toEqual(built);
    }
  });
});
