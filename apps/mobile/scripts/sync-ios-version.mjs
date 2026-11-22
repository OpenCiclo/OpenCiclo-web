// Copies the app version from version.json into the Xcode project, so iOS and Android
// builds carry the same numbers: versionName -> MARKETING_VERSION (CFBundleShortVersionString),
// versionCode -> CURRENT_PROJECT_VERSION (CFBundleVersion). `npm run build:ios` runs it;
// the release guard (ios/scripts/verify-build-info.sh) fails when they differ.
// `--check` changes nothing and exits 1 when the project is out of step (CI).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const mobileDir = path.resolve(import.meta.dirname, "..");
const projectFile = path.join(mobileDir, "ios/App/App.xcodeproj/project.pbxproj");
const { versionCode, versionName } = JSON.parse(readFileSync(path.join(mobileDir, "version.json"), "utf8"));

if (!Number.isInteger(versionCode) || versionCode < 1) throw new Error("version.json: versionCode must be a positive integer");
if (typeof versionName !== "string" || !/^\d+(\.\d+){0,2}$/.test(versionName)) {
  // Apple accepts up to three dot-separated numbers in CFBundleShortVersionString.
  throw new Error(`version.json: versionName must be one to three numbers with dots for iOS, got "${versionName}"`);
}

const before = readFileSync(projectFile, "utf8");
const after = before
  .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${versionName};`)
  .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`);

if (after === before) {
  console.log(`iOS project already at ${versionName} (${versionCode}).`);
} else if (process.argv.includes("--check")) {
  console.error(`The Xcode project does not carry version ${versionName} (${versionCode}). Run node scripts/sync-ios-version.mjs in apps/mobile.`);
  process.exit(1);
} else {
  writeFileSync(projectFile, after);
  console.log(`iOS project set to ${versionName} (${versionCode}).`);
}

// The EAS CLI only looks for ios/*.xcodeproj, so apps/mobile/eas keeps a copy of the
// project file for it (docs/ios.md, "Building in the cloud with EAS"). Keep it identical.
const easCopy = path.join(mobileDir, "eas/ios/App.xcodeproj/project.pbxproj");
const sameText = (a, b) => a.replace(/\r\n/g, "\n") === b.replace(/\r\n/g, "\n");
if (existsSync(easCopy) && !sameText(readFileSync(easCopy, "utf8"), after)) {
  if (process.argv.includes("--check")) {
    console.error("apps/mobile/eas/ios/App.xcodeproj/project.pbxproj differs from the Xcode project. Run node scripts/sync-ios-version.mjs in apps/mobile.");
    process.exit(1);
  }
  writeFileSync(easCopy, after);
  console.log("Copied the Xcode project file to apps/mobile/eas for the EAS CLI.");
}
