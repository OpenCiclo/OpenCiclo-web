// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The content of the screen AppShell is showing, so the tab bar can move it
// with the finger while the selection is dragged (see FloatingTabBar). AppShell
// clips it. AppShell also says when the screen carousel's slides start, so the
// tab bar can take them over (see screen-carousel.ts).

let shown: HTMLElement | null = null;
let onSlides: (() => void) | null = null;

/**
 * Marks `screen` as the one on display. The cleanup runs when the screen
 * leaves or Next.js hides it for later, and puts it back in place.
 */
export function showScreen(screen: HTMLElement): () => void {
  shown = screen;
  return () => {
    if (shown === screen) shown = null;
    screen.style.transform = "";
  };
}

export function shownScreen(): HTMLElement | null {
  return shown;
}

/** Called by AppShell when the slides that bring a screen in have started. */
export function slidesStarted(): void {
  onSlides?.();
}

/** Calls `callback` each time the slides that bring a screen in start. */
export function watchSlides(callback: () => void): () => void {
  onSlides = callback;
  return () => {
    if (onSlides === callback) onSlides = null;
  };
}

// Copies of the other tab screens (see TabGhosts), by tab, for a drag to slide in.
const ghosts = new Map<number, HTMLElement>();

/** Registers the ghost of tab `tab`, until the cleanup. */
export function showGhost(tab: number, ghost: HTMLElement): () => void {
  ghosts.set(tab, ghost);
  return () => {
    if (ghosts.get(tab) === ghost) ghosts.delete(tab);
  };
}

export function ghostOf(tab: number): HTMLElement | undefined {
  return ghosts.get(tab);
}

// While a drag lands on a ghost and the route follows, the real screens swap
// in place, under the ghost: no slide, and no view transition at all.
let swapping = false;
const swapListeners = new Set<() => void>();

export function setSwapping(on: boolean): void {
  if (swapping === on) return;
  swapping = on;
  for (const listener of swapListeners) listener();
}

export function subscribeSwapping(listener: () => void): () => void {
  swapListeners.add(listener);
  return () => {
    swapListeners.delete(listener);
  };
}

export function isSwapping(): boolean {
  return swapping;
}
