// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { emptyDiary, parseDiary } from "@/lib/diary";
import {
  POOL_SYNC_INTERVAL_DAYS,
  daysSinceIso,
  poolCycleLengths,
  shouldSyncPool,
  syncPoolIfDue,
} from "@/lib/pool-sync";
import { todayIsoIn } from "@/lib/time-zone";

describe("pool sync", () => {
  it("requires at least one completed cycle", () => {
    expect(poolCycleLengths({ periodStarts: ["2026-06-01"], pregnancies: [] })).toEqual([]);
    expect(poolCycleLengths({ periodStarts: ["2026-06-01", "2026-06-29"], pregnancies: [] })).toEqual([28]);
  });

  it("never sends the interval that held a pregnancy", () => {
    const pregnancy = {
      id: "0123456789abcdef0123456789abcdef",
      dating: { method: "lmp" as const, lmp: "2026-01-29", cycleLength: null },
      dueDate: "2026-11-05",
      end: { date: "2026-03-20", outcome: "ended" as const },
      hidden: false,
      friendsMode: "noNews" as const,
      bleedAnswers: {},
    };
    const periodStarts = ["2026-01-01", "2026-01-29", "2026-05-02", "2026-05-31"];
    expect(poolCycleLengths({ periodStarts, pregnancies: [pregnancy] })).toEqual([28, 29]);
  });

  it("syncs when opted in and never synced before", () => {
    const diary = {
      ...emptyDiary("es"),
      poolOptIn: true,
      poolContributorKey: "550e8400-e29b-41d4-a716-446655440000",
      periodStarts: ["2026-06-01", "2026-06-29"],
    };
    expect(shouldSyncPool(diary)).toBe(true);
  });

  it("waits 30 days between syncs", () => {
    const diary = {
      ...emptyDiary("es"),
      poolOptIn: true,
      poolContributorKey: "550e8400-e29b-41d4-a716-446655440000",
      poolLastSyncedAt: "2026-08-01",
      periodStarts: ["2026-06-01", "2026-06-29"],
    };
    expect(shouldSyncPool(diary, new Date("2026-08-20T12:00:00Z"))).toBe(false);
    expect(shouldSyncPool(diary, new Date("2026-09-01T12:00:00Z"))).toBe(true);
    expect(daysSinceIso("2026-08-01", new Date("2026-09-01T12:00:00Z"))).toBeGreaterThanOrEqual(
      POOL_SYNC_INTERVAL_DAYS,
    );
  });

  it("migrates legacy contributedToPool into poolOptIn", () => {
    const diary = parseDiary({
      schemaVersion: 2,
      periodStarts: [],
      days: {},
      locale: "es",
      contributedToPool: true,
    });
    expect(diary.poolOptIn).toBe(true);
    expect(diary.poolContributorKey).toBeNull();
  });

  describe("syncPoolIfDue", () => {
    const due = {
      ...emptyDiary("es"),
      poolOptIn: true,
      poolContributorKey: "550e8400-e29b-41d4-a716-446655440000",
      periodStarts: ["2026-06-01", "2026-06-29"],
    };

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    });

    // 20:00 on 18 November in New York is already 19 November in UTC.
    const evening = new Date("2026-11-19T01:00:00Z");

    function savedZone(zone: string | null) {
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => (key === "ciclo.timeZone" ? zone : null),
      });
    }

    it("marks the diary as synced when the upload succeeds", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(evening);
      vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
      savedZone(null);
      const synced = await syncPoolIfDue(due);
      // Automatic: the device's date (the test zone), not the UTC one.
      expect(synced.poolLastSyncedAt).toBe(todayIsoIn(undefined, evening));
    });

    it("stamps the date in the zone saved in Settings", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(evening);
      vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
      savedZone("America/New_York");
      expect((await syncPoolIfDue(due)).poolLastSyncedAt).toBe("2026-11-18");
      savedZone("Asia/Tokyo");
      expect((await syncPoolIfDue(due)).poolLastSyncedAt).toBe("2026-11-19");
    });

    it("returns the diary unchanged when the upload fails, so saving is not blocked", async () => {
      vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
      await expect(syncPoolIfDue(due)).resolves.toBe(due);
    });

    it("returns the diary unchanged when the network is down", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        }),
      );
      await expect(syncPoolIfDue(due)).resolves.toBe(due);
    });
  });
});
