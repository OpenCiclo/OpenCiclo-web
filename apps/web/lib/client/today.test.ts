// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { msUntilNextDayCheck, subscribeToDayChange } from "@/lib/client/today";
import { todayIsoIn } from "@/lib/time-zone";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** The first instant after `from` whose date in `timeZone` differs, to the millisecond. */
function nextDayChange(timeZone: string, from: number): number {
  const start = todayIsoIn(timeZone, new Date(from));
  let low = from;
  let high = from + 30 * HOUR;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (todayIsoIn(timeZone, new Date(mid)) === start) low = mid;
    else high = mid;
  }
  return high;
}

type FakeDocument = EventTarget & { visibilityState: DocumentVisibilityState };

let fakeDocument: FakeDocument;

beforeEach(() => {
  vi.useFakeTimers();
  fakeDocument = Object.assign(new EventTarget(), { visibilityState: "visible" as DocumentVisibilityState });
  vi.stubGlobal("document", fakeDocument);
  vi.stubGlobal("window", new EventTarget());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("msUntilNextDayCheck", () => {
  it("waits until midnight on the chosen clock", () => {
    // 23:30 in New York (EST) is 04:30 UTC the next day.
    const wait = msUntilNextDayCheck("America/New_York", new Date("2026-11-19T04:30:00Z"));
    expect(wait).toBeGreaterThanOrEqual(30 * MINUTE);
    expect(wait).toBeLessThan(30 * MINUTE + 1000);
  });

  it("checks again at least every hour", () => {
    expect(msUntilNextDayCheck("America/New_York", new Date("2026-11-18T17:00:00Z"))).toBeLessThan(
      HOUR + 1000,
    );
  });
});

describe("subscribeToDayChange", () => {
  const cases: [string, string][] = [
    ["America/New_York", "2026-11-18T15:00:00Z"],
    // Spring forward: 8 March 2026 has 23 hours in New York.
    ["America/New_York", "2026-03-07T20:00:00Z"],
    ["America/New_York", "2026-03-08T12:00:00Z"],
    // Fall back: 1 November 2026 has 25 hours.
    ["America/New_York", "2026-11-01T12:00:00Z"],
    ["America/Mexico_City", "2026-11-18T20:00:00Z"],
    ["Pacific/Kiritimati", "2026-11-18T03:00:00Z"],
    ["Pacific/Pago_Pago", "2026-11-18T03:00:00Z"],
    ["Asia/Kolkata", "2026-11-18T03:00:00Z"],
    // Chile moves its clocks at midnight: some days have no 00:00.
    ["America/Santiago", "2026-09-05T15:00:00Z"],
    ["America/Santiago", "2026-04-04T15:00:00Z"],
    // Half-hour daylight saving change.
    ["Australia/Lord_Howe", "2026-10-03T03:00:00Z"],
    ["UTC", "2026-11-18T03:00:00Z"],
  ];

  it.each(cases)("tells %s about the new day within a second of midnight (from %s)", (timeZone, start) => {
    vi.setSystemTime(new Date(start));
    const first = todayIsoIn(timeZone);
    const changeAt = nextDayChange(timeZone, Date.now());
    const seen: { at: number; today: string }[] = [];
    const unsubscribe = subscribeToDayChange(timeZone, () => {
      seen.push({ at: Date.now(), today: todayIsoIn(timeZone) });
    });
    vi.advanceTimersByTime(30 * HOUR);
    unsubscribe();

    const firstNewDay = seen.find((item) => item.today !== first);
    expect(firstNewDay).toBeDefined();
    expect(firstNewDay!.at - changeAt).toBeGreaterThanOrEqual(0);
    expect(firstNewDay!.at - changeAt).toBeLessThan(1000);
    // Checks stay sparse: about one an hour.
    expect(seen.length).toBeLessThanOrEqual(34);
  });

  it("checks the date when the page comes back into view", () => {
    vi.setSystemTime(new Date("2026-11-18T15:00:00Z"));
    const onChange = vi.fn();
    const unsubscribe = subscribeToDayChange("America/New_York", onChange);

    fakeDocument.visibilityState = "hidden";
    fakeDocument.dispatchEvent(new Event("visibilitychange"));
    expect(onChange).not.toHaveBeenCalled();

    // The phone slept through the night: timers did not run.
    vi.setSystemTime(new Date("2026-11-19T15:00:00Z"));
    fakeDocument.visibilityState = "visible";
    fakeDocument.dispatchEvent(new Event("visibilitychange"));
    expect(onChange).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event("pageshow"));
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("stops after unsubscribing", () => {
    vi.setSystemTime(new Date("2026-11-18T15:00:00Z"));
    const onChange = vi.fn();
    const unsubscribe = subscribeToDayChange("America/New_York", onChange);
    unsubscribe();
    vi.advanceTimersByTime(48 * HOUR);
    fakeDocument.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pageshow"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
