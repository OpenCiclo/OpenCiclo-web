// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { IS_ANDROID_APP, apiUrl } from "@/lib/app-target";

describe("app target", () => {
  it("keeps web API calls same-origin when no Android base is baked in", () => {
    expect(IS_ANDROID_APP).toBe(false);
    expect(apiUrl("/api/vault")).toBe("/api/vault");
  });
});
