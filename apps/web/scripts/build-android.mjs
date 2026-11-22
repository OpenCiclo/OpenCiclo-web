// Static export for the apps (apps/mobile): `npm run build:android` writes out-android,
// `npm run build:ios` writes out-ios (CICLO_TARGET picks; Android when unset).
//
// Besides `next build`, it writes <out>/build-info.json: the target, the API host baked
// into the bundle, the git commit, and the version from apps/mobile/version.json.
// `cap sync` copies the file into the app's assets, and the release guards (Gradle's
// verifyReleaseBuildInfo in apps/mobile/android/app/build.gradle, and
// apps/mobile/ios/scripts/verify-build-info.sh in Xcode) refuse to package an export
// whose info is missing, local, stale, of another version, or (iOS) of another target
// (docs/android.md "Release builds", docs/ios.md).
//
// The script owns CICLO_API_BASE: it resolves it the way `next build` would (the
// process environment first, then .env.production.local, .env.local, .env.production
// and .env, through the same @next/env copy Next uses) and hands `next build` that
// exact value, so next.config.ts bakes the string written to build-info.json. (The npm
// script runs it under dotenv-cli, which puts .env in the process environment first, as
// `build:android` always did.)

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const target = process.env.CICLO_TARGET ?? "android";
if (target !== "android" && target !== "ios") {
  console.error(`CICLO_TARGET must be "android" or "ios", got "${target}"`);
  process.exit(1);
}

const webDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(webDir, `out-${target}`);
const buildInfoFile = path.join(outDir, "build-info.json");
const versionFile = path.resolve(webDir, "../mobile/version.json");

// Same as next.config.ts androidApiBase(): the local stack, never production.
const DEFAULT_API_BASE = "http://localhost:3000";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = createRequire(require.resolve("next/package.json"))("@next/env");

const shellEnv = { ...process.env };
loadEnvConfig(webDir, false, { info() {}, error: console.error });
const apiBase = process.env.CICLO_API_BASE ?? DEFAULT_API_BASE;

// A failed or interrupted build must not leave the previous build's info behind.
rmSync(buildInfoFile, { force: true });

const build = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  cwd: webDir,
  // Next loads the .env files again itself; the explicit value wins over all of them.
  env: { ...shellEnv, CICLO_TARGET: target, CICLO_API_BASE: apiBase },
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

let commit = null;
try {
  commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: webDir, encoding: "utf8" }).trim();
} catch {
  console.warn("build-info.json: git rev-parse HEAD failed. A release build will refuse this export.");
}

const { versionCode, versionName } = JSON.parse(readFileSync(versionFile, "utf8"));
const info = { target, apiBase, commit, versionCode, versionName };
writeFileSync(buildInfoFile, `${JSON.stringify(info, null, 2)}\n`);
console.log(`Wrote ${path.relative(webDir, buildInfoFile)}: ${JSON.stringify(info)}`);
