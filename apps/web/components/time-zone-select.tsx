// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useCiclo } from "@/lib/client/ciclo-context";
import {
  TIME_ZONE_AUTO,
  deviceTimeZone,
  listTimeZones,
  timeZoneOffsetLabel,
} from "@/lib/time-zone";

const noSubscription = () => () => {};

function zoneLabel(zone: string): string {
  return zone.replaceAll("_", " ");
}

export function TimeZoneSelect() {
  const { t, timeZone, setTimeZone } = useCiclo();
  // The server cannot know the device zone, so the list renders after hydration.
  const isClient = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

  const options = useMemo(() => {
    if (!isClient) return [];
    const now = new Date();
    const zones = listTimeZones();
    if (timeZone !== TIME_ZONE_AUTO && !zones.includes(timeZone)) zones.push(timeZone);
    return zones.map((zone) => {
      const offset = timeZoneOffsetLabel(zone, now);
      return { value: zone, label: offset ? `${zoneLabel(zone)} (${offset})` : zoneLabel(zone) };
    });
  }, [isClient, timeZone]);

  const device = isClient ? deviceTimeZone() : null;
  const autoLabel = device ? t.timeZoneAutoWith.replace("{zone}", zoneLabel(device)) : t.timeZoneAuto;

  return (
    <div>
      <label htmlFor="time-zone" className="text-sm font-semibold text-card-foreground">
        {t.timeZone}
      </label>
      <p id="time-zone-hint" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
        {t.timeZoneHint}
      </p>
      <select
        id="time-zone"
        aria-describedby="time-zone-hint"
        className="mt-2 flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base md:text-sm"
        value={isClient ? timeZone : TIME_ZONE_AUTO}
        onChange={(event) => setTimeZone(event.target.value)}
      >
        <option value={TIME_ZONE_AUTO}>{autoLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
