// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The content of the screen AppShell is showing, so the tab bar can pull it
// along while the selection is dragged (see FloatingTabBar). AppShell clips it.

let shown: HTMLElement | null = null;
let onShow: (() => void) | null = null;

/**
 * Marks `screen` as the one on display. The cleanup runs when the screen
 * leaves or Next.js hides it for later, and puts it back in place.
 */
export function showScreen(screen: HTMLElement): () => void {
  shown = screen;
  // A screen can arrive mid-drag: it must be moved before it is first painted.
  onShow?.();
  return () => {
    if (shown === screen) shown = null;
    screen.style.transform = "";
  };
}

export function shownScreen(): HTMLElement | null {
  return shown;
}

/** Calls `callback` each time a screen comes on display. */
export function watchScreens(callback: () => void): () => void {
  onShow = callback;
  return () => {
    if (onShow === callback) onShow = null;
  };
}
