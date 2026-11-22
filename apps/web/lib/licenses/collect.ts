// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Third-party notices for /licenses, read at build time (the page is static):
// every production dependency in package-lock.json with its license field and
// license files from node_modules, the two OFL fonts, and, in the Android
// build, the shell's own npm packages (apps/mobile) and the Maven libraries
// inside the app (lib/licenses/android-maven.ts). Server-side only: it reads the disk.
//
// Optional packages are left out: in this lockfile they are the platform
// binaries of the compiler (@next/swc-*) and of server image resizing (sharp,
// @img/*), which run at build time or on the server and never reach a browser
// or the app. Leaving them out also keeps the list the same on every machine.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { ANDROID_MAVEN_LIBRARIES, type MavenLibrary } from "@/lib/licenses/android-maven";

export type LicenseEntry = {
  name: string;
  version: string;
  /** SPDX expression from package.json (or the lockfile); null when the package declares none. */
  license: string | null;
  /** Repository or homepage, as an https URL. */
  url: string | null;
  /** The package's license and notice files, joined; null when it ships none. */
  text: string | null;
};

export type FontLicense = { name: string; copyright: string; url: string };

export type LicenseReport = {
  fonts: FontLicense[];
  /** The SIL Open Font License 1.1, shared by the fonts. */
  fontLicenseText: string;
  packages: LicenseEntry[];
};

/** The fonts loaded through next/font (app/fonts.ts). Both are OFL-1.1. */
export const FONTS: FontLicense[] = [
  {
    name: "Fraunces",
    copyright: "Copyright 2018 The Fraunces Project Authors (https://github.com/undercasetype/Fraunces)",
    url: "https://github.com/undercasetype/Fraunces",
  },
  {
    name: "Nunito",
    copyright: "Copyright 2014 The Nunito Project Authors (https://github.com/googlefonts/nunito)",
    url: "https://github.com/googlefonts/nunito",
  },
];

type LockPackage = { version?: string; license?: string; dev?: boolean; devOptional?: boolean; optional?: boolean };

const LICENSE_FILE = /^(licen[cs]e|copying|notice)([-._].*)?$/i;

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

/** Production, non-optional packages of a package-lock.json (v2/v3), by install path. */
export function productionPackages(lock: { packages?: Record<string, LockPackage> }): [string, LockPackage][] {
  return Object.entries(lock.packages ?? {}).filter(
    ([key, entry]) => key.startsWith("node_modules/") && !entry.dev && !entry.devOptional && !entry.optional,
  );
}

function httpsUrl(raw: unknown): string | null {
  const value =
    typeof raw === "string" ? raw : raw && typeof raw === "object" && "url" in raw ? (raw as { url: unknown }).url : null;
  if (typeof value !== "string") return null;
  const url = value.replace(/^git\+/, "").replace(/^git:\/\//, "https://").replace(/\.git$/, "");
  return url.startsWith("https://") ? url : null;
}

function declaredLicense(pkg: { license?: unknown; licenses?: unknown }): string | null {
  if (typeof pkg.license === "string" && pkg.license.trim()) return pkg.license.trim();
  if (Array.isArray(pkg.licenses)) {
    const types = pkg.licenses
      .map((item) => (item && typeof item === "object" && "type" in item ? (item as { type: unknown }).type : null))
      .filter((type): type is string => typeof type === "string");
    if (types.length > 0) return types.join(" OR ");
  }
  return null;
}

function licenseText(dir: string): string | null {
  let files: string[];
  try {
    files = readdirSync(dir).filter((file) => LICENSE_FILE.test(file)).sort();
  } catch {
    return null;
  }
  const texts = files
    .map((file) => readFileSync(path.join(dir, file), "utf8").replace(/\r\n?/g, "\n").trim())
    .filter((text) => text !== "");
  return texts.length > 0 ? texts.join("\n\n") : null;
}

function lockPackages(projectDir: string): [string, LockPackage][] {
  const lockFile = path.join(projectDir, "package-lock.json");
  return existsSync(lockFile) ? productionPackages(readJson(lockFile)) : [];
}

/** Production packages in a project's lockfile that are not installed in its node_modules. */
export function missingPackages(projectDir: string): string[] {
  return lockPackages(projectDir)
    .filter(([key]) => !existsSync(path.join(projectDir, key, "package.json")))
    .map(([key]) => key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length));
}

/** The packages of one project (a folder with package-lock.json and node_modules). */
export function projectLicenses(projectDir: string): LicenseEntry[] {
  const entries: LicenseEntry[] = [];
  for (const [key, lockEntry] of lockPackages(projectDir)) {
    const dir = path.join(projectDir, key);
    const name = key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length);
    let pkg: { version?: string; license?: unknown; licenses?: unknown; repository?: unknown; homepage?: unknown } = {};
    try {
      pkg = readJson(path.join(dir, "package.json"));
    } catch {
      // Not installed here: keep what the lockfile says.
    }
    entries.push({
      name,
      version: pkg.version ?? lockEntry.version ?? "",
      license: declaredLicense(pkg) ?? lockEntry.license ?? null,
      url: httpsUrl(pkg.repository) ?? httpsUrl(pkg.homepage),
      text: licenseText(dir),
    });
  }
  return entries;
}

function byName(a: LicenseEntry, b: LicenseEntry): number {
  return a.name.localeCompare(b.name, "en") || a.version.localeCompare(b.version, "en");
}

export type CollectOptions = {
  /** apps/mobile: set for the app builds (Android and iOS) only. */
  mobileDir?: string | null;
  /**
   * Also list the Maven libraries inside the Android app (default: yes, with
   * `mobileDir`). The iOS build says no: its native code is Capacitor's Swift
   * package, which is the `@capacitor/ios` npm package already listed.
   */
  androidLibraries?: boolean;
  /**
   * A release export (an https API base). Then a package of apps/mobile that is
   * not installed, or a missing Apache License text, fails the build; a
   * development export only warns.
   */
  release?: boolean;
  warn?: (message: string) => void;
};

/** The plain Apache License 2.0 text, borrowed from a package that ships it unchanged. */
function apacheLicenseText(entries: LicenseEntry[]): string | null {
  const found = entries.find(
    (entry) =>
      entry.license === "Apache-2.0" &&
      entry.text?.startsWith("Apache License") &&
      entry.text.includes("TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION"),
  );
  return found?.text ?? null;
}

/** One Maven library as a page entry: its artifacts, holder, NOTICE, then the license. */
export function mavenEntry(library: MavenLibrary, apacheText: string | null): LicenseEntry {
  const parts = [library.artifacts.join("\n"), `Copyright holder: ${library.holder}`];
  if (library.notice) parts.push(`NOTICE\n\n${library.notice}`);
  if (apacheText) parts.push(apacheText);
  return { name: library.name, version: "", license: library.license, url: library.url, text: parts.join("\n\n") };
}

/**
 * Everything /licenses lists. `webDir` is apps/web. For the app builds,
 * `mobileDir` adds the shell's npm packages and, for Android, the Maven libraries.
 */
export function collectLicenses(webDir: string, options: CollectOptions = {}): LicenseReport {
  const { mobileDir = null, androidLibraries = true, release = false, warn = console.warn } = options;
  const packages = projectLicenses(webDir);
  if (mobileDir) {
    const missing = missingPackages(mobileDir);
    if (missing.length > 0) {
      const message = `/licenses: not installed in ${mobileDir}/node_modules: ${missing.join(", ")}. Run npm ci in apps/mobile.`;
      if (release) throw new Error(message);
      warn(message);
    }
    const seen = new Set(packages.map((entry) => `${entry.name}@${entry.version}`));
    for (const entry of projectLicenses(mobileDir)) {
      if (!seen.has(`${entry.name}@${entry.version}`)) packages.push(entry);
    }
    if (androidLibraries) {
      const apache = apacheLicenseText(packages);
      if (!apache) {
        const message = "/licenses: no package ships the plain Apache License 2.0 text to show for the Maven libraries.";
        if (release) throw new Error(message);
        warn(message);
      }
      for (const library of ANDROID_MAVEN_LIBRARIES) packages.push(mavenEntry(library, apache));
    }
  }
  return {
    fonts: FONTS,
    fontLicenseText: readFileSync(path.join(webDir, "lib/licenses/ofl-1.1.txt"), "utf8").replace(/\r\n?/g, "\n").trim(),
    packages: packages.sort(byName),
  };
}
