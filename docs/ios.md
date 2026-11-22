# iOS app

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

Ciclo for iOS is the web app packaged as an iOS app, the same way as the Android app. Read [android.md](android.md) first: this page only says what is different.

**Status (2026-11-22): written on Windows, never compiled.** Swift, the storyboards, and the Xcode project file were written by hand without Xcode. The TypeScript side is checked (types, lint, tests, a real `build:ios` export, `cap sync ios`). Expect small compile errors on the first Xcode build. The section [First session on a Mac](#first-session-on-a-mac) is the work list.

## How it is built

```text
apps/web     npm run build:ios   →  apps/web/out-ios/            (static export)
apps/mobile  cap sync ios        →  ios/App/App/public           (copied, not in git)
Xcode        ios/App/App.xcodeproj  →  the app
```

- `npm run build:ios` (in `apps/web`) sets `CICLO_TARGET=ios`. It is the Android export with another target: the same `page.android.tsx` / `layout.android.tsx` routes, written to `out-ios`, with `NEXT_PUBLIC_CICLO_TARGET=ios` baked in.
- `apps/web/lib/app-target.ts` has three flags. `IS_NATIVE_APP` is true in both apps and guards almost everything (phone layout, on-device storage, native HTTP, share sheet, swipes). `IS_ANDROID_APP` and `IS_IOS_APP` are for what only one system has.
- `apps/mobile/capacitor.config.ts` picks the export from the platform named on the command line. Always name it: `npx cap sync ios`, never a bare `npx cap sync`.
- `npm run build:ios` in `apps/mobile` does all of it: the export, the version numbers, `cap sync ios`.
- The Xcode project uses Swift Package Manager (Capacitor 8's default). There is no CocoaPods step.
- Version: `apps/mobile/version.json` is still the only source. `scripts/sync-ios-version.mjs` writes it into the Xcode project (`versionName` → version, `versionCode` → build number).

## What differs from Android

| Topic | Android | iOS |
| --- | --- | --- |
| Native plugin | `DeviceVaultPlugin.java` | `ios/App/App/DeviceVaultPlugin.swift`: same methods, same error codes |
| Host activity | `MainActivity.java` | `ios/App/App/CicloViewController.swift` |
| WebView origin | `https://localhost` | `capacitor://localhost` (allowed for sign-out in `lib/server/http.ts`) |
| Client header | `x-ciclo-client: android/<versionCode>` | `ios/<versionCode>`; never refused, `MIN_ANDROID_VERSION_CODE` is about Android |
| Key storage | Android Keystore key per file | A random AES-256 key per file, kept in the Keychain (this device only) |
| App lock | Fingerprint or screen lock | Face ID, Touch ID or the passcode (`.userPresence`) |
| Screenshots | `FLAG_SECURE` with the app lock | Cannot be blocked on iOS. The app switcher is always covered. |
| Back button | `window.cicloBack()` | None. Sheets close with their own controls. |
| Old WebView page | `webview-update.html` guard | Not used. The deployment target is iOS 16.4, the oldest WebKit the bundle runs on. |
| Store link | Google Play | `APP_STORE_URL` in `lib/app-target.ts`, null until the app has an App Store id |
| Safe areas | Not handled yet | `viewport-fit=cover`; `--safe-top` in `globals.css` keeps the top clear |

### Storage

Files live in `Library/Application Support/CicloVault/`, excluded from backups. Names and formats are the Android ones (`device-diary.json`, `device-phrase.bin`, `hosted-phrase.bin`, `pending-signup.bin`, `hosted-diary-copy.json`).

A sealed file (phrase, pending sign-up) is: format byte `2`, mode byte, alias length, alias, nonce length, nonce, AES-GCM ciphertext and tag. The alias names the Keychain item (service `com.openciclo.app.vault-keys`) that holds the key. As on Android, a write makes a new key under a new alias, and the old keys go only once the new file reads back.

- Keys without a check: `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`.
- The app-lock key: `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` with `.userPresence`. iOS deletes it when the passcode is turned off; the app then reports `KEY_INVALIDATED` and asks for the 12 words.
- Keychain items survive an uninstall; the files do not. A leftover key opens nothing.

### Wording

Texts that name Google Play, the fingerprint, or the screen lock have an iOS wording: key `<name>Ios`, right after the key it replaces in every language file, listed in `lib/locales/ios-copy.ts`. `messagesFor` swaps them in the iOS build. They are machine translations like the rest.

### Clipboard

`copySensitive` keeps the phrase off Universal Clipboard (`localOnly`) and gives it a two-minute life. `clearCopied` empties the clipboard only if nothing was copied since (same change count), without reading it.

## Run it

You need a Mac with Xcode 16 or later, Node 24, and the repository.

```sh
cd apps/web && npm ci
cd ../mobile && npm ci
```

**Simulator, local stack** (the simulator reaches the Mac's `localhost`):

```sh
docker compose up -d db mailpit          # repo root
cd apps/web && npm run dev               # needs .env.local, see README
cd apps/mobile && npm run build:ios && npm run open:ios
```

Then pick a simulator in Xcode and press Run.

**A real iPhone.** `localhost` on a phone is the phone. Build against production instead:

```sh
cd apps/mobile && CICLO_API_BASE=https://www.openciclo.com npm run build:ios && npm run open:ios
```

In Xcode: target **App** → **Signing & Capabilities** → choose a team. A free Apple ID works for seven days per install; the Apple Developer Program removes that limit and is needed for TestFlight. Production has real users: test with a throwaway account, or with "Only on this device".

**Debugging the page.** `ios/debug.xcconfig` makes debug builds inspectable: Safari on the Mac → Develop → the device → Ciclo.

**Release guard.** A Release build runs `ios/scripts/verify-build-info.sh`. It fails unless the export is an iOS export, names an https host that is not local, was built from `HEAD`, and has the Xcode project's version. Same rule as Gradle's `verifyReleaseBuildInfo`: fix the export, never the guard.

## Building in the cloud with EAS

Expo's build service (EAS Build) has Macs. Ciclo is not an Expo app, so it uses a custom build config instead of Expo's own steps: `apps/mobile/eas.json`, `apps/mobile/.eas/build/*.yml`, and a minimal `apps/mobile/app.json` that only names the EAS project.

```sh
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile ios-simulator
```

- `ios-simulator` exports the web app, runs `cap sync ios`, and compiles for the simulator, unsigned. It needs no Apple account. Use it to see compiler errors without a Mac. The `.app` it uploads runs only on a Mac's simulator, not on an iPhone.
- A build for a real iPhone needs signing, and EAS can only sign with a paid Apple Developer Program account. There is no profile for it yet.
- Run EAS commands from `apps/mobile`. The whole repository is uploaded (the job needs `apps/web`).
- Do not run `create-expo-app` or `expo prebuild` here: they would create a React Native app next to this one.

Not run yet (2026-11-22): the first build may need the config adjusted (where the job starts, the artifact path).

## First session on a Mac

For whoever picks this up (a person or a coding agent). Work on branch `feat/ios-capacitor`. Read `agents.txt` first.

### 1. Make it compile

```sh
cd apps/mobile && npm ci && (cd ../web && npm ci)
npm run build:ios
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Fix what the compiler reports. Likely places, all written blind:

- `DeviceVaultPlugin.swift`: Keychain dictionary types, `LAContext` use, `UIPasteboard.setItems` options, `CAPPluginCall` accessors.
- `CicloViewController.swift`: the `capacitorDidLoad` override, key-value observation of `isLoading`.
- `App.xcodeproj/project.pbxproj`: the three files and the build phase added by hand (ids start with `C1C1000`). If Xcode cannot open the project, restore the template with `git show` of Capacitor's version and add `CicloViewController.swift`, `DeviceVaultPlugin.swift` and `PrivacyInfo.xcprivacy` to the App target in Xcode, plus a first build phase that runs `/bin/sh "${SRCROOT}/../scripts/verify-build-info.sh"`.
- `Base.lproj/LaunchScreen.storyboard`: written by hand. If Interface Builder rejects it, rebuild it: background color `BrandBackground`, image `SplashMark` 160×160 centred.
- There is no shared scheme in git. `xcodebuild -list` shows what Xcode generates; if `App` is missing, open the project once in Xcode.

Once it compiles, the CI job `ios` in `.github/workflows/ci.yml` should pass too.

### 2. Check on the simulator, then on the iPhone

Nothing below has run yet. Go through it in this order.

1. **Start.** Launch screen (mark on the page background, light and dark), then the moving web splash, with no white flash and no jump of the mark between the two.
2. **Layout.** Nothing under the status bar or the camera island; the tab bar sits above the home indicator; sheets reach the bottom edge. Scroll Calendar, Patterns, Learn, Settings. On Learn, scroll until the compact filter bar appears: it should sit below the status bar (the scroll threshold in `learn-index.tsx` does not know about `--safe-top` yet).
3. **"Only on this device".** Create a diary, log a day, kill the app, open it again: the diary is there and opens by itself.
4. **App lock** (real iPhone for Face ID; the simulator has Features → Face ID). Turn it on in Settings: the system asks once. Background the app for more than 30 seconds: it asks again. Cancel: the lock screen says so and offers the phrase. Turn it off.
5. **App switcher.** Swipe up: the card shows the mark, not the diary.
6. **Hosted account** (local stack on the simulator). Email sign-up with the code from Mailpit (`http://localhost:8025`); kill the app while waiting for the code and reopen: it resumes on the code step. Sign in with "Keep me signed in", kill, reopen: still signed in. Sign out.
7. **Offline.** Signed in and kept: stop `npm run dev`, reopen the app: the read-only copy opens. Start the server again: editing comes back. Sign out while offline, then check the session cookie is gone (sign in again is required).
8. **Export.** Settings → export JSON and CSV: the share sheet opens with the file. On an iPad it must not crash (popover).
9. **Phrase.** Copy the phrase in onboarding, paste it in Notes; about a minute later the clipboard is empty. Scan the phrase QR: iOS asks for the camera once, and the scanner shows the picture.
10. **Theme.** Settings → dark while the system is light: the status bar text turns light and the keyboard dark.
11. **Swipes.** Calendar month swipe, day sheet drag-to-close, Learn article drag-to-close, phase card drag-up.
12. **Links.** A link to a web-only page (`/delete-account` from the privacy policy) opens Safari, not the WebView.
13. **Text fields.** Tapping a field does not zoom the page; the keyboard does not cover the field being typed in.

### 3. Known gaps and decisions for the owner

- `APP_STORE_URL` is null, so the "update" notices have text and no button on iOS.
- Usage texts in `Info.plist` (camera, Face ID) are English only. Localizing them needs `InfoPlist.strings` per language.
- `PrivacyInfo.xcprivacy` declares no collected data types. Fill it in with the App Store privacy answers.
- Export compliance: the app encrypts with standard algorithms (AES-GCM, Ed25519, PBKDF2). `ITSAppUsesNonExemptEncryption` is not set; decide it when the first build goes to App Store Connect.
- The privacy policy, `/delete-account`, the Help articles and the store listing talk about Android and Google Play only. They need an iOS pass before a public release.
- The app icon is the sea on a full dark square (`renderSquareIcon` in `apps/web/scripts/brand-icons.mjs`). A design choice to confirm.
- iPad runs the phone layout, like Android tablets.
- No "swipe from the edge to go back" gesture.
- Pinch zoom is off in the iOS app (`maximumScale: 1`), to stop WebKit zooming into small text fields.

## Before the App Store

1. Apple Developer Program membership, and the app created in App Store Connect with bundle id `com.openciclo.app`.
2. Set `APP_STORE_URL`.
3. The gaps above.
4. Archive in Xcode from an export made with `CICLO_API_BASE=https://www.openciclo.com npm run build:ios` at a clean `HEAD`, then upload to TestFlight.
