// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

// vitest.config.mts pins the zone (America/New_York unless TZ or TEST_TZ says
// otherwise). If this fails, the date tests run in the machine's own zone and
// can no longer catch a day off by one west or east of UTC.
describe("test time zone", () => {
  it("runs the suite in the zone vitest.config.mts picked", () => {
    const expected = process.env.TEST_TZ || process.env.TZ || "America/New_York";
    // A POSIX ":/etc/localtime" value names a file, not a zone: nothing to compare with.
    if (expected.startsWith(":")) return;
    // Compare clocks, not names: ICU may report Asia/Kolkata as Asia/Calcutta.
    // An unknown name throws here (and vitest.config.mts refuses it first):
    // Node would quietly run such a zone as UTC.
    const options: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "long" };
    const local = new Intl.DateTimeFormat("en-US", options);
    const pinned = new Intl.DateTimeFormat("en-US", { ...options, timeZone: expected });
    expect(local.resolvedOptions().timeZone).not.toBe("Etc/Unknown");
    for (const instant of ["2026-01-15T03:30:00Z", "2026-07-15T03:30:00Z", "2026-11-18T23:59:00Z"]) {
      expect(local.format(new Date(instant)), instant).toBe(pinned.format(new Date(instant)));
    }
    if (expected === "America/New_York") {
      // West of UTC, with daylight saving time: where these bugs show.
      expect(new Date("2026-01-15T12:00:00Z").getTimezoneOffset()).toBe(300);
      expect(new Date("2026-07-15T12:00:00Z").getTimezoneOffset()).toBe(240);
    }
  });
});
