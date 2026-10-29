// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { BOOT_SPLASH_ID, BOOT_SPLASH_SEA_ID, SITE_PATHS_WITHOUT_SPLASH, bootSplashScript } from "./boot-splash-script";

/**
 * Runs the inline script against a stand-in page at `pathname` and tells
 * whether it showed the splash (the class on <html>).
 */
function showsSplash(
  pathname: string,
  { installed = false, hostname = "www.openciclo.com", skip = SITE_PATHS_WITHOUT_SPLASH } = {},
): boolean {
  const classes = new Set<string>();
  const element = { isConnected: false, setAttribute() {} };
  const fakes = {
    document: {
      getElementById: (id: string) => (id === BOOT_SPLASH_ID || id === BOOT_SPLASH_SEA_ID ? element : null),
      documentElement: { classList: { add: (name: string) => classes.add(name) } },
    },
    location: { pathname, hostname },
    matchMedia: (query: string) => ({ matches: installed && query.includes("standalone") }),
    navigator: {},
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    window: {},
  };
  const names = Object.keys(fakes);
  new Function(...names, bootSplashScript({ skip }))(...names.map((name) => fakes[name as keyof typeof fakes]));
  return classes.has(BOOT_SPLASH_ID);
}

describe("boot splash", () => {
  it("does not hold up the landing or the rest of the public site", () => {
    expect(showsSplash("/")).toBe(false);
    expect(showsSplash("/contact")).toBe(false);
    expect(showsSplash("/help")).toBe(false);
    expect(showsSplash("/help/hosting")).toBe(false);
  });

  it("shows while the app loads", () => {
    for (const path of ["/app", "/patterns", "/learn", "/settings", "/unlock", "/helpful"]) {
      expect(showsSplash(path)).toBe(true);
    }
  });

  it("shows on / when that is the app starting: installed, or on app.*", () => {
    expect(showsSplash("/", { installed: true })).toBe(true);
    expect(showsSplash("/", { hostname: "app.openciclo.com" })).toBe(true);
    expect(showsSplash("/contact", { installed: true })).toBe(false);
  });

  it("shows everywhere with no paths to skip (the Android app)", () => {
    expect(showsSplash("/", { skip: [] })).toBe(true);
    expect(showsSplash("/help", { skip: [] })).toBe(true);
  });
});
