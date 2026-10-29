// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse } from "next/og";

import { seaMarkDataUri } from "@/lib/brand/sea-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The brand mark on a filled square, which iOS rounds for the home screen. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into a PNG by next/og */}
        <img src={seaMarkDataUri({ shape: "square" })} width={size.width} height={size.height} alt="" />
      </div>
    ),
    { ...size },
  );
}
