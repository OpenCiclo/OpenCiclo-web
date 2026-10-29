// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from "vitest";

import { goBack, previousPath, returnTo, type NavigationLike } from "@/lib/client/back-navigation";

function history(urls: string[], index = urls.length - 1): NavigationLike {
  return {
    canGoBack: index > 0,
    currentEntry: { index },
    entries: () => urls.map((url) => ({ url })),
  };
}

function router() {
  return { back: vi.fn(), replace: vi.fn() };
}

describe("previousPath", () => {
  it("returns the previous entry's path and query", () => {
    expect(previousPath(history(["https://localhost/app?x=1", "https://localhost/unlock"]))).toBe("/app?x=1");
  });

  it("is null at the first entry or without the Navigation API", () => {
    expect(previousPath(history(["https://localhost/unlock"]))).toBeNull();
    expect(previousPath(undefined)).toBeNull();
  });
});

describe("goBack", () => {
  it("pops when there is an earlier screen in the app", () => {
    const r = router();
    goBack(r, "/app", history(["https://localhost/app", "https://localhost/onboarding"]));
    expect(r.back).toHaveBeenCalledOnce();
    expect(r.replace).not.toHaveBeenCalled();
  });

  it("opens the fallback after a direct visit", () => {
    const r = router();
    goBack(r, "/app", history(["https://localhost/onboarding"]));
    expect(r.replace).toHaveBeenCalledWith("/app");
    expect(r.back).not.toHaveBeenCalled();
  });
});

describe("returnTo", () => {
  it("pops when the target is the previous screen", () => {
    const r = router();
    returnTo(r, "/app", history(["https://localhost/app", "https://localhost/unlock"]));
    expect(r.back).toHaveBeenCalledOnce();
  });

  it("replaces the form when the target is somewhere else", () => {
    const r = router();
    returnTo(r, "/console", history(["https://localhost/app", "https://localhost/unlock?next=%2Fconsole"]));
    expect(r.replace).toHaveBeenCalledWith("/console");
    expect(r.back).not.toHaveBeenCalled();
  });

  it("replaces without the Navigation API", () => {
    const r = router();
    returnTo(r, "/app", undefined);
    expect(r.replace).toHaveBeenCalledWith("/app");
  });
});
