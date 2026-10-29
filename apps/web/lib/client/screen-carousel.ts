// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The spring that moves the strip of screens while the tab bar selection is
// dragged (see FloatingTabBar and TabGhosts).

import { type Spring, stepSpring } from "@/lib/client/tab-drag";

/**
 * Stiffness of the spring that keeps the screens with the finger: critically
 * damped, it trails by about 20 ms, enough to smooth out uneven touch events.
 */
const FOLLOW_STIFFNESS = 2400;
/**
 * Softer when the screens are far from the finger, as when a drag starts on
 * another tab and they have a screen or two to cover: they get there with the
 * selection, instead of snapping across.
 */
const CATCH_UP_STIFFNESS = 420;
/** Distances, in screens, over which following turns into catching up. */
const CATCH_UP_FROM = 0.15;
const CATCH_UP_FULL = 0.6;
/** Softer, once the finger lifts: the screens carry on at its speed and slow down to a stop. */
const LAND_STIFFNESS = 340;

/** Stiffness for screens `distance` screens away from the finger (see CATCH_UP_STIFFNESS). */
export function followStiffness(distance: number): number {
  const far = Math.min(1, Math.max(0, (distance - CATCH_UP_FROM) / (CATCH_UP_FULL - CATCH_UP_FROM)));
  return FOLLOW_STIFFNESS + (CATCH_UP_STIFFNESS - FOLLOW_STIFFNESS) * far;
}
const STEP = 1 / 240;
const MAX_FRAME = 0.05;

/**
 * A position along the tabs on a critically damped spring, one animation
 * frame at a time: it never bounces. `paint` gets each frame, clamped to
 * 0..`max`.
 */
export class SlideMotion {
  private spring: Spring = { value: 0, velocity: 0 };
  private target = 0;
  private frame = 0;
  private last = 0;
  private landed: (() => void) | null = null;
  /** Which side of the target a landing started from. */
  private side = 0;

  constructor(
    private readonly paint: (progress: number) => void,
    private readonly max = 1,
  ) {}

  get progress(): number {
    return Math.min(this.max, Math.max(0, this.spring.value));
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
    this.target = progress;
    this.landed = null;
    this.run();
  }

  /** The finger let go moving at `velocity` (progress per second): carry on to `progress`, then `done`. */
  land(progress: number, velocity: number, done: () => void): void {
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
    for (let step = 0; step < steps; step++) {
      const stiffness = this.landed ? LAND_STIFFNESS : followStiffness(Math.abs(this.target - this.spring.value));
      stepSpring(this.spring, this.target, elapsed / steps, stiffness, 1);
    }
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
