// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// How the next screen arrives after a tap on the tab bar: from the right
// ("next", a tab further along) or from the left ("prev"). The tab bar sets
// it on the tap; the AppShell of the screen that opens takes it once.

export type TabEntrance = "next" | "prev";

/** A tap older than this opened no screen (the route never moved): forget it. */
export const ENTRANCE_TTL_MS = 1500;

/** Distance, in px, the arriving screen travels while it fades in. */
export const ENTRANCE_SHIFT_PX = 28;
export const ENTRANCE_MS = 200;
export const ENTRANCE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

let pending: { entrance: TabEntrance; at: number } | null = null;

/** The direction from tab `from` to tab `to`, or null when there is none to show. */
export function entranceBetween(from: number, to: number): TabEntrance | null {
  if (from < 0 || to < 0 || from === to) return null;
  return to > from ? "next" : "prev";
}

export function setTabEntrance(entrance: TabEntrance | null, now = performance.now()): void {
  pending = entrance ? { entrance, at: now } : null;
}

/** The entrance of the screen opening now, once: a later screen (Back, say) arrives as usual. */
export function takeTabEntrance(now = performance.now()): TabEntrance | null {
  const taken = pending;
  pending = null;
  return taken && now - taken.at <= ENTRANCE_TTL_MS ? taken.entrance : null;
}
