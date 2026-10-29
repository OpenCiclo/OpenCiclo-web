// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Suspense, useLayoutEffect, useRef } from "react";

import { useIsDesktop } from "@/lib/client/desktop";
import { CalendarScreen } from "@/components/calendar/calendar-screen";
import { PatternsContent } from "@/components/patterns/patterns-content";

/** Pixels from the top of the window to the calendar when it sticks: the desktop header (4rem) and a gap. */
const STICK_TOP = 96;
/** Pixels left under a calendar too tall for the window when it sticks by its end. */
const STICK_BOTTOM = 24;

/**
 * The Calendar and Patterns tabs. A phone shows one of them, `tab`; the
 * desktop shows both side by side on either route: the calendar, and
 * Patterns beside it. Each keeps its slot, so a window crossing into or out
 * of the desktop layout keeps the screen it had (an open day stays open).
 */
export function CycleDashboard({ tab }: { tab: "calendar" | "patterns" }) {
  const desktop = useIsDesktop();
  const calendarRef = useRef<HTMLDivElement>(null);

  // Patterns runs longer than the calendar. While it scrolls the calendar
  // stays in view: under the header when it fits in the window, or else it
  // scrolls until its end shows and sticks there.
  useLayoutEffect(() => {
    const column = calendarRef.current;
    if (!desktop || !column) return;
    const place = () => {
      column.style.top = `${Math.min(STICK_TOP, window.innerHeight - column.offsetHeight - STICK_BOTTOM)}px`;
    };
    const observer = new ResizeObserver(place);
    observer.observe(column);
    window.addEventListener("resize", place);
    place();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      column.style.top = "";
    };
  }, [desktop]);

  return (
    <div className="desktop:grid desktop:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] desktop:items-start desktop:gap-10">
      {tab === "calendar" || desktop ? (
        <div ref={calendarRef} className="desktop:sticky">
          <Suspense fallback={<p className="text-sm text-muted-foreground">…</p>}>
            <CalendarScreen />
          </Suspense>
        </div>
      ) : null}
      {tab === "patterns" || desktop ? <PatternsContent /> : null}
    </div>
  );
}
