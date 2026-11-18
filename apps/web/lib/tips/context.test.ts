// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { parseDiary } from "@/lib/diary";
import { patternStats } from "@/lib/patterns/stats";
import { buildTipContext } from "@/lib/tips/context";

const diary = parseDiary({
  schemaVersion: 6,
  locale: "en",
  periodStarts: ["2026-05-01", "2026-05-29", "2026-06-26"],
  days: {},
});

describe("tip context", () => {
  it("counts the days to the next period from the day it is given", () => {
    // Patterns used to leave `today` out, so the tips counted from the UTC date:
    // one day off every evening west of UTC.
    const evening = buildTipContext(diary, "2026-07-10");
    const nextDay = buildTipContext(diary, "2026-07-11");
    expect(evening.nextPeriodInDays).toBe(patternStats(diary, "2026-07-10").nextPeriodInDays);
    expect(nextDay.nextPeriodInDays).toBe((evening.nextPeriodInDays ?? 0) - 1);
  });
});
