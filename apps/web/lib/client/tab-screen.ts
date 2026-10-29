// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The content of the screen AppShell is showing, and the ghosts of the other
// tabs, so the tab bar can move them with the finger while the selection is
// dragged (see FloatingTabBar and TabGhosts). AppShell clips its content.

let shown: HTMLElement | null = null;

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

/** Plays a screen's entrance animations (fade-up and friends) to the end: it arrives whole. */
export function skipEntrance(screen: HTMLElement | null): void {
  for (const animation of screen?.getAnimations({ subtree: true }) ?? []) {
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
  }
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
// in place, under the ghost: no slide, and the view transition React still
// starts for the new screen ends at once.
let swapping = false;
const swapListeners = new Set<() => void>();

export function setSwapping(on: boolean): void {
  if (swapping === on) return;
  swapping = on;
  // The view transition the swap still sets off ends at once (see globals.css).
  if (on) document.documentElement.dataset.tabSwap = "";
  for (const listener of swapListeners) listener();
}

/** The next screen change is not a swap: its view transition animates again. */
export function endSwapTransition(): void {
  delete document.documentElement.dataset.tabSwap;
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
