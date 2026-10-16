// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import {
  TIME_ZONE_AUTO,
  listTimeZones,
  parseTimeZoneSetting,
  resolveTimeZone,
  timeZoneOffsetLabel,
  todayIsoIn,
} from "@/lib/time-zone";

describe("time zone", () => {
  it("keeps Mexico City on its own date after 18:00 local time", () => {
    // 2026-10-15T01:30Z is 19:30 on 14 October in Mexico City (UTC-6).
    const evening = new Date("2026-10-15T01:30:00Z");
    expect(todayIsoIn("UTC", evening)).toBe("2026-10-15");
    expect(todayIsoIn("America/Mexico_City", evening)).toBe("2026-10-14");
  });

  it("moves ahead of UTC east of Greenwich", () => {
    // 2026-10-14T20:00Z is 05:00 on 15 October in Tokyo (UTC+9).
    expect(todayIsoIn("Asia/Tokyo", new Date("2026-10-14T20:00:00Z"))).toBe("2026-10-15");
  });

  it("follows daylight saving time", () => {
    // Madrid is UTC+2 in summer and UTC+1 in winter.
    expect(todayIsoIn("Europe/Madrid", new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
    expect(todayIsoIn("Europe/Madrid", new Date("2026-01-01T22:30:00Z"))).toBe("2026-01-01");
  });

  it("defaults to auto and rejects unknown zones", () => {
    expect(parseTimeZoneSetting(null)).toBe(TIME_ZONE_AUTO);
    expect(parseTimeZoneSetting("auto")).toBe(TIME_ZONE_AUTO);
    expect(parseTimeZoneSetting("Mars/Olympus_Mons")).toBe(TIME_ZONE_AUTO);
    expect(parseTimeZoneSetting("America/Mexico_City")).toBe("America/Mexico_City");
  });

  it("resolves auto to the runtime zone", () => {
    expect(resolveTimeZone(TIME_ZONE_AUTO)).toBeUndefined();
    expect(resolveTimeZone("Europe/Madrid")).toBe("Europe/Madrid");
  });

  it("lists zones and labels their offset", () => {
    expect(listTimeZones()).toContain("America/Mexico_City");
    expect(timeZoneOffsetLabel("America/Mexico_City", new Date("2026-10-14T12:00:00Z"))).toBe(
      "GMT-06:00",
    );
  });
});
