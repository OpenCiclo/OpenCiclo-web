// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

import { useLatest } from "@/lib/client/hooks";
import { resist } from "@/lib/client/tab-drag";
import { VelocityTracker, sheetDragIntent, sheetShouldClose } from "@/lib/client/swipe";

/** A drag can end in a click on the button it started on; that is not a tap. */
const CLICK_AFTER_DRAG_MS = 500;
/** Farthest the sheet gives, in px, when pulled up. */
const PULL_UP_LIMIT = 16;
const SETTLE = "translate 0.35s cubic-bezier(0.22, 1, 0.36, 1)";

type Press = {
  pointerId: number;
  x: number;
  y: number;
  dragging: boolean;
  /** Vertical travel, in px, when the drag took hold: the sheet moves from there. */
  slop: number;
  /** Where the sheet was when the drag took hold (it may have been settling). */
  from: number;
  /**
   * How far down the finger has taken the sheet, in px, slop included: whether
   * it closes goes by this (a quick flick can arrive in a single move).
   */
  travel: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The sheet's current drag offset in px, mid-settle included. */
function currentOffset(sheet: HTMLElement): number {
  const [, y] = getComputedStyle(sheet).translate.split(" ");
  return y ? Number.parseFloat(y) || 0 : 0;
}

/**
 * Drags a bottom sheet down by its top (the handle and the title row) to close
 * it (touch only). The sheet follows the finger; past a distance or on a
 * flick `onDismiss` runs, otherwise it settles back. The sheet moves with the
 * `translate` property, so its open and close animations (on `transform`)
 * still apply: a dismissed sheet closes from where the finger left it.
 *
 * - `sheetRef`: the sheet that moves.
 * - `handleProps`: the area that takes the gesture. It needs
 *   `touch-action: none`. The content below keeps scrolling on its own.
 * - `onDismiss` closes the sheet and returns true, or returns false when it
 *   cannot close now (saving): the sheet settles back.
 */
export function useSheetDrag({ enabled, onDismiss }: { enabled: boolean; onDismiss: () => boolean }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<Press | null>(null);
  const trackerRef = useRef(new VelocityTracker());
  const swallowClicksUntilRef = useRef(0);
  const onDismissRef = useLatest(onDismiss);

  function settle(sheet: HTMLElement) {
    if (prefersReducedMotion()) {
      sheet.style.transition = "";
      sheet.style.translate = "";
      return;
    }
    sheet.style.transition = SETTLE;
    sheet.style.translate = "0px 0px";
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!enabled || !event.isPrimary || event.pointerType === "mouse" || event.button !== 0) return;
    pressRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      slop: 0,
      from: 0,
      travel: 0,
    };
    trackerRef.current.reset(event.timeStamp, 0);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const press = pressRef.current;
    const sheet = sheetRef.current;
    if (!press || !sheet || event.pointerId !== press.pointerId) return;
    const dy = event.clientY - press.y;
    trackerRef.current.add(event.timeStamp, dy);
    if (!press.dragging) {
      const intent = sheetDragIntent(event.clientX - press.x, dy);
      if (intent === "pending") return;
      if (intent === "other") {
        pressRef.current = null;
        return;
      }
      press.dragging = true;
      press.slop = dy;
      press.from = currentOffset(sheet);
      sheet.style.transition = "none";
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    press.travel = press.from + dy;
    // The sheet starts from where the drag took hold, so it does not jump.
    const moved = press.from + dy - press.slop;
    const offset = moved >= 0 ? moved : resist(moved, PULL_UP_LIMIT);
    sheet.style.translate = `0px ${offset}px`;
  }

  function endPress(event: PointerEvent<HTMLElement>, cancelled: boolean) {
    const press = pressRef.current;
    const sheet = sheetRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (!press.dragging || !sheet) return;
    swallowClicksUntilRef.current = event.timeStamp + CLICK_AFTER_DRAG_MS;
    if (!cancelled) {
      const dy = event.clientY - press.y;
      press.travel = press.from + dy;
      trackerRef.current.add(event.timeStamp, dy);
    }
    const velocity = trackerRef.current.velocity(event.timeStamp);
    // Closing leaves the sheet where it is: the close animation takes it down from there.
    if (!cancelled && sheetShouldClose(press.travel, velocity, sheet.offsetHeight) && onDismissRef.current()) return;
    settle(sheet);
  }

  function onClickCapture(event: MouseEvent<HTMLElement>) {
    if (event.timeStamp > swallowClicksUntilRef.current) return;
    swallowClicksUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  }

  return {
    sheetRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => endPress(event, false),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => endPress(event, true),
      onClickCapture,
    },
  };
}
