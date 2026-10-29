// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { bootSplashScript } from "./boot-splash-script";
import { SEA_MARK_PATH, seaMarkPath } from "./sea-mark";

/** End points of each segment, as [angle, radius] around the disc centre. */
function rim(d: string): [number, number][] {
  const n = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  const out: [number, number][] = [];
  for (let i = 6; i < n.length; i += 6) {
    out.push([Math.atan2(n[i + 1] - 16, n[i] - 16), Math.hypot(n[i] - 16, n[i + 1] - 16)]);
  }
  return out;
}

const MOTIONS = [undefined, { height: 2, speed: 3, density: 0 }, { height: 0.5, speed: 0.2, density: 1 }];

describe("seaMarkPath", () => {
  it("draws one closed curve of 64 segments", () => {
    expect(SEA_MARK_PATH).toMatch(/^M[\d.]+ [\d.]+(C[\d. ]+){64}Z$/);
    expect(seaMarkPath()).toBe(SEA_MARK_PATH);
  });

  it("moves with time but keeps the sea well inside the disc", () => {
    expect(seaMarkPath(1)).not.toBe(seaMarkPath(2));
    for (const motion of MOTIONS) {
      for (let t = 0; t < 120; t += 0.7) {
        for (const [, r] of rim(seaMarkPath(t, motion))) {
          expect(r).toBeGreaterThan(4);
          expect(r).toBeLessThan(8);
        }
      }
    }
  });

  it("never folds the rim over itself", () => {
    for (const motion of MOTIONS) {
      for (let t = 0; t < 120; t += 0.7) {
        const angles = rim(seaMarkPath(t, motion)).map(([a]) => a);
        let turns = 0;
        for (let i = 1; i < angles.length; i++) {
          let step = angles[i] - angles[i - 1];
          if (step < -Math.PI) step += 2 * Math.PI;
          expect(step).toBeGreaterThan(0);
          turns += step;
        }
        expect(turns).toBeLessThan(2 * Math.PI);
      }
    }
  });
});

describe("generated copies", () => {
  it("app/icon.svg matches the mark (run `npm run icons` after changing it)", () => {
    const svg = readFileSync(path.join(__dirname, "../../app/icon.svg"), "utf8");
    expect(svg).toContain(`d="${SEA_MARK_PATH}"`);
  });

  it("the boot splash script carries a working copy of seaMarkPath", () => {
    expect(() => new Function(bootSplashScript())).not.toThrow();
    const copy = new Function(`return (${seaMarkPath.toString()})`)() as typeof seaMarkPath;
    for (const t of [0, 0.5, 3.2, 47]) expect(copy(t)).toBe(seaMarkPath(t));
    expect(copy()).toBe(SEA_MARK_PATH);
  });
});
