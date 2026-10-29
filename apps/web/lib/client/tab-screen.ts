// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The screen AppShell is showing, so the tab bar can pull it along while the
// selection is dragged (see FloatingTabBar).

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
