// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Springs for the tab bar selection as it moves to the tab tapped. Positions
// are in tab widths: 0 is the first tab, 1 the second, and so on.

/** Farthest the selection gives when a spring overshoots the first or last tab. */
const EDGE_LIMIT = 0.08;

/** Moves less and less the farther it is pulled, and never past `limit`. */
export function resist(distance: number, limit: number): number {
  return Math.sign(distance) * limit * (1 - Math.exp(-Math.abs(distance) / limit));
}

export type Spring = { value: number; velocity: number };

/**
 * One step of a damped spring pulling `spring` toward `target`. `ratio` below
 * 1 overshoots a little before settling.
 */
export function stepSpring(spring: Spring, target: number, dt: number, stiffness: number, ratio: number): void {
  const damping = 2 * ratio * Math.sqrt(stiffness);
  const acceleration = stiffness * (target - spring.value) - damping * spring.velocity;
  spring.velocity += acceleration * dt;
  spring.value += spring.velocity * dt;
}

/** Horizontal and vertical scale for a stretch from 0 (none) to 1 (most): longer along the bar, flatter across. */
export function stretchScale(stretch: number): { x: number; y: number } {
  const amount = Math.max(0, Math.min(1, stretch));
  return { x: 1 + 0.2 * amount, y: 1 - 0.1 * amount };
}

/** The label under the selection stretches a little more than the selection, like gum. */
export function labelScale(scale: { x: number; y: number }): { x: number; y: number } {
  return { x: 1 + 1.25 * (scale.x - 1), y: 1 + 0.5 * (scale.y - 1) };
}

const POSITION_STIFFNESS = 420;
const POSITION_RATIO = 0.65;
/** Speed, in tabs per second, adds this much stretch: the selection smears as it flies. */
const SPEED_STRETCH = 0.06;
const MAX_SPEED_STRETCH = 0.6;
const STEP = 1 / 240;
/** Longest frame the springs step through: after a slow frame they catch up instead of lagging behind. */
const MAX_FRAME = 0.05;

type Paint = (position: number, scale: { x: number; y: number }) => void;

/**
 * Moves the selection with a spring, one animation frame at a time, and hands
 * each frame to `paint`. With reduced motion it jumps instead and never
 * stretches.
 */
export class SelectionMotion {
  private position: Spring = { value: 0, velocity: 0 };
  private target = 0;
  private scale = { x: 1, y: 1 };
  private frame = 0;
  private last = 0;

  constructor(
    private readonly count: number,
    private readonly paint: Paint,
    private readonly reducedMotion: () => boolean,
  ) {}

  /** Puts the selection on tab `index` without animating. */
  place(index: number): void {
    this.stop();
    this.target = index;
    this.position = { value: index, velocity: 0 };
    this.scale = { x: 1, y: 1 };
    this.draw();
  }

  /** Springs the selection to tab `index`. */
  settle(index: number): void {
    if (this.reducedMotion()) {
      this.place(index);
      return;
    }
    this.target = index;
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
      stepSpring(this.position, this.target, elapsed / steps, POSITION_STIFFNESS, POSITION_RATIO);
    }
    const resting = Math.abs(this.position.value - this.target) < 0.0005 && Math.abs(this.position.velocity) < 0.005;
    if (resting) this.position = { value: this.target, velocity: 0 };
    this.scale = stretchScale(Math.min(MAX_SPEED_STRETCH, Math.abs(this.position.velocity) * SPEED_STRETCH));
    this.draw();
    this.frame = resting ? 0 : requestAnimationFrame(this.tick);
  };

  // A spring that overshoots the first or last tab gives way, so the
  // selection never leaves the bar.
  private draw(): void {
    const position = this.position.value;
    const scale = this.reducedMotion() ? { x: 1, y: 1 } : this.scale;
    const last = this.count - 1;
    if (position < 0) this.paint(resist(position, EDGE_LIMIT), scale);
    else if (position > last) this.paint(last + resist(position - last, EDGE_LIMIT), scale);
    else this.paint(position, scale);
  }
}
