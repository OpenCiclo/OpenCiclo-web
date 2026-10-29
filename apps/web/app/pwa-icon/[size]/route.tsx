// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse } from "next/og";

import { seaMarkDataUri } from "@/lib/brand/sea-mark";

const SIZES = new Set(["192", "512"]);

export async function GET(_request: Request, context: { params: Promise<{ size: string }> }) {
  const { size } = await context.params;
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
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
