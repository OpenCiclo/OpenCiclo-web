// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";

/**
 * A ref that always points at the latest `value`, for callbacks read from
 * effects and event handlers. Updated after render, never during it.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The device's reduced-motion setting. `false` on the server and during hydration. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

const noSubscription = () => () => {};

/**
 * Reads a browser-only value (localStorage, navigator) once the page has
 * hydrated. The server and the first client render get `serverValue`, so the
 * markup matches. `read` must return a primitive or a stable reference.
 */
export function useBrowserValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noSubscription, read, () => serverValue);
}
