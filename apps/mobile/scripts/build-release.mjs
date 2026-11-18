// Google Play bundle: `CICLO_API_BASE=https://www.openciclo.com npm run build:release`.
//
// Exports the web app for that host (apps/web `build:android`, which also writes
// build-info.json), copies it into the Android project (`cap sync android`), and runs
// `gradlew bundleRelease`, whose release guard checks the export once more.
//
// CICLO_API_BASE must come from the environment of this command: a release never
// takes it from a .env file or a default. The bundle is signed with the upload key
// from android/keystore.properties or the CICLO_UPLOAD_* variables. See
// docs/android.md, "Release builds".

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const mobileDir = path.resolve(import.meta.dirname, "..");
const androidDir = path.join(mobileDir, "android");
const windows = process.platform === "win32";

function fail(message) {
  console.error(`build:release: ${message}`);
  process.exit(1);
}

const apiBase = process.env.CICLO_API_BASE;
if (!apiBase) {
  fail("CICLO_API_BASE is not set. Run it as CICLO_API_BASE=https://www.openciclo.com npm run build:release.");
}
let apiUrl;
try {
  apiUrl = new URL(apiBase);
} catch {
  fail(`CICLO_API_BASE is not a URL: "${apiBase}".`);
}
if (apiUrl.protocol !== "https:") {
  fail(`CICLO_API_BASE must be an https origin, got "${apiBase}".`);
}

// Gradle checks the key itself (verifyReleaseSigning); this only saves a full export
// when there is plainly no key to sign with.
const uploadKeyVariables = [
  "CICLO_UPLOAD_STORE_FILE",
  "CICLO_UPLOAD_STORE_PASSWORD",
  "CICLO_UPLOAD_KEY_ALIAS",
  "CICLO_UPLOAD_KEY_PASSWORD",
];
if (!existsSync(path.join(androidDir, "keystore.properties"))) {
  const missing = uploadKeyVariables.filter((name) => !process.env[name]);
  if (missing.length === uploadKeyVariables.length) {
    fail("no upload key. Create android/keystore.properties or set the CICLO_UPLOAD_* variables (docs/android.md).");
  }
  if (missing.length > 0) {
    fail(`set all four CICLO_UPLOAD_* variables or none. Missing: ${missing.join(", ")}.`);
  }
}

try {
  if (execFileSync("git", ["status", "--porcelain"], { cwd: mobileDir, encoding: "utf8" }).trim()) {
    console.warn("build:release: the working tree has uncommitted changes. They go into the bundle, but build-info.json names HEAD only.");
  }
} catch {
  // The release guard reports a missing git on its own.
}

function run(command, args, cwd) {
  const parts = [command, ...args];
  console.log(`\n> ${parts.join(" ")}`);
  // npm, npx and gradlew.bat are batch files on Windows, which Node starts only through
  // cmd.exe. Quote what has spaces (a user folder, for one).
  const result = windows
    ? spawnSync(parts.map((part) => (/\s/.test(part) ? `"${part}"` : part)).join(" "), { cwd, stdio: "inherit", shell: true })
    : spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npm", ["--prefix", "../web", "run", "build:android"], mobileDir);
run("npx", ["cap", "sync", "android"], mobileDir);
// A full path: cmd.exe may be set not to run programs from the current folder.
run(path.join(androidDir, windows ? "gradlew.bat" : "gradlew"), ["bundleRelease"], androidDir);
console.log(`\nBundle: ${path.join(androidDir, "app", "build", "outputs", "bundle", "release", "app-release.aab")}`);
