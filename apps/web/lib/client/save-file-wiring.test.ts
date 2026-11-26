// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// In the Android app a file can be saved on the phone or shared, and the person
// chooses (components/save-file-dialog.tsx). A screen that called the share
// sheet by itself would bring back "I can only send it, not keep it". This
// reads the sources: only the two files that make up the choice may hand a
// file over.

const WEB = fileURLToPath(new URL("../..", import.meta.url));
const ALLOWED = new Set(["lib/client/save-file.ts", "components/save-file-dialog.tsx", "lib/device-vault.ts"]);

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("handing a file to the person", () => {
  const files = ["app", "components", "lib"].flatMap((dir) => sources(join(WEB, dir)));

  it("goes through useSaveFile on every screen", () => {
    const direct = files
      .map((path) => relative(WEB, path).replaceAll("\\", "/"))
      .filter((path) => !ALLOWED.has(path))
      .filter((path) => /\b(shareFile|saveToDevice|downloadFile)\s*\(|deviceVault\.saveFile/.test(readFileSync(join(WEB, path), "utf8")));
    expect(direct).toEqual([]);
  });

  it("is used by the screens that export", () => {
    for (const path of ["app/settings/page.tsx", "app/onboarding/page.tsx", "components/screen-error.tsx"]) {
      const source = readFileSync(join(WEB, path), "utf8");
      expect(source, path).toMatch(/useSaveFile\(t\)/);
      expect(source, path).toContain("{saveFileDialog}");
    }
  });

  it("asks before sharing or saving in the app, and downloads on the web", () => {
    const dialog = readFileSync(join(WEB, "components/save-file-dialog.tsx"), "utf8");
    expect(dialog).toContain("if (!SAVE_ASKS_WHERE)");
    expect(dialog).toMatch(/choice === "device"[\s\S]*saveToDevice/);
    expect(dialog).toMatch(/choice === "share"[\s\S]*shareFile/);
  });
});
