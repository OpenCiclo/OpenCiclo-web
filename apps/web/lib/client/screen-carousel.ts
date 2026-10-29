// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Screens that follow the finger while the tab bar selection is dragged, like
// a carousel: halfway between two tabs, half of each screen shows. Only the
// screen on display exists, so the tab bar navigates to the next tab as soon
// as the drag heads that way, and the view transition that swaps the two
// screens (the `tab-slide` animations, see globals.css) is paused: its
// progress comes from the finger instead of the clock.

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
 * Eases from `from` to `to` over `ms`, slowing down at the end, with no
 * bounce. Calls `frame` with each value and `done` once there. Returns a
 * function that stops it.
 */
export function tween(from: number, to: number, ms: number, frame: (value: number) => void, done: () => void): () => void {
  const start = performance.now();
  let id = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    frame(from + (to - from) * (1 - (1 - t) ** 3));
    if (t < 1) id = requestAnimationFrame(step);
    else done();
  };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}
