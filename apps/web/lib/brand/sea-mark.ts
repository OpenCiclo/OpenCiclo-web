// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez. All rights reserved.
// SPDX-License-Identifier: LicenseRef-OpenCiclo-Brand
// The round-sea logo is not licensed under Apache-2.0. See TRADEMARKS.md.

// The Ciclo mark: a dark disc with a "round sea" inside. Geometry lives in a
// 32×32 box: the disc fills it (r = 16) and the sea is a circle of radius 5.8
// whose rim is bent by a few long, smooth waves. Design notes: docs/brand/logo.md.
// app/icon.svg, app/favicon.ico and the Android icons are generated from this
// file by `npm run icons` (scripts/brand-icons.mjs).

/** Brand colors. The mark is always this pair, whatever the page theme. */
export const BRAND = {
  disc: "#24272a",
  sea: "#fcfcfc",
  /** Page backgrounds (globals.css --background), used behind the splash. */
  background: "#f9fafb",
  backgroundDark: "#101214",
  /** The mark on a dark page, as in `.dark .marketing-theme`. */
  discDark: "#e6e8ea",
  seaDark: "#101214",
} as const;

export type SeaMotion = {
  /** Wave height. 1 = as designed. */
  height?: number;
  /** Time scale. 1 = as designed. */
  speed?: number;
  /** 0 to 1. A thicker sea: short waves fade out and everything slows down. */
  density?: number;
};

/**
 * SVG path data for the sea, in the 32×32 box. Without `t` it is the still
 * logo. With `t` (seconds) the shape stays in place and breathes a little while
 * surface waves run clockwise along the rim. Longer waves run faster, as in deep
 * water, so the edge keeps changing instead of spinning.
 *
 * Self-contained on purpose: the boot splash inlines it with toString().
 */
export function seaMarkPath(t?: number, motion?: SeaMotion): string {
  const TAU = Math.PI * 2;
  const N = 64;
  const R = 5.8;
  // k = crests around the rim, a = height as a share of R, ph = phase.
  const still = [
    { k: 2, a: 0.022, ph: 1 },
    { k: 3, a: 0.034, ph: 2.3 },
    { k: 4, a: 0.024, ph: 0.6 },
    { k: 5, a: 0.016, ph: 4.1 },
  ];
  const surface = [
    { k: 3, a: 0.022, ph: 2.1 },
    { k: 4, a: 0.02, ph: 0.4 },
    { k: 6, a: 0.01, ph: 4.4 },
    { k: 8, a: 0.004, ph: 1.3 },
  ];
  const moving = typeof t === "number";
  const time = moving ? t : 0;
  const height = motion?.height ?? 1;
  const density = motion?.density ?? 0.6;
  const pace = (motion?.speed ?? 1) * (1 - 0.4 * density);

  const waves: { k: number; a: number; ph: number; steep: number }[] = [];
  still.forEach((w, j) => {
    const breath = moving ? 1 + 0.15 * Math.sin(0.5 * pace * time + 1.3 * j + w.ph) : 1;
    waves.push({ k: w.k, a: w.a * breath, ph: w.ph, steep: 0 });
  });
  if (moving) {
    surface.forEach((w) => {
      const a = w.a * height * Math.exp((-density * Math.max(0, w.k - 3)) / 6);
      // Angular frequency grows with √k (deep-water dispersion). A little
      // steepness narrows the crests, which reads as water rather than jelly.
      waves.push({ k: w.k, a, ph: w.ph + 1.35 * pace * Math.sqrt(w.k) * time, steep: Math.min(0.6, a * w.k) });
    });
  }
  let fold = 0;
  waves.forEach((w) => {
    fold += w.steep;
  });
  // Too much steepness would fold the rim over itself.
  const g = fold > 0.8 ? 0.8 / fold : 1;

  const pts: number[][] = [];
  for (let i = 0; i < N; i++) {
    const u = (TAU * i) / N;
    let dr = 0;
    let dth = 0;
    waves.forEach((w) => {
      const x = w.k * u - w.ph;
      dr += w.a * Math.cos(x);
      dth -= (g * w.steep * Math.sin(x)) / w.k;
    });
    const r = R * (1 + dr);
    pts.push([16 + r * Math.cos(u + dth), 16 + r * Math.sin(u + dth)]);
  }

  // Closed Catmull-Rom spline through the points, written as cubic Béziers.
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i + N - 1) % N];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % N];
    const p3 = pts[(i + 2) % N];
    d +=
      "C" +
      [
        p1[0] + (p2[0] - p0[0]) / 6,
        p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6,
        p2[1] - (p3[1] - p1[1]) / 6,
        p2[0],
        p2[1],
      ]
        .map(f)
        .join(" ");
  }
  return d + "Z";
}

/** The still logo's sea. */
export const SEA_MARK_PATH = seaMarkPath();

/**
 * The whole mark as an SVG document. `shape: "square"` fills the box with the
 * disc color, for icons that the platform masks to its own shape.
 */
export function seaMarkSvg(options: { shape?: "circle" | "square"; disc?: string; sea?: string } = {}): string {
  const disc = options.disc ?? BRAND.disc;
  const sea = options.sea ?? BRAND.sea;
  const ground =
    options.shape === "square"
      ? `<rect width="32" height="32" fill="${disc}"/>`
      : `<circle cx="16" cy="16" r="16" fill="${disc}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${ground}<path d="${SEA_MARK_PATH}" fill="${sea}"/></svg>`;
}

/** seaMarkSvg() as a data URI, for an <img> inside next/og ImageResponse. */
export function seaMarkDataUri(options: Parameters<typeof seaMarkSvg>[0] = {}): string {
  return `data:image/svg+xml;base64,${btoa(seaMarkSvg(options))}`;
}
