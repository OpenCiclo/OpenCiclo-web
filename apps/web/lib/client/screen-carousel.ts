// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Screens that follow the finger while the tab bar selection is dragged, like
// a carousel: halfway between two tabs, half of each screen shows. Only the
// screen on display exists, so the tab bar navigates to the next tab as soon
// as the drag heads that way, and the view transition that swaps the two
// screens (the `tab-slide` animations, see globals.css) is paused: its
// progress comes from the finger instead of the clock.

import { type Spring, stepSpring } from "@/lib/client/tab-drag";

/**
 * How far along a drag from tab `from` toward the tab on its `direction` side
 * the finger is, from 0 (still on `from`) to 1 (on the next tab). Linear: the
 * screens move exactly as far as the finger, no resistance.
 */
export function slideProgress(finger: number, from: number, direction: number): number {
  return Math.min(1, Math.max(0, (finger - from) * direction));
}

/**
 * Takes over the slides of the view transition that just started: pauses them
 * and returns them, or returns null if they cannot follow a finger yet (the
 * old screen left alone; the new one comes in a later transition).
 */
export function takeSlides(): Animation[] | null {
  const slides = document
    .getAnimations()
    .filter((animation) => animation instanceof CSSAnimation && animation.animationName.startsWith("tab-slide"));
  if (!slides.some((slide) => (slide as CSSAnimation).animationName.startsWith("tab-slide-in"))) return null;
  for (const slide of slides) slide.pause();
  return slides;
}

function length(slide: Animation): number {
  const duration = slide.effect?.getComputedTiming().duration;
  return typeof duration === "number" ? duration : 0;
}

/** Shows the slides `progress` of the way: 0 with the old screen in place, 1 with the new one. */
export function setSlides(slides: Animation[], progress: number): void {
  for (const slide of slides) slide.currentTime = progress * length(slide);
}

/** Ends the transition with the new screen in place. */
export function finishSlides(slides: Animation[]): void {
  for (const slide of slides) slide.finish();
}

/** Ends the transition with the old screen in place, where it started. */
export function rewindSlides(slides: Animation[]): void {
  for (const slide of slides) {
    slide.playbackRate = -1;
    slide.finish();
  }
}

/**
 * Stiffness of the spring that keeps the screens with the finger: critically
 * damped, it trails by about 20 ms, enough to smooth out uneven touch events
 * and to catch up gently when the next screen shows up late.
 */
const FOLLOW_STIFFNESS = 2400;
/** Softer, once the finger lifts: the screens carry on at its speed and slow down to a stop. */
const LAND_STIFFNESS = 260;
const STEP = 1 / 240;
const MAX_FRAME = 0.05;

/**
 * Slide progress (0 to 1, see `setSlides`) on a critically damped spring, one
 * animation frame at a time: it never bounces. `paint` gets each frame,
 * clamped to 0..1.
 */
export class SlideMotion {
  private spring: Spring = { value: 0, velocity: 0 };
  private target = 0;
  private stiffness = FOLLOW_STIFFNESS;
  private frame = 0;
  private last = 0;
  private landed: (() => void) | null = null;
  /** Which side of the target a landing started from. */
  private side = 0;

  constructor(private readonly paint: (progress: number) => void) {}

  get progress(): number {
    return Math.min(1, Math.max(0, this.spring.value));
  }

  /** Starts at `progress`, still. */
  place(progress: number): void {
    this.stop();
    this.spring = { value: progress, velocity: 0 };
    this.target = progress;
    this.landed = null;
    this.paint(this.progress);
  }

  /** Follows the finger to `progress`. */
  follow(progress: number): void {
    this.stiffness = FOLLOW_STIFFNESS;
    this.target = progress;
    this.landed = null;
    this.run();
  }

  /** The finger let go moving at `velocity` (progress per second): carry on to `progress`, then `done`. */
  land(progress: number, velocity: number, done: () => void): void {
    this.stiffness = LAND_STIFFNESS;
    this.target = progress;
    this.spring.velocity = velocity;
    this.side = Math.sign(this.spring.value - progress);
    this.landed = done;
    this.run();
  }

  stop(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private run(): void {
    if (this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    const elapsed = Math.min(MAX_FRAME, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const steps = Math.max(1, Math.round(elapsed / STEP));
    for (let step = 0; step < steps; step++) stepSpring(this.spring, this.target, elapsed / steps, this.stiffness, 1);
    // Landing, it stops on the screen instead of going past it.
    const arrived = this.landed !== null && Math.sign(this.spring.value - this.target) !== this.side;
    const resting =
      arrived || (Math.abs(this.spring.value - this.target) < 0.001 && Math.abs(this.spring.velocity) < 0.01);
    if (resting) this.spring = { value: this.target, velocity: 0 };
    this.frame = resting ? 0 : requestAnimationFrame(this.tick);
    this.paint(this.progress);
    if (resting && this.landed) {
      const done = this.landed;
      this.landed = null;
      done();
    }
  };
}
