// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";

import { BOOT_SPLASH_ID, BOOT_SPLASH_SEA_ID } from "@/lib/brand/boot-splash-script";
import { SEA_MARK_PATH } from "@/lib/brand/sea-mark";
import { useCiclo } from "@/lib/client/ciclo-context";

// Covers the page from the first paint until the stored session is restored
// (`ready`), with the moving mark. bootSplashScript() in the root layout shows it
// and animates the sea before hydration; this component only takes it away.
const MIN_MS = 700; // long enough to read as a splash, not a flicker
const MAX_MS = 6000; // never hide a slow page for longer than this
const FADE_MS = 300;

declare global {
  interface Window {
    cicloBootSplash?: { start: number };
  }
}

export function BootSplash() {
  const { ready } = useCiclo();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // No start time means the script did not run and the splash never showed.
    const elapsed = performance.now() - (window.cicloBootSplash?.start ?? -MAX_MS);
    const timer = window.setTimeout(() => setLeaving(true), Math.max(0, (ready ? MIN_MS : MAX_MS) - elapsed));
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove(BOOT_SPLASH_ID);
      setGone(true);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (gone) return null;
  return (
    <div
      id={BOOT_SPLASH_ID}
      aria-hidden
      className={`marketing-theme fixed inset-0 z-[200] hidden items-center justify-center bg-background transition-opacity duration-300 motion-reduce:transition-none ${leaving ? "pointer-events-none opacity-0" : ""}`}
    >
      <svg viewBox="0 0 32 32" className="size-40">
        <circle cx="16" cy="16" r="16" className="fill-primary" />
        {/* The inline script rewrites `d` every frame before React hydrates. */}
        <path id={BOOT_SPLASH_SEA_ID} d={SEA_MARK_PATH} className="fill-primary-foreground" suppressHydrationWarning />
      </svg>
    </div>
  );
}
