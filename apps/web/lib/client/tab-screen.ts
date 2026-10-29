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
