// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { seaMarkPath } from "./sea-mark";

/** Element ids shared by the splash markup (components/boot-splash.tsx) and its script. */
export const BOOT_SPLASH_ID = "boot-splash";
export const BOOT_SPLASH_SEA_ID = "boot-splash-sea";

/**
 * Pages of the public site that open at once, with no splash: they need no
 * stored session. A path matches exactly or as a folder ("/help" covers
 * "/help/hosting"). The app's own pages keep the splash.
 */
export const SITE_PATHS_WITHOUT_SPLASH = ["/", "/contact", "/help"];

/**
 * Inline script that goes right after the splash markup in the root layout. It
 * shows the splash (CSS keeps it hidden when scripts are off, so the page is
 * never stuck behind it) and animates the sea until the markup is removed. It
 * runs before hydration, so it carries its own copy of seaMarkPath.
 *
 * `skip` lists paths that show no splash (see SITE_PATHS_WITHOUT_SPLASH).
 */
export function bootSplashScript({ skip = [] }: { skip?: string[] } = {}): string {
  return `(${animateSplash.toString()})(${JSON.stringify(BOOT_SPLASH_ID)},${JSON.stringify(BOOT_SPLASH_SEA_ID)},${seaMarkPath.toString()},${JSON.stringify(skip)});`;
}

function animateSplash(splashId: string, seaId: string, path: (t: number) => string, skip: string[]) {
  const sea = document.getElementById(seaId);
  if (!document.getElementById(splashId) || !sea) return;
  const here = location.pathname;
  // An installed app opened on "/" goes on to the calendar, and on app.* "/"
  // is the calendar (middleware.ts): both are the app starting, splash and all.
  const installed =
    matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const appHost = location.hostname.startsWith("app.");
  const site = skip.some((page) => here === page || (page !== "/" && here.startsWith(`${page}/`)));
  if (site && !(here === "/" && (installed || appHost))) return;
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
