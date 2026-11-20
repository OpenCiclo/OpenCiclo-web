// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useCallback, useSyncExternalStore } from "react";

import { useCiclo } from "@/lib/client/ciclo-context";
import { FRIENDS_AVAILABLE } from "@/lib/features";

// Whether this device shows the Friends tab (Settings). Per device, like the
// lunar phases: hiding a tab changes nothing about sharing.
const KEY = "ciclo.friendsTab";
const EVENT = "ciclo-friends-tab";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "hidden";
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** The Settings choice, and its setter. */
export function useFriendsTabChoice(): [boolean, (visible: boolean) => void] {
  const visible = useSyncExternalStore(subscribe, read, () => true);
  const set = useCallback((next: boolean) => {
    try {
      if (next) window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, "hidden");
    } catch {
      // Storage blocked: the choice lasts until the page closes.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [visible, set];
}

/**
 * Whether the tab bar and the desktop header show Friends: the feature is
 * available, the open diary is a hosted account (an on-device diary shares
 * nothing), and this device has not hidden it.
 */
export function useShowsFriendsTab(): boolean {
  const { storageMode } = useCiclo();
  const [visible] = useFriendsTabChoice();
  return FRIENDS_AVAILABLE && storageMode === "hosted" && visible;
}
