// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useSyncExternalStore } from "react";

import { TIME_ZONE_KEY } from "@/lib/client/storage-migrate";
import { parseTimeZoneSetting, resolveTimeZone, todayIsoIn } from "@/lib/time-zone";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Fire a moment after midnight, never just before it.
const WAKE_MARGIN_MS = 50;

/**
 * How long to wait before checking the date again on a clock in `timeZone`
 * (device zone when undefined): the time left until that clock reads
 * midnight, at most an hour. The cap keeps it right on days with a daylight
 * saving change (23 or 25 hours long, or with no 00:00 at all): the clock is
 * read again at least hourly, so the last wait uses the offset in force.
 */
export function msUntilNextDayCheck(timeZone: string | undefined, now = new Date()): number {
  // A new formatter each time: with no zone it follows the device, which can
  // change while the app is open (a trip).
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0);
  // `% 24`: some engines print midnight as 24:00.
  const elapsed =
    (((part("hour") % 24) * 60 + part("minute")) * 60 + part("second")) * 1000 +
    now.getUTCMilliseconds();
  return Math.min(Math.max(DAY_MS - elapsed, 0), HOUR_MS) + WAKE_MARGIN_MS;
}

/**
 * Calls `onChange` whenever the date may have changed: at midnight in
 * `timeZone`, and when the page comes back into view (timers sleep with the
 * phone, and the Android app resumes from the background without reloading).
 * Returns the unsubscribe function.
 */
export function subscribeToDayChange(
  timeZone: string | undefined,
  onChange: () => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, msUntilNextDayCheck(timeZone));
  };
  const onWake = () => {
    if (document.visibilityState !== "visible") return;
    onChange();
    schedule();
  };
  schedule();
  document.addEventListener("visibilitychange", onWake);
  window.addEventListener("pageshow", onWake);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onWake);
    window.removeEventListener("pageshow", onWake);
  };
}

/**
 * Today's YYYY-MM-DD in the zone saved in Settings, for code outside React
 * (the research pool's "last shared" date). Same day as `useTodayIso()`. The
 * device zone when nothing is saved or storage cannot be read.
 */
export function todayInSavedZone(now = new Date()): string {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(TIME_ZONE_KEY);
  } catch {
    // No storage (private mode, tests): fall back to the device zone.
  }
  return todayIsoIn(resolveTimeZone(parseTimeZoneSetting(saved)), now);
}

/**
 * Today's YYYY-MM-DD on a clock in `timeZone` (device zone when undefined).
 * Moves on by itself at midnight and when the page is shown again, so a
 * screen left open overnight, or resumed the next day, does not keep
 * yesterday as today.
 */
export function useTodayIn(timeZone: string | undefined): string {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToDayChange(timeZone, onChange),
    [timeZone],
  );
  const read = () => todayIsoIn(timeZone);
  return useSyncExternalStore(subscribe, read, read);
}
