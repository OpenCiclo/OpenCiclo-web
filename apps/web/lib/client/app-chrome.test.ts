// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { hidesAppChrome } from "@/lib/client/app-chrome";

describe("hidesAppChrome", () => {
  it("hides the tab bar and the desktop header on pages with chrome of their own", () => {
    for (const path of ["/", "/contact", "/help", "/help/hosting", "/console", "/console/learn", "/dev-seasons"]) {
      expect(hidesAppChrome(path)).toBe(true);
    }
  });

  it("shows them on the app's pages", () => {
    for (const path of ["/app", "/patterns", "/learn", "/learn/cycle-basics", "/settings", "/diary", "/privacy"]) {
      expect(hidesAppChrome(path)).toBe(false);
    }
  });
});
