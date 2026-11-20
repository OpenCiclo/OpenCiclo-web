// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Where the hosted app runs, for the privacy policy. The function region comes
// from vercel.json, so the policy follows a change of region without anyone
// editing its text. A region missing from REGIONS fails hosting.test.ts.

import vercelConfig from "@/vercel.json";
import type { BaseLocale } from "@/lib/i18n";

export type HostingRegion = {
  code: string;
  /** In the European Economic Area: no transfer out of it for the server code. */
  inEea: boolean;
  place: Record<BaseLocale, string>;
};

const REGIONS: Record<string, HostingRegion> = {
  iad1: {
    code: "iad1",
    inEea: false,
    place: { es: "Washington D. C. (Estados Unidos)", en: "Washington, D.C. (United States)" },
  },
  fra1: { code: "fra1", inEea: true, place: { es: "Fráncfort (Alemania)", en: "Frankfurt (Germany)" } },
  cdg1: { code: "cdg1", inEea: true, place: { es: "París (Francia)", en: "Paris (France)" } },
  dub1: { code: "dub1", inEea: true, place: { es: "Dublín (Irlanda)", en: "Dublin (Ireland)" } },
  arn1: { code: "arn1", inEea: true, place: { es: "Estocolmo (Suecia)", en: "Stockholm (Sweden)" } },
};

/** Vercel's default function region when vercel.json names none. */
export const DEFAULT_FUNCTION_REGION = "iad1";

/** The Neon database: AWS eu-central-1. */
export const DATABASE_PLACE: Record<BaseLocale, string> = {
  es: "Fráncfort (Alemania)",
  en: "Frankfurt (Germany)",
};

export function isKnownRegion(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(REGIONS, code);
}

/** The regions a vercel.json runs functions in, Vercel's default when it names none. */
export function functionRegions(config: object): HostingRegion[] {
  const regions: unknown = "regions" in config ? config.regions : undefined;
  const codes = Array.isArray(regions)
    ? regions.filter((code): code is string => typeof code === "string" && code !== "")
    : [];
  return (codes.length > 0 ? codes : [DEFAULT_FUNCTION_REGION]).map(
    (code) =>
      (isKnownRegion(code) ? REGIONS[code] : null) ?? {
        code,
        inEea: false,
        place: { es: `la región «${code}» de Vercel`, en: `Vercel's “${code}” region` },
      },
  );
}

/** Where this deployment's functions run, from apps/web/vercel.json. */
export const FUNCTION_REGIONS: HostingRegion[] = functionRegions(vercelConfig);
