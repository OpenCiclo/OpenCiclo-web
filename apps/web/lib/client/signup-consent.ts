// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The sign-up consent gate (app/onboarding/page.tsx). Health data needs an
// explicit yes before a diary exists, so none of the ways to create one opens
// until the box is ticked. The tick is not stored anywhere.

export type SignupMethod = "email" | "phrase" | "device";

/** The sign-up way to open, or null while the consent box is not ticked. */
export function gatedSignupMethod(method: SignupMethod, consented: boolean): SignupMethod | null {
  return consented ? method : null;
}
