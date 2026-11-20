// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ANDROID_MAVEN_LIBRARIES } from "@/lib/licenses/android-maven";

const androidDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../mobile/android");
const artifacts = ANDROID_MAVEN_LIBRARIES.flatMap((library) => library.artifacts);

function versionOf(coordinate: string): string | undefined {
  return artifacts.find((artifact) => artifact.startsWith(`${coordinate}:`))?.split(":")[2];
}

describe("Maven libraries listed on the Android /licenses page", () => {
  it("lists each artifact once, as group:artifact:version", () => {
    for (const artifact of artifacts) expect(artifact.split(":"), artifact).toHaveLength(3);
    const coordinates = artifacts.map((artifact) => artifact.split(":").slice(0, 2).join(":"));
    expect(new Set(coordinates).size).toBe(coordinates.length);
  });

  it("includes the libraries the app is known to ship", () => {
    for (const coordinate of [
      "org.apache.cordova:framework",
      "org.jetbrains.kotlin:kotlin-stdlib",
      "org.jetbrains.kotlinx:kotlinx-coroutines-core",
      "org.jetbrains.kotlinx:kotlinx-coroutines-android",
      "org.jetbrains:annotations",
      "com.google.guava:listenablefuture",
      "org.jspecify:jspecify",
      "androidx.webkit:webkit",
      "androidx.biometric:biometric",
    ]) {
      expect(versionOf(coordinate), coordinate).toBeDefined();
    }
    const cordova = ANDROID_MAVEN_LIBRARIES.find((library) => library.artifacts.some((a) => a.startsWith("org.apache.cordova:")));
    expect(cordova?.notice).toContain("The Apache Software Foundation");
  });

  // Bumping a version in the Android project without regenerating the list
  // (see the header of android-maven.ts) fails here.
  it("matches the versions the Android project declares", () => {
    const variables = readFileSync(path.join(androidDir, "variables.gradle"), "utf8");
    const declared = (name: string) => variables.match(new RegExp(`${name}\\s*=\\s*'([^']+)'`))?.[1];
    const expected: Record<string, string | undefined> = {
      "androidx.activity:activity": declared("androidxActivityVersion"),
      "androidx.appcompat:appcompat": declared("androidxAppCompatVersion"),
      "androidx.coordinatorlayout:coordinatorlayout": declared("androidxCoordinatorLayoutVersion"),
      "androidx.core:core": declared("androidxCoreVersion"),
      "androidx.fragment:fragment": declared("androidxFragmentVersion"),
      "androidx.core:core-splashscreen": declared("coreSplashScreenVersion"),
      "androidx.webkit:webkit": declared("androidxWebkitVersion"),
      "org.apache.cordova:framework": declared("cordovaAndroidVersion"),
    };
    const app = readFileSync(path.join(androidDir, "app/build.gradle"), "utf8");
    expected["androidx.biometric:biometric"] = app.match(/androidx\.biometric:biometric:([^"']+)/)?.[1];
    for (const [coordinate, version] of Object.entries(expected)) {
      expect(version, `${coordinate} in the Gradle files`).toBeDefined();
      expect(versionOf(coordinate), coordinate).toBe(version);
    }
  });
});
