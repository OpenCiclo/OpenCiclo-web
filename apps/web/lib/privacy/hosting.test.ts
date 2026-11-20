// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import vercelConfig from "@/vercel.json";
import { DEFAULT_FUNCTION_REGION, FUNCTION_REGIONS, functionRegions, isKnownRegion } from "@/lib/privacy/hosting";

describe("function regions for the privacy policy", () => {
  it("uses Vercel's default region when vercel.json names none", () => {
    expect(functionRegions({}).map((region) => region.code)).toEqual([DEFAULT_FUNCTION_REGION]);
    expect(functionRegions({ regions: [] }).map((region) => region.code)).toEqual([DEFAULT_FUNCTION_REGION]);
    expect(functionRegions({ regions: "fra1" }).map((region) => region.code)).toEqual([DEFAULT_FUNCTION_REGION]);
  });

  it("knows whether a region is inside the EEA", () => {
    expect(functionRegions({ regions: ["iad1"] })[0]).toMatchObject({ code: "iad1", inEea: false });
    expect(functionRegions({ regions: ["fra1"] })[0]).toMatchObject({ code: "fra1", inEea: true });
    expect(functionRegions({ regions: ["fra1"] })[0].place.en).toContain("Frankfurt");
  });

  it("never claims the EEA for a region it does not know", () => {
    const [region] = functionRegions({ regions: ["xyz9"] });
    expect(region).toMatchObject({ code: "xyz9", inEea: false });
    expect(region.place.en).toContain("xyz9");
  });

  // Moving functions to a region missing from REGIONS fails here: add its
  // place name so the policy says where the server code runs.
  it("has a place name for every region in apps/web/vercel.json", () => {
    const regions = "regions" in vercelConfig && Array.isArray(vercelConfig.regions) ? vercelConfig.regions : [];
    for (const code of regions) expect(isKnownRegion(String(code)), String(code)).toBe(true);
    expect(FUNCTION_REGIONS.length).toBeGreaterThan(0);
    for (const region of FUNCTION_REGIONS) expect(isKnownRegion(region.code), region.code).toBe(true);
  });
});
