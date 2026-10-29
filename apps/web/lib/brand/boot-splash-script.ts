// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { seaMarkPath } from "./sea-mark";

/** Element ids shared by the splash markup (components/boot-splash.tsx) and its script. */
export const BOOT_SPLASH_ID = "boot-splash";
export const BOOT_SPLASH_SEA_ID = "boot-splash-sea";

/**
 * Inline script that goes right after the splash markup in the root layout. It
 * shows the splash (CSS keeps it hidden when scripts are off, so the page is
 * never stuck behind it) and animates the sea until the markup is removed. It
 * runs before hydration, so it carries its own copy of seaMarkPath.
 */
export function bootSplashScript(): string {
  return `(${animateSplash.toString()})(${JSON.stringify(BOOT_SPLASH_ID)},${JSON.stringify(BOOT_SPLASH_SEA_ID)},${seaMarkPath.toString()});`;
}

function animateSplash(splashId: string, seaId: string, path: (t: number) => string) {
  const sea = document.getElementById(seaId);
  if (!document.getElementById(splashId) || !sea) return;
  const start = performance.now();
  document.documentElement.classList.add(splashId);
  (window as Window & { cicloBootSplash?: { start: number } }).cicloBootSplash = { start };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const frame = (now: number) => {
    if (!sea.isConnected) return;
    sea.setAttribute("d", path((now - start) / 1000));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
