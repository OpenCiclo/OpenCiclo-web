// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Touch swipes on screen content: the calendar card turns the month, and a
// bottom sheet closes when dragged down by its handle. Thresholds and
// decisions only, no DOM, so they can be tested. The tab bar has its own
// (lib/client/tab-drag.ts).

/** Finger travel, in px, before a press counts as a swipe one way or the other. */
export const SWIPE_SLOP = 10;

/**
 * "pending": the finger has not moved far enough to tell. "swipe": the
 * gesture is ours. "other": it is not (a scroll, say); leave it alone until
 * the finger lifts.
 */
export type SwipeIntent = "pending" | "swipe" | "other";

/** Sideways travel must beat vertical travel by this much to turn the month. */
const SIDEWAYS_RATIO = 1.5;

/**
 * A press on the calendar card that moved (dx, dy) px. Anything but a clearly
 * sideways move is left to the page, so a vertical or slanted drag scrolls.
 */
export function monthSwipeIntent(dx: number, dy: number): SwipeIntent {
  const across = Math.abs(dx);
  const down = Math.abs(dy);
  if (Math.max(across, down) <= SWIPE_SLOP) return "pending";
  return across > SIDEWAYS_RATIO * down ? "swipe" : "other";
}

/** A press on a sheet's handle that moved (dx, dy) px: up or down is a drag of the sheet. */
export function sheetDragIntent(dx: number, dy: number): SwipeIntent {
  const across = Math.abs(dx);
  const down = Math.abs(dy);
  if (Math.max(across, down) <= SWIPE_SLOP) return "pending";
  return down >= across ? "swipe" : "other";
}

/** Travel, in calendar widths, that turns the month on release. */
export const MONTH_TURN_AT = 0.3;
/** A flick this fast, in widths per second, turns it after less travel... */
const MONTH_FLICK_SPEED = 1.2;
/** ...but not less than this, so a short jab does nothing. */
const MONTH_FLICK_MIN = 0.1;
/** Moving back at this speed when the finger lifts keeps the month. */
const MONTH_BACK_SPEED = 0.5;

/**
 * The month a swipe lands on when the finger lifts: -1 the previous month, 1
 * the next, 0 this one. `travel` and `velocity` are in calendar widths
 * (and widths per second); positive means the finger moved right, which
 * brings in the previous month from the left.
 */
export function monthSwipeStep(travel: number, velocity: number): -1 | 0 | 1 {
  if (travel === 0) return 0;
  const step = travel > 0 ? -1 : 1;
  const distance = Math.abs(travel);
  const speed = velocity * Math.sign(travel);
  if (speed <= -MONTH_BACK_SPEED) return 0;
  if (distance >= MONTH_TURN_AT) return step;
  if (distance >= MONTH_FLICK_MIN && speed >= MONTH_FLICK_SPEED) return step;
  return 0;
}

/** Share of the sheet's height it must be dragged down to close... */
const SHEET_CLOSE_AT = 0.3;
/** ...though never more than this many px, on a tall sheet. */
const SHEET_CLOSE_MAX = 140;
/** A flick down this fast, in px per second, closes it after less travel... */
const SHEET_FLICK_SPEED = 700;
/** ...but not less than this. */
const SHEET_FLICK_MIN = 24;
/** Moving back up at this speed when the finger lifts keeps it open. */
const SHEET_BACK_SPEED = 300;

/**
 * Whether a sheet dragged down `travel` px, moving at `velocity` px per second
 * (positive is down) when the finger lifts, closes. `height` is the sheet's.
 */
export function sheetShouldClose(travel: number, velocity: number, height: number): boolean {
  if (travel <= 0 || velocity <= -SHEET_BACK_SPEED) return false;
  if (travel >= Math.min(SHEET_CLOSE_MAX, height * SHEET_CLOSE_AT)) return true;
  return travel >= SHEET_FLICK_MIN && velocity >= SHEET_FLICK_SPEED;
}

/** How far back, in ms, the speed of a finger is measured. */
const VELOCITY_WINDOW_MS = 100;

/**
 * The speed of a finger along one axis over its last moves, in units per
 * second. A finger that rested before lifting has no speed.
 */
export class VelocityTracker {
  private samples: { time: number; value: number }[] = [];

  /** Starts over at `value`, at `time` (ms). */
  reset(time: number, value: number): void {
    this.samples = [{ time, value }];
  }

  add(time: number, value: number): void {
    this.samples.push({ time, value });
    const since = time - VELOCITY_WINDOW_MS;
    while (this.samples.length > 2 && this.samples[1].time <= since) this.samples.shift();
  }

  /** Units per second over the moves in the window that ends at `now` (ms). */
  velocity(now: number): number {
    const recent = this.samples.filter((sample) => sample.time >= now - VELOCITY_WINDOW_MS);
    if (recent.length < 2) return 0;
    const first = recent[0];
    const last = recent[recent.length - 1];
    const seconds = (last.time - first.time) / 1000;
    return seconds > 0 ? (last.value - first.value) / seconds : 0;
  }
}
