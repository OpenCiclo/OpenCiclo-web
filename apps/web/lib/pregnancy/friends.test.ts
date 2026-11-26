// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// PLAN 4.8 "Lista de fugas": nothing a friend receives may give a private
// pregnancy away.

import { describe, expect, it } from "vitest";

import { addDaysIso, parseDiary, upsertDay, withPregnancies, type Diary } from "@/lib/diary";
import { sealBox } from "@/lib/friends/crypto";
import { BOX_CIPHERTEXT_LENGTH } from "@/lib/friends/limits";
import { buildStatus, parseStatusMessage, readStatus, type SharerProfile } from "@/lib/friends/payload";
import { friendsSource, shareablePregnancy, sharedPregnancy, simulatedCycle } from "@/lib/pregnancy/friends";
import type { PregnancyRecord } from "@/lib/pregnancy/record";

const STARTS = ["2026-01-05", "2026-02-02", "2026-03-02", "2026-03-30"];
const profile: SharerProfile = {
  selfId: "0123456789abcdef0123456789abcdef",
  name: "Emma",
  show: { day: true, expected: true },
  note: { text: "hola", date: "2026-05-10" },
  paused: false,
};

function diaryWithStarts(starts: string[]): Diary {
  const days = Object.fromEntries(starts.map((iso) => [iso, { flow: "medium", symptoms: {} }]));
  return parseDiary({ schemaVersion: 6, locale: "en", periodStarts: starts, days });
}

function pregnancy(overrides: Partial<PregnancyRecord> = {}): PregnancyRecord {
  return {
    id: "0123456789abcdef0123456789abcdef",
    dating: { method: "lmp", lmp: "2026-03-30", cycleLength: null },
    dueDate: "2027-01-04",
    end: null,
    hidden: false,
    friendsMode: "noNews",
    bleedAnswers: {},
    ...overrides,
  };
}

const days = (from: string, count: number) => Array.from({ length: count }, (_, i) => addDaysIso(from, i));

describe("friends never learn of a private pregnancy", () => {
  const before = diaryWithStarts(STARTS);

  it("'no news': the status is byte for byte the one of the same diary without the pregnancy", () => {
    let diary = withPregnancies(before, [pregnancy()]);
    diary = upsertDay(diary, "2026-05-20", { flow: "spotting", symptoms: {} });
    for (const today of days("2026-04-20", 90)) {
      expect(JSON.stringify(buildStatus(diary, today, profile)), today).toBe(
        JSON.stringify(buildStatus(withPregnancies(diary, []), today, profile)),
      );
    }
  });

  it("turning pregnancy mode on in 'no news' changes nothing a friend receives, so nothing is published", () => {
    const after = withPregnancies(before, [pregnancy()]);
    for (const today of days("2026-04-25", 40)) {
      expect(JSON.stringify(buildStatus(after, today, profile))).toBe(JSON.stringify(buildStatus(before, today, profile)));
    }
  });

  it("'simulated': her usual cycle goes on from her last real period, never 'logged today'", () => {
    let diary = withPregnancies(before, [pregnancy({ friendsMode: "simulated" })]);
    diary = upsertDay(diary, "2026-06-01", { flow: "light", symptoms: {} });
    const status = buildStatus(diary, "2026-06-01", profile);
    expect(status.observed).toBeNull();
    expect(status.cycle).toEqual({ start: "2026-05-25", next: "2026-06-22", bleed: expect.any(Number) });
    const view = readStatus(status, "2026-06-01");
    expect(view.kind).toBe("phase");
    expect(Object.keys(status).sort()).toEqual(Object.keys(buildStatus(before, "2026-06-01", profile)).sort());
  });

  it("keeps the note for friends as it was", () => {
    const diary = withPregnancies(before, [pregnancy({ friendsMode: "simulated" })]);
    expect(buildStatus(diary, "2026-05-10", profile).note).toEqual(profile.note);
    expect(buildStatus(withPregnancies(before, [pregnancy()]), "2026-05-10", profile).note).toEqual(profile.note);
  });

  it("every status still fits the same box size", async () => {
    const key = new Uint8Array(32);
    const statuses = [
      buildStatus(before, "2026-04-10", profile),
      buildStatus(withPregnancies(before, [pregnancy()]), "2026-06-10", profile),
      buildStatus(withPregnancies(before, [pregnancy({ friendsMode: "simulated" })]), "2026-06-10", profile),
    ];
    for (const status of statuses) {
      expect((await sealBox(key, status)).ciphertext.length).toBe(BOX_CIPHERTEXT_LENGTH);
    }
  });

  it("after the end, no status carries anything about it, whatever the mode, even one she had shared", () => {
    for (const friendsMode of ["noNews", "simulated"] as const) {
      const ended = withPregnancies(before, [pregnancy({ friendsMode, end: { date: "2026-05-15", outcome: "ended" } })]);
      for (const sharer of [profile, { ...profile, pregnancy: pregnancy().id }]) {
        for (const today of days("2026-05-15", 40)) {
          const text = JSON.stringify(buildStatus(ended, today, sharer));
          expect(text).not.toMatch(/pregnan|dueDate|due"|2027-01-04|outcome|ended"/i);
        }
      }
    }
  });

  it("rolls the simulated cycle forward and leaves 'simulated' once her period is back", () => {
    expect(simulatedCycle("2026-03-30", 28, "2026-03-30")).toEqual({ start: "2026-03-30", next: "2026-04-27" });
    expect(simulatedCycle("2026-03-30", 28, "2026-05-01")).toEqual({ start: "2026-04-27", next: "2026-05-25" });
    let diary = withPregnancies(before, [pregnancy({ friendsMode: "simulated", end: { date: "2026-05-15", outcome: "ended" } })]);
    expect(friendsSource(diary, "2026-06-01").kind).toBe("simulated");
    for (const iso of days("2026-06-20", 4)) diary = upsertDay(diary, iso, { flow: "medium", symptoms: {} });
    expect(friendsSource(diary, "2026-06-22").kind).toBe("diary");
  });
});

describe("a pregnancy she chose to share", () => {
  const before = diaryWithStarts(STARTS);
  const record = pregnancy();
  const sharing: SharerProfile = { ...profile, pregnancy: record.id };
  const diary = withPregnancies(before, [record]);

  it("sends the due date and nothing else about it, in place of a cycle", () => {
    const status = buildStatus(diary, "2026-06-10", sharing);
    expect(status.pregnancy).toEqual({ due: "2027-01-04" });
    expect(status.cycle).toBeNull();
    expect(status.observed).toBeNull();
    expect(Object.keys(status).sort()).toEqual(
      [...Object.keys(buildStatus(before, "2026-06-10", profile)), "pregnancy"].sort(),
    );
    // Nothing of the record but the date: no id, no dating method, no private mode.
    const text = JSON.stringify(status).replace(JSON.stringify(profile.selfId), "");
    expect(text).not.toMatch(/lmp|dating|noNews|simulated|bleedAnswers|hidden/);
    expect(text).not.toContain(record.id);
  });

  it("never sends bleeding logged during it", () => {
    const withBleed = upsertDay(diary, "2026-06-10", { flow: "light", symptoms: { nausea: "moderate" }, note: "private" });
    const text = JSON.stringify(buildStatus(withBleed, "2026-06-10", sharing));
    expect(text).not.toMatch(/nausea|private|light/);
    expect(buildStatus(withBleed, "2026-06-10", sharing).observed).toBeNull();
  });

  it("is off unless the friend book names this very pregnancy", () => {
    const privately = JSON.stringify(buildStatus(diary, "2026-06-10", profile));
    expect(JSON.stringify(buildStatus(diary, "2026-06-10", { ...profile, pregnancy: null }))).toBe(privately);
    expect(JSON.stringify(buildStatus(diary, "2026-06-10", { ...profile, pregnancy: "f".repeat(32) }))).toBe(privately);
    expect(privately).not.toMatch(/pregnan|2027-01-04/);
    // A later pregnancy is never shared because an earlier one was.
    const later = withPregnancies(before, [
      pregnancy({ end: { date: "2026-05-15", outcome: "ended" } }),
      pregnancy({ id: "1".repeat(32), dueDate: "2027-08-02", dating: { method: "dueDate", dueDate: "2027-08-02" } }),
    ]);
    expect(buildStatus(later, "2026-11-10", sharing).pregnancy).toBeUndefined();
  });

  it("stops the day it ends, and with a pause", () => {
    const ended = withPregnancies(before, [pregnancy({ end: { date: "2026-06-09", outcome: "ended" } })]);
    expect(buildStatus(ended, "2026-06-10", sharing).pregnancy).toBeUndefined();
    expect(sharedPregnancy(ended, record.id, "2026-06-10")).toBeNull();
    const paused = buildStatus(diary, "2026-06-10", { ...sharing, paused: true });
    expect(paused).toMatchObject({ state: "paused", cycle: null, observed: null, note: null });
    expect(paused.pregnancy).toBeUndefined();
  });

  it("stops at 42 weeks with no end logged, like her own card", () => {
    expect(shareablePregnancy(diary, "2027-01-17")?.id).toBe(record.id); // 41+6
    expect(shareablePregnancy(diary, "2027-01-18")).toBeNull(); // 42+0
    expect(buildStatus(diary, "2027-01-18", sharing).pregnancy).toBeUndefined();
  });

  it("a friend's device shows the week on its own date, counted like her card", () => {
    const status = buildStatus(diary, "2026-06-10", sharing);
    // 2026-03-30 is 0+0: 2026-06-10 is 10 weeks and 2 days.
    expect(readStatus(status, "2026-06-10")).toMatchObject({ kind: "pregnancy", weeks: 10, days: 2, trimester: 1 });
    // The same status read later, with no new one: the week moves on by itself.
    expect(readStatus(status, "2026-07-06")).toMatchObject({ kind: "pregnancy", weeks: 14, days: 0, trimester: 2 });
    // But not for ever: an old status reads as no recent update.
    expect(readStatus(status, "2026-08-01")).toEqual({ kind: "stale" });
    // And never past 42 weeks.
    const late = buildStatus(diary, "2027-01-10", sharing);
    expect(readStatus(late, "2027-01-17").kind).toBe("pregnancy");
    expect(readStatus(late, "2027-01-18")).toEqual({ kind: "noEstimate" });
  });

  it("survives the box, fits its size, and a build from before it reads no estimate", async () => {
    const status = buildStatus(diary, "2026-06-10", sharing);
    expect((await sealBox(new Uint8Array(32), status)).ciphertext.length).toBe(BOX_CIPHERTEXT_LENGTH);
    expect(parseStatusMessage(JSON.parse(JSON.stringify(status)))).toEqual(status);
    expect(parseStatusMessage({ ...status, pregnancy: { due: "soon" } })).toBeNull();
    expect(parseStatusMessage({ ...status, pregnancy: "2027-01-04" })).toBeNull();
    // Paused and ended statuses never carry one, whatever was sent.
    expect(parseStatusMessage({ ...status, state: "paused" })?.pregnancy).toBeUndefined();
    // An older build drops the field it does not know: what is left has no cycle.
    const { pregnancy: dropped, ...old } = status;
    expect(dropped).toBeDefined();
    expect(readStatus(old, "2026-06-10")).toEqual({ kind: "noEstimate" });
  });
});

describe("pregnancy symptoms never reach friends", () => {
  it("a baby movement or any Pregnancy entry leaves every status byte for byte the same", () => {
    const record = pregnancy();
    const sharing: SharerProfile = { ...profile, pregnancy: record.id };
    for (const mode of ["noNews", "simulated"] as const) {
      const diary = withPregnancies(diaryWithStarts(STARTS), [{ ...record, friendsMode: mode }]);
      let logged = diary;
      for (const iso of days("2026-07-25", 10)) {
        logged = upsertDay(logged, iso, { symptoms: { babyMovement: "present", heartburn: "present", braxtonHicks: "present" } });
      }
      for (const today of days("2026-07-25", 20)) {
        for (const who of [profile, sharing]) {
          expect(JSON.stringify(buildStatus(logged, today, who)), today).toBe(JSON.stringify(buildStatus(diary, today, who)));
        }
      }
    }
  });
});
