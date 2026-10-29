// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useSyncExternalStore } from "react";

import { IS_ANDROID_APP } from "@/lib/app-target";

/**
 * Windows at least this wide get the desktop web layout. Keep it in step with
 * the `desktop` variant in globals.css, which styles the same layout.
 */
export const DESKTOP_QUERY = "(width >= 64rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True where the desktop web layout applies: a wide window on the web. The
 * Android app always keeps the phone layout. `false` on the server and during
 * hydration, so layout that must be right from the first paint belongs in the
 * `desktop:` CSS variant; this is for what CSS cannot do (which components to
 * mount at all).
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !IS_ANDROID_APP && window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}
