// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Physics for dragging the tab bar selection. Positions are in tab widths:
// 0 is the first tab, 1 the second, and so on.

/** Finger travel past the held tab, in tab widths, that moves the selection to the next tab. */
export const SWITCH_AT = 0.55;
/** Farthest the selection follows the finger before it switches (it never quite gets there). */
const PULL_LIMIT = 0.32;
/** Farthest the selection gives when pushed past the first or last tab. */
const EDGE_LIMIT = 0.08;

/** Moves less and less the farther it is pulled, and never past `limit`. */
export function resist(distance: number, limit: number): number {
  return Math.sign(distance) * limit * (1 - Math.exp(-Math.abs(distance) / limit));
}

export type DragFrame = {
  /** Tab the selection snaps to: where it lands if the finger lifts now. */
  held: number;
  /** Where the selection sits, in tabs, before springs smooth it out. */
  position: number;
  /** Positive stretches the selection along the bar, negative squashes it. From -1 to 1. */
  stretch: number;
};

/**
 * The selection under a finger that started on tab `start` and has moved
 * `travel` tab widths. `held` is the tab from the previous frame: switching
 * back needs the finger to come back past the same threshold, so the
 * selection does not flicker between two tabs.
 */
export function dragFrame(start: number, travel: number, held: number, count: number): DragFrame {
  let next = held;
  for (;;) {
    const offset = start + travel - next;
    if (offset > SWITCH_AT && next < count - 1) next += 1;
    else if (offset < -SWITCH_AT && next > 0) next -= 1;
    else break;
  }
  const offset = start + travel - next;
  const againstEdge = (offset < 0 && next === 0) || (offset > 0 && next === count - 1);
  if (againstEdge) {
    return {
      held: next,
      position: next + resist(offset, EDGE_LIMIT),
      stretch: -Math.min(1, Math.abs(offset) / SWITCH_AT),
    };
  }
  const pull = resist(offset, PULL_LIMIT);
  return { held: next, position: next + pull, stretch: Math.abs(pull) / PULL_LIMIT };
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

/** Horizontal and vertical scale for a stretch amount (see `DragFrame.stretch`). */
export function stretchScale(stretch: number): { x: number; y: number } {
  const amount = Math.max(-1, Math.min(1, stretch));
  return amount >= 0
    ? { x: 1 + 0.2 * amount, y: 1 - 0.1 * amount }
    : { x: 1 + 0.12 * amount, y: 1 - 0.08 * amount };
}

/** The label under the selection stretches a little more than the selection, like gum. */
export function labelScale(scale: { x: number; y: number }): { x: number; y: number } {
  return { x: 1 + 1.25 * (scale.x - 1), y: 1 + 0.5 * (scale.y - 1) };
}

/** Share of the screen width the screen moves per tab the selection moves, before resistance. */
const SCREEN_GAIN = 0.6;
/** Farthest the screen follows the selection, as a share of its width. */
const SCREEN_LIMIT = 0.25;

/**
 * How far the screen of tab `screenTab` moves, as a share of its width, while
 * the selection sits at `position`. It moves the other way, the way a carousel
 * does: pulling the selection toward the next tab drags the screen left, where
 * the next screen will push it out. It gives less and less the farther it goes.
 */
export function screenPull(position: number, screenTab: number): number {
  return -resist((position - screenTab) * SCREEN_GAIN, SCREEN_LIMIT);
}

const POSITION_STIFFNESS = 420;
const POSITION_RATIO = 0.65;
const STRETCH_STIFFNESS = 300;
const STRETCH_RATIO = 0.45;
/** Speed, in tabs per second, adds this much stretch: the selection smears as it flies. */
const SPEED_STRETCH = 0.06;
const MAX_SPEED_STRETCH = 0.6;
const STEP = 1 / 240;

type Paint = (position: number, scale: { x: number; y: number }) => void;

/**
 * Moves the selection with springs, one animation frame at a time, and hands
 * each frame to `paint`. With reduced motion it jumps instead and never
 * stretches.
 */
export class SelectionMotion {
  private position: Spring = { value: 0, velocity: 0 };
  private stretch: Spring = { value: 0, velocity: 0 };
  private target = 0;
  private stretchTarget = 0;
  private frame = 0;
  private last = 0;

  constructor(
    private readonly count: number,
    private readonly paint: Paint,
    private readonly reducedMotion: () => boolean,
  ) {}

  /** The tab the selection is drawn closest to. */
  get nearest(): number {
    return Math.round(this.position.value);
  }

  /** Where the selection is now, in tabs, springs included. */
  get current(): number {
    return this.position.value;
  }

  /** Puts the selection on tab `index` without animating. */
  place(index: number): void {
    this.stop();
    this.target = index;
    this.stretchTarget = 0;
    this.position = { value: index, velocity: 0 };
    this.stretch = { value: 0, velocity: 0 };
    this.draw(index, { x: 1, y: 1 });
  }

  /** Springs the selection to tab `index`. */
  settle(index: number): void {
    if (this.reducedMotion()) {
      this.place(index);
      return;
    }
    this.target = index;
    this.stretchTarget = 0;
    this.run();
  }

  /** Follows a finger (see `dragFrame`). */
  follow(frame: DragFrame): void {
    if (this.reducedMotion()) {
      this.stop();
      this.position = { value: frame.position, velocity: 0 };
      this.draw(frame.position, { x: 1, y: 1 });
      return;
    }
    this.target = frame.position;
    this.stretchTarget = frame.stretch;
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
    const elapsed = Math.min(0.032, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const steps = Math.max(1, Math.round(elapsed / STEP));
    for (let step = 0; step < steps; step++) {
      stepSpring(this.position, this.target, elapsed / steps, POSITION_STIFFNESS, POSITION_RATIO);
      stepSpring(this.stretch, this.stretchTarget, elapsed / steps, STRETCH_STIFFNESS, STRETCH_RATIO);
    }
    const resting =
      Math.abs(this.position.value - this.target) < 0.0005 &&
      Math.abs(this.position.velocity) < 0.005 &&
      Math.abs(this.stretch.value - this.stretchTarget) < 0.0005 &&
      Math.abs(this.stretch.velocity) < 0.005;
    if (resting) {
      this.position = { value: this.target, velocity: 0 };
      this.stretch = { value: this.stretchTarget, velocity: 0 };
    }
    const speed = Math.min(MAX_SPEED_STRETCH, Math.abs(this.position.velocity) * SPEED_STRETCH);
    this.draw(this.position.value, stretchScale(this.stretch.value + speed));
    this.frame = resting ? 0 : requestAnimationFrame(this.tick);
  };

  // A spring that overshoots the first or last tab gives way like a drag
  // against the edge, so the selection never leaves the bar.
  private draw(position: number, scale: { x: number; y: number }): void {
    const last = this.count - 1;
    if (position < 0) this.paint(resist(position, EDGE_LIMIT), scale);
    else if (position > last) this.paint(last + resist(position - last, EDGE_LIMIT), scale);
    else this.paint(position, scale);
  }
}
