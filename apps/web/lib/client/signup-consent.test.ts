// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { gatedSignupMethod, type SignupMethod } from "@/lib/client/signup-consent";

const onboarding = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../app/onboarding/page.tsx"),
  "utf8",
);
const METHODS: SignupMethod[] = ["email", "phrase", "device"];

describe("sign-up consent gate", () => {
  it("opens no way to create a diary until the box is ticked", () => {
    for (const method of METHODS) {
      expect(gatedSignupMethod(method, false), method).toBeNull();
      expect(gatedSignupMethod(method, true), method).toBe(method);
    }
  });

  // The page is not rendered in these tests, so check its source: a new
  // button that sets the method directly would skip the consent.
  it("sends every way to create a diary through the gate", () => {
    expect(onboarding).not.toMatch(/setMethod\(\s*["'](email|phrase|device)["']\s*\)/);
    for (const method of METHODS) expect(onboarding).toContain(`startSignup("${method}")`);
    expect(onboarding.match(/disabled=\{!consented\}/g) ?? []).toHaveLength(METHODS.length);
  });

  it("explains why the buttons are disabled and opens the policy without leaving the page", () => {
    expect(onboarding).toContain("t.signupConsentRequired");
    expect(onboarding).toContain("<PolicyDialog");
    expect(onboarding).not.toMatch(/href="\/privacy"/);
  });
});
