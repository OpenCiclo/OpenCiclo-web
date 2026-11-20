// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse } from "next/og";

import { seaMarkDataUri } from "@/lib/brand/sea-mark";

// The two PNG icons in public/manifest.json (/pwa-icon/192, /pwa-icon/512).
// Drawn once by `next build` and served as static files; any other size is a 404.
const SIZES = ["192", "512"];

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_request: Request, context: { params: Promise<{ size: string }> }) {
  const { size } = await context.params;
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  const px = Number(size);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into a PNG by next/og */}
        <img src={seaMarkDataUri({ shape: "square" })} width={px} height={px} alt="" />
      </div>
    ),
    { width: px, height: px },
  );
}
