// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { ANDROID_MAVEN_LIBRARIES } from "@/lib/licenses/android-maven";
import { collectLicenses, mavenEntry, missingPackages, productionPackages, projectLicenses } from "@/lib/licenses/collect";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APACHE = "Apache License\nVersion 2.0, January 2004\n\nTERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION\n...";

const made: string[] = [];
afterEach(() => {
  while (made.length) rmSync(made.pop()!, { recursive: true, force: true });
});

function write(file: string, content: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function project(packages: Record<string, object>, files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "ciclo-licenses-"));
  made.push(dir);
  write(path.join(dir, "package-lock.json"), JSON.stringify({ lockfileVersion: 3, packages: { "": {}, ...packages } }));
  for (const [file, content] of Object.entries(files)) write(path.join(dir, file), content);
  return dir;
}

describe("collecting third-party licenses", () => {
  it("keeps production packages only, not dev or optional ones", () => {
    const lock = {
      packages: {
        "": {},
        "node_modules/a": { version: "1.0.0" },
        "node_modules/b": { version: "1.0.0", dev: true },
        "node_modules/c": { version: "1.0.0", optional: true },
        "node_modules/d": { version: "1.0.0", devOptional: true },
        "node_modules/a/node_modules/e": { version: "2.0.0" },
      },
    };
    expect(productionPackages(lock).map(([key]) => key)).toEqual(["node_modules/a", "node_modules/a/node_modules/e"]);
  });

  it("reads the license field, the repository and the license files", () => {
    const dir = project(
      {
        "node_modules/a": { version: "1.0.0", license: "MIT" },
        "node_modules/@scope/b": { version: "2.0.0" },
        "node_modules/missing": { version: "3.0.0", license: "ISC" },
      },
      {
        "node_modules/a/package.json": JSON.stringify({ version: "1.0.0", license: "MIT", repository: "git+https://github.com/x/a.git" }),
        "node_modules/a/LICENSE": "MIT License\r\n\r\nCopyright (c) A\r\n",
        "node_modules/@scope/b/package.json": JSON.stringify({ version: "2.0.0", licenses: [{ type: "BSD-2-Clause" }] }),
        "node_modules/@scope/b/LICENSE-MIT": "first",
        "node_modules/@scope/b/NOTICE": "second",
        "node_modules/@scope/b/README.md": "not a license",
      },
    );
    expect(projectLicenses(dir)).toEqual([
      { name: "a", version: "1.0.0", license: "MIT", url: "https://github.com/x/a", text: "MIT License\n\nCopyright (c) A" },
      { name: "@scope/b", version: "2.0.0", license: "BSD-2-Clause", url: null, text: "first\n\nsecond" },
      { name: "missing", version: "3.0.0", license: "ISC", url: null, text: null },
    ]);
  });

  it("adds the Android shell's packages and the Maven libraries, with the Apache text and NOTICEs", () => {
    const web = project(
      { "node_modules/jsqr": { version: "1.4.0", license: "Apache-2.0" } },
      {
        "node_modules/jsqr/package.json": JSON.stringify({ version: "1.4.0", license: "Apache-2.0" }),
        "node_modules/jsqr/LICENSE": APACHE,
        "lib/licenses/ofl-1.1.txt": "OFL\r\n",
      },
    );
    const mobile = project(
      {
        "node_modules/@capacitor/android": { version: "8.6.2", license: "MIT" },
        "node_modules/jsqr": { version: "1.4.0", license: "Apache-2.0" },
      },
      {
        "node_modules/@capacitor/android/package.json": JSON.stringify({ version: "8.6.2", license: "MIT" }),
        "node_modules/@capacitor/android/LICENSE": "MIT License",
        "node_modules/jsqr/package.json": JSON.stringify({ version: "1.4.0", license: "Apache-2.0" }),
      },
    );
    expect(collectLicenses(web).packages.map((entry) => entry.name)).toEqual(["jsqr"]);
    const warn = vi.fn();
    const android = collectLicenses(web, { mobileDir: mobile, release: true, warn });
    expect(warn).not.toHaveBeenCalled();
    const names = android.packages.map((entry) => entry.name);
    expect(names).toContain("@capacitor/android");
    for (const library of ANDROID_MAVEN_LIBRARIES) expect(names).toContain(library.name);
    const cordova = android.packages.find((entry) => entry.name === "Apache Cordova Android framework");
    expect(cordova?.text).toContain("org.apache.cordova:framework:14.0.1");
    expect(cordova?.text).toContain("Copyright 2015-2020 The Apache Software Foundation");
    expect(cordova?.text).toContain(APACHE);
    expect(android.fontLicenseText).toBe("OFL");
  });

  it("fails a release export when an apps/mobile package is not installed, and only warns otherwise", () => {
    const web = project({}, { "lib/licenses/ofl-1.1.txt": "OFL" });
    const mobile = project({ "node_modules/@capacitor/android": { version: "8.6.2", license: "MIT" } }, {});
    expect(missingPackages(mobile)).toEqual(["@capacitor/android"]);
    expect(() => collectLicenses(web, { mobileDir: mobile, release: true, warn: () => {} })).toThrow(/@capacitor\/android/);
    const warn = vi.fn();
    const report = collectLicenses(web, { mobileDir: mobile, release: false, warn });
    // The missing package, and no Apache text to show for the Maven libraries.
    expect(warn).toHaveBeenCalledTimes(2);
    expect(report.packages.find((entry) => entry.name === "@capacitor/android")).toMatchObject({ license: "MIT", text: null });
  });

  it("joins a Maven library's artifacts, holder, NOTICE and license", () => {
    const entry = mavenEntry(
      { name: "X", holder: "X Authors", license: "Apache-2.0", url: "https://x.example", artifacts: ["a:b:1", "a:c:1"], notice: "N" },
      "LICENSE",
    );
    expect(entry).toEqual({
      name: "X",
      version: "",
      license: "Apache-2.0",
      url: "https://x.example",
      text: "a:b:1\na:c:1\n\nCopyright holder: X Authors\n\nNOTICE\n\nN\n\nLICENSE",
    });
  });

  it("lists this app's real dependencies and both fonts", () => {
    const report = collectLicenses(webRoot);
    const names = report.packages.map((entry) => entry.name);
    for (const name of ["next", "react", "react-dom", "@noble/hashes", "@scure/bip39", "@capacitor/core"]) {
      expect(names).toContain(name);
    }
    for (const name of ["vitest", "typescript", "eslint", "sharp"]) expect(names).not.toContain(name);
    expect(report.packages.find((entry) => entry.name === "react")?.text).toMatch(/MIT License/);
    expect(report.fonts.map((font) => font.name)).toEqual(["Fraunces", "Nunito"]);
    expect(report.fontLicenseText).toContain("SIL OPEN FONT LICENSE Version 1.1");
    expect(report.fontLicenseText).not.toContain("\r");
  });
});
