// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect } from "react";

import { IS_ANDROID_APP } from "@/lib/app-target";
import { useLatest } from "@/lib/client/hooks";

// The Android back button. MainActivity (apps/mobile) calls window.cicloBack()
// and acts on the answer:
//   "handled"  the page used it (closed a sheet, went back one step)
//   "exit"     leave the app (the device lock screen)
//   "history"  the WebView goes back, or the app leaves at the first screen
export type BackAction = "handled" | "exit" | "history";

const steps: Array<() => void> = [];

/**
 * Lets a screen with inner steps (onboarding) take Back before history does.
 * Pass `null` when there is no step to undo.
 */
export function useBackStep(handler: (() => void) | null) {
  const latest = useLatest(handler);
  const active = handler !== null;
  useEffect(() => {
    if (!IS_ANDROID_APP || !active) return;
    const step = () => latest.current?.();
    steps.push(step);
    return () => {
      steps.splice(steps.indexOf(step), 1);
    };
  }, [active, latest]);
}

export function androidBack(): BackAction {
  if (document.querySelector("[data-device-lock]")) return "exit";
  // Every sheet and dialog closes on Escape (a window keydown listener), so
  // Back reuses that path, guards included.
  if (document.querySelector('[aria-modal="true"]')) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    return "handled";
  }
  const step = steps.at(-1);
  if (step) {
    step();
    return "handled";
  }
  return "history";
}
