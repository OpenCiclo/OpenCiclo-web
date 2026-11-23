// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// PLAN 4.8 "Lista de fugas": nothing a friend receives may give a private
// pregnancy away.

import { describe, expect, it } from "vitest";

import { addDaysIso, parseDiary, upsertDay, withPregnancies, type Diary } from "@/lib/diary";
import { sealBox } from "@/lib/friends/crypto";
import { BOX_CIPHERTEXT_LENGTH } from "@/lib/friends/limits";
import { buildStatus, readStatus, type SharerProfile } from "@/lib/friends/payload";
import { friendsSource, simulatedCycle } from "@/lib/pregnancy/friends";
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

  it("after the end, no status carries anything about it, whatever the mode", () => {
    for (const friendsMode of ["noNews", "simulated"] as const) {
      const ended = withPregnancies(before, [pregnancy({ friendsMode, end: { date: "2026-05-15", outcome: "ended" } })]);
      for (const today of days("2026-05-15", 40)) {
        const text = JSON.stringify(buildStatus(ended, today, profile));
        expect(text).not.toMatch(/pregnan|dueDate|outcome|ended"/i);
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
