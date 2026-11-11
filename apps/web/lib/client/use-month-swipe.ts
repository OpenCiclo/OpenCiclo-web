// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { flushSync } from "react-dom";

import { useLatest } from "@/lib/client/hooks";
import { SlideMotion } from "@/lib/client/screen-carousel";
import { VelocityTracker, monthSwipeIntent, monthSwipeStep } from "@/lib/client/swipe";

/** A swipe can end in a click on the day it started on; that is not a tap. */
const CLICK_AFTER_SWIPE_MS = 500;
/** Fastest the months carry on after the finger lifts, in months per second. */
const MAX_LAND_SPEED = 8;
/** The day buttons' focus ring and pop reach this far past the grid, in px. */
const RING_ROOM = 8;

type Press = {
  pointerId: number;
  x: number;
  y: number;
  swiping: boolean;
  /** The card's width, in px. Travel is measured in it. */
  width: number;
  /** Sideways travel, in px, when the swipe took hold: the months move from there. */
  slop: number;
  /**
   * The finger's travel since it came down, in widths, positive to the right.
   * The month it lands on goes by this, slop included: a quick flick can
   * arrive in a single move.
   */
  travel: number;
};

type Geometry = { width: number; current: number; prev: number; next: number };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Turns the calendar's month with a sideways swipe on its card (touch only).
 * While the finger is down the months beside this one are drawn (`open`) in a
 * strip that follows it; on release the strip lands on a month and `onTurn`
 * moves the calendar there, in the same frame the strip goes back to rest.
 *
 * - `zoneRef` + `zoneProps`: the card that takes the gesture. It needs
 *   `touch-action: pan-y` so the page still scrolls vertically.
 * - `viewportRef`: clips the strip to the card while it moves, and eases its
 *   height between months with a different number of weeks.
 * - `stripRef`: holds the month grids, `data-month-panel` "prev", "current",
 *   "next"; the neighbours sit one width to each side.
 */
export function useMonthSwipe({
  enabled,
  onTurn,
}: {
  enabled: boolean;
  onTurn: (step: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(false);
  const zoneRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<Press | null>(null);
  const geometryRef = useRef<Geometry | null>(null);
  const motionRef = useRef<SlideMotion | null>(null);
  /** Where the strip is landing (0 previous, 1 this month, 2 next), or null. */
  const landingRef = useRef<number | null>(null);
  const trackerRef = useRef(new VelocityTracker());
  const swallowClicksUntilRef = useRef(0);
  const onTurnRef = useLatest(onTurn);

  function paint(progress: number) {
    const strip = stripRef.current;
    const viewport = viewportRef.current;
    const geometry = geometryRef.current;
    if (!strip || !viewport || !geometry) return;
    const shift = progress - 1;
    strip.style.transform = `translate3d(${-shift * geometry.width}px, 0, 0)`;
    const toward = shift > 0 ? geometry.next : geometry.prev;
    viewport.style.height =
      toward === geometry.current ? "" : `${geometry.current + (toward - geometry.current) * Math.abs(shift)}px`;
  }

  function motion(): SlideMotion {
    motionRef.current ??= new SlideMotion(paint, 2);
    return motionRef.current;
  }

  /** Puts everything back at rest, on month `step` (0 stays). */
  function finish(step: number) {
    motionRef.current?.stop();
    landingRef.current = null;
    geometryRef.current = null;
    // One commit moves the calendar to the new month and takes the
    // neighbours away; the panel that was beside it becomes the current one
    // (same key, same element). The styles reset before the frame is drawn.
    flushSync(() => {
      if (step === 1 || step === -1) onTurnRef.current(step);
      setOpen(false);
    });
    const strip = stripRef.current;
    const viewport = viewportRef.current;
    if (strip) {
      strip.style.transform = "";
      strip.style.willChange = "";
    }
    if (viewport) {
      viewport.style.height = "";
      viewport.style.clipPath = "";
    }
    if (zoneRef.current) delete zoneRef.current.dataset.monthSwiping;
  }

  useEffect(() => () => motionRef.current?.stop(), []);

  function begin(press: Press, event: PointerEvent<HTMLElement>) {
    press.swiping = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.monthSwiping = "";
    if (prefersReducedMotion()) return;
    flushSync(() => setOpen(true));
    const strip = stripRef.current;
    const viewport = viewportRef.current;
    if (!strip || !viewport) return;
    const height = (role: string) =>
      strip.querySelector<HTMLElement>(`[data-month-panel="${role}"]`)?.offsetHeight ?? 0;
    const current = height("current");
    geometryRef.current = {
      width: viewport.clientWidth,
      current,
      prev: height("prev") || current,
      next: height("next") || current,
    };
    viewport.style.clipPath = `inset(-${RING_ROOM}px 0)`;
    strip.style.willChange = "transform";
    motion().place(1);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!enabled || !event.isPrimary || event.pointerType === "mouse" || event.button !== 0) return;
    // Caught while the months were still landing: land them now, and this
    // press starts from the month they were heading to. If it is only a tap,
    // the day under it moved: it opens nothing.
    if (landingRef.current !== null) {
      finish(landingRef.current - 1);
      swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_SWIPE_MS;
    }
    pressRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      swiping: false,
      width: Math.max(1, event.currentTarget.clientWidth),
      slop: 0,
      travel: 0,
    };
    trackerRef.current.reset(event.timeStamp, 0);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    const dx = event.clientX - press.x;
    press.travel = dx / press.width;
    trackerRef.current.add(event.timeStamp, press.travel);
    if (!press.swiping) {
      const intent = monthSwipeIntent(dx, event.clientY - press.y);
      if (intent === "pending") return;
      if (intent === "other") {
        pressRef.current = null;
        return;
      }
      press.slop = dx;
      begin(press, event);
    }
    // The strip starts from where the swipe took hold, so it does not jump;
    // it trails the finger by those few px.
    if (geometryRef.current) motion().follow(1 - (dx - press.slop) / geometryRef.current.width);
  }

  function endPress(event: PointerEvent<HTMLElement>, cancelled: boolean) {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.swiping) return;
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_SWIPE_MS;
    if (!cancelled) {
      press.travel = (event.clientX - press.x) / press.width;
      trackerRef.current.add(event.timeStamp, press.travel);
    }
    const velocity = trackerRef.current.velocity(event.timeStamp);
    const step = cancelled ? 0 : monthSwipeStep(press.travel, velocity);
    if (!geometryRef.current) {
      // Reduced motion: no strip, the month just changes.
      delete event.currentTarget.dataset.monthSwiping;
      if (step !== 0) onTurnRef.current(step);
      return;
    }
    const target = 1 + step;
    const speed = Math.max(-MAX_LAND_SPEED, Math.min(MAX_LAND_SPEED, -velocity));
    landingRef.current = target;
    motion().land(target, cancelled ? 0 : speed, () => finish(step));
  }

  function onClickCapture(event: MouseEvent<HTMLElement>) {
    if (event.timeStamp > swallowClicksUntilRef.current) return;
    swallowClicksUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    open,
    zoneRef,
    viewportRef,
    stripRef,
    zoneProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => endPress(event, false),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => endPress(event, true),
      onClickCapture,
    },
  };
}
