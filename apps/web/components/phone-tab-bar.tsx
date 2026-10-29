// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useIsDesktop } from "@/lib/client/desktop";
import { FloatingTabBar } from "@/components/floating-tab-bar";

/**
 * The tab bar, on the web, in the phone layout only: the desktop layout has
 * DesktopHeader instead, and no screens to slide, so the bar and its ghosts
 * are not even mounted there.
 */
export function PhoneTabBar() {
  return useIsDesktop() ? null : <FloatingTabBar />;
}
