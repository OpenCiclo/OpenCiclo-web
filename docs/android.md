# Android app

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

Ciclo for Android is the web app packaged as an Android app. It is in development and not on Google Play yet.

## Why Capacitor

Capacitor wraps a web bundle in an Android WebView and gives it native plugins. We chose it over a rewrite for two reasons:

- **Same design.** The app runs the same React components and CSS as the web, so screens match by construction.
- **One implementation of the risky code.** Wallet derivation (BIP39, HKDF, Ed25519), AES-GCM, the forecast port (checked against the Python fixtures), and the vault merge (`mergeDiaryEdits`) exist once, in TypeScript. A Kotlin or React Native rewrite would duplicate them, and two copies drift.

Native code is only for what the web cannot do well: secure key storage, biometrics, files, and the share sheet.

## How it is built

```text
apps/web   npm run build:android   →  apps/web/out-android/   (static export)
apps/mobile  cap sync android      →  android/app/src/main/assets/public
```

- `npm run build:android` sets `CICLO_TARGET=android`. `next.config.ts` then exports static HTML and only treats `page.android.tsx` and `layout.android.tsx` as routes.
- Most Android routes re-export the web page next to them, so a screen change ships to both.
- API routes, the landing page, the operator console, and `/dev-*` have no Android twin. They stay web-only.
- Learn ships the articles in `lib/learn/content`. Edits made in the operator console reach the app with the next release.
- Help is prerendered from `content/help/`.

## Talking to the server

The app is served from `https://localhost` on the phone. The API lives on the Ciclo host.

- Client code calls the API through `apiFetch()` (`lib/client/http.ts`), which builds the URL with `apiUrl()` (`lib/app-target.ts`). On the web the base is empty, so nothing changes there.
- Every request gives up after 20 seconds. Android's native HTTP has no timeout of its own, so a connection that opens and never answers would otherwise leave the app waiting forever. A save that timed out but reached the host shows up as a 409 on the next try and merges.
- Every request says which client sent it: `x-ciclo-client: android/<versionCode>`. If the host sets `MIN_ANDROID_VERSION_CODE`, it answers older builds with 426. The app then keeps an open hosted diary readable, saves nothing, and shows **Update Ciclo** with a Google Play link.
- The Android build bakes the host from `CICLO_API_BASE`. It defaults to `http://localhost:3000`, the local stack. Release builds must pass the production origin, for example `CICLO_API_BASE=https://www.openciclo.com`.
- `CapacitorHttp` sends `fetch` through Android's HTTP stack with the app's own cookie store. The session cookie stays `httpOnly` and `SameSite=Lax`. The server needs no CORS headers.

## Keep me signed in (hosted accounts)

On the web, "Keep me signed in" leaves the 12-word phrase in `localStorage`. In the app it never touches WebView storage.

- **Where it goes.** `lib/client/phrase-store.ts` picks the store: `browserPhraseStore` on the web, `androidPhraseStore` in the app. The app seals the phrase with AES-GCM under its own Keystore key (`ciclo-hosted-phrase-v1`, StrongBox when available) in `files/hosted-phrase.bin`. That is separate from the on-device diary's phrase, so signing out never touches an on-device diary.
- **No app lock.** The key needs no fingerprint, like a browser that keeps you signed in. What changes is that a copy of the app's files no longer holds the phrase: the key cannot leave the phone.
- **Off.** With the box unchecked, the phrase stays in memory only. Closing the app signs out.
- **Older versions.** They kept the phrase in `localStorage`. The first start after the update seals it, reads it back, and only then deletes the plaintext. If Keystore fails, the plaintext stays and the next start tries again. WebView's storage engine may keep the deleted bytes on disk until it compacts its files.
- **Failures.** If Keystore cannot seal the phrase, the person stays signed in and the next start asks for the phrase; there is no plaintext fallback. If it cannot open the file, the start screen shows and the file stays until the next sign-in replaces it. Sign-out fails if the sealed phrase may still be there.

## Offline copy (hosted accounts)

With "Keep me signed in" on, the app keeps a copy of the hosted diary on the phone, so it can still show it without a connection. Reading only: nothing can be saved until the host answers again.

- **What it is.** `files/hosted-diary-copy.json` (`lib/hosted-copy.ts`, `readHostedCopy` / `writeHostedCopy` / `clearHostedCopy` in `DeviceVaultPlugin.java`, `AtomicFile`). It holds the same sealed blob the host stores, the host's vault version, and when it was last in step with the host. It opens only with the phrase sealed in Keystore. It is not a device diary: `status()` and `readDiary()` never look at it.
- **When it is written.** After every load from the host and every successful save (`hydrate` and `saveMerged` in `ciclo-context.tsx`). Best effort: a failed write never fails the save.
- **When it opens.** At start, if signing in or loading the vault fails for any reason but "no account" (no connection, server error, Neon down). A copy the phrase cannot decrypt (another account, damaged) is deleted and the start screen shows **Try again**, as before.
- **Read-only.** It opens through `offlineBackend()`, whose `save` throws `OfflineError`, and the context sets `offline`. `persistDiary`, moving to the device, password change, sign-out, and account delete refuse while it is open: the host may hold newer edits, and moving to the device would delete the account after copying an old diary. The UI shows `OfflineNotice` on Calendar, Patterns, and Settings, and the day sheet opens read-only. Changing the language while offline changes the screen only.
- **Back online.** The `online` event, the app returning to the front, or **Try again** run the normal sign-in again (one at a time). The host's diary replaces the copy and editing comes back. Nothing was edited offline, so there is nothing to merge.
- **When it is deleted.** Sign-out, account delete, moving to the device, creating a device diary, and any sign-in without "Keep me signed in". A host that answers "no account" leaves it in place (like the phrase) but never shows it.
- **Not on the web.** The browser keeps no copy of the diary.

## Back button

`MainActivity` asks the page first (`window.cicloBack`, `lib/client/android-back.ts`):

- An open sheet or dialog closes. Back sends the Escape key that each one already listens for, so a new overlay must close on Escape too. Confirmations use the app's own dialog (`useConfirmDialog`), never `window.confirm`, whose buttons the WebView draws in English; it takes Escape first, so Back closes the dialog and not the sheet under it.
- Onboarding goes back one step (`useBackStep`).
- On the lock screen of an on-device diary, the app leaves.
- Otherwise the WebView goes back in history. At the first screen, Android's default runs and the app goes to the background.

Sign-in forms (onboarding, unlock) leave with `returnTo()` (`lib/client/back-navigation.ts`). It pops back to the screen the form came from, so Back does not reopen the form after signing in.

## On-device mode

"Only on this device" keeps the diary on the phone with no account. User-facing explanation: Help → `android-on-device`.

- **Same vault, different backend.** `ciclo-context.tsx` loads and saves through a `VaultBackend` (`lib/client/api.ts`): `hostedVault` (the API) or the device backend (`lib/device-vault.ts`). Both keep the compare-and-set contract, so `saveMerged` and `mergeDiaryEdits` are unchanged. The device file stores the same sealed blob plus a version counter.
- **Native side.** `DeviceVaultPlugin.java` in `apps/mobile` does file I/O, Keystore, the fingerprint / screen-lock prompt, `FLAG_SECURE`, and the share sheet. It never sees the plaintext diary. TypeScript reaches it through `lib/client/device-storage.ts`, loaded with `import()` only when `IS_ANDROID_APP`.
- **Files.** `files/device-diary.json` (sealed blob) and `files/device-phrase.bin` (phrase sealed with AES-GCM by a Keystore key), written with `AtomicFile`. A damaged diary file throws instead of reading as empty, so a save never replaces it.
- **One diary per install.** While a device diary exists, a phrase opens that file and never signs in to a host (that would create an empty hosted account). Creating or moving to a device diary refuses if one exists.
- **App lock.** Optional, Android 11+. The phrase is re-sealed with a key that needs a fingerprint or screen-lock check on every use. The app also locks after 30 s in the background (`visibilitychange`) and sets `FLAG_SECURE`. If the check is canceled or the key is invalidated (new fingerprint), `DeviceLockGate` offers to retry or to type the phrase on `/unlock`.
- **Moving.** Device → hosted creates the account with an empty diary, saves the device diary on top (or merges it into an existing hosted diary like an import), then deletes the device files. Hosted → device (`lib/client/move-to-device.ts`) copies the host's latest diary, then deletes the hosted account only at that version, so a save from another device in the meantime stops the move. If the host refuses the delete, the device files are removed again. If its answer is lost, the device files stay, because the delete may have happened. Settings then says the server copy may still exist and how to delete it.
- **Export.** `saveFile()` (`lib/client/save-file.ts`) opens the share sheet in the app and downloads on the web. The plaintext export is written to `cache/exports`, cleared on the next export and on app start.

## Run it on a phone

You need Android Studio, a JDK 21, Node 24, Docker, and a phone with USB debugging on.

Capacitor 8 uses Gradle 8.14, which does not run on Java 25. Android Studio bundles Java 25, so point Gradle at a JDK 21. In Android Studio: Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK. From a terminal, set `JAVA_HOME` to the JDK 21 folder and `ANDROID_HOME` to the Android SDK (on Windows, `%LOCALAPPDATA%\Android\Sdk`). Android Studio writes the SDK path to `android/local.properties` on its own.

1. Start the database and the mail catcher from the repo root:

   ```bash
   docker compose up -d db mailpit
   ```

2. Start the web app with `apps/web/.env.local` (copy `.env.template` and fill in the local values from `docker-compose.yml`):

   ```bash
   cd apps/web && npm run dev
   ```

3. Let the phone reach port 3000 on this computer over USB:

   ```bash
   adb reverse tcp:3000 tcp:3000
   ```

4. Build and install the app:

   ```bash
   cd apps/mobile && npm install && npm run build && npm run android
   ```

`adb reverse` lasts until the phone is unplugged. Run it again after reconnecting.

The app talks to one host only. An account that lives on production is not on the local stack, and signing in there with its phrase creates a new, empty account. To use an existing hosted account, build with `CICLO_API_BASE=https://www.openciclo.com`. Clear the app's data first (`adb shell pm clear com.openciclo.app`), or a phrase saved for the local stack signs in to production on start and creates an empty account there.

## Release builds

A Google Play release is an Android App Bundle (`.aab`) built from a committed tree, for the production host, and signed with the upload key.

### The upload key

Google Play signs what people install with the app signing key, which Google keeps (Play App Signing, on for every new app). We sign each upload with our own upload key. If the upload key is lost or leaks, the account owner can ask Google to reset it on the App integrity page of Play Console; the app signing key never changes.

This repository is public. Create the upload key once, outside it, with the JDK's `keytool` (in the JDK 21 `bin` folder). keytool does not create folders, so make one first:

```bash
mkdir -p ~/keys
keytool -genkeypair -v -keystore ~/keys/ciclo-upload.jks -alias ciclo-upload \
  -keyalg RSA -keysize 4096 -validity 10000
```

In PowerShell (no `~`, no line continuation):

```powershell
New-Item -ItemType Directory -Force "$HOME\keys" | Out-Null
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v -keystore "$HOME\keys\ciclo-upload.jks" -alias ciclo-upload -keyalg RSA -keysize 4096 -validity 10000
```

keytool writes a PKCS12 keystore whatever the file is called, and a PKCS12 keystore has one password: keytool asks for it once and uses it for the key too. Back up the keystore file and that password (a password manager plus an offline copy). Git ignores `*.jks`, `*.keystore`, `*.p12`, `*.pfx` (in any letter case) and `keystore.properties` anywhere in the tree, as a second line of defense.

Point Gradle at the key with `apps/mobile/android/keystore.properties` (ignored by git):

```properties
storeFile=C:/Users/you/keys/ciclo-upload.jks
storePassword=...
keyAlias=ciclo-upload
keyPassword=...
```

- `keyPassword` is the same password as `storePassword` for a key made as above.
- Use forward slashes on Windows: a backslash is an escape character in a properties file. A relative `storeFile` is read from `apps/mobile/android/`.
- Instead of the file, a shell or a CI job can set all four of `CICLO_UPLOAD_STORE_FILE`, `CICLO_UPLOAD_STORE_PASSWORD`, `CICLO_UPLOAD_KEY_ALIAS` and `CICLO_UPLOAD_KEY_PASSWORD`. The file wins when both exist.
- With neither, release builds are unsigned. CI builds them that way; Google Play rejects them.
- Only release builds read the key. When the file or the variables are incomplete, or the keystore is missing (a backup drive that is not plugged in), the Gradle task `verifyReleaseSigning` fails the release build and says why. Debug builds and Android Studio's Gradle sync carry on.

### The version

`apps/mobile/version.json` is the one place for the version:

```json
{ "versionCode": 1, "versionName": "1.0.0" }
```

Gradle reads it, and the Android export passes it to the bundle as `NEXT_PUBLIC_CICLO_VERSION_CODE` and `NEXT_PUBLIC_CICLO_VERSION_NAME`. Raise `versionCode` by one for every upload (Google Play refuses a code it has already seen) and set `versionName` to what people see. Commit the change before building.

### Building

```bash
cd apps/mobile
CICLO_API_BASE=https://www.openciclo.com npm run build:release
```

In PowerShell, clear the variable afterwards, because `$env:` lasts for the whole window and a later `npm run build` there would bake the production host into a development build:

```powershell
$env:CICLO_API_BASE = "https://www.openciclo.com"; try { npm run build:release } finally { Remove-Item Env:CICLO_API_BASE }
```

`build:release` refuses to start without `CICLO_API_BASE` in its environment (it never takes it from a `.env` file or a default), with a value that is not https, or with no upload key (or only some of the `CICLO_UPLOAD_*` variables). It warns about uncommitted changes. Then it runs the Android export (`npm run build:android` in `apps/web`), `cap sync android`, and `gradlew bundleRelease`. Upload `android/app/build/outputs/bundle/release/app-release.aab`. The bundle carries the R8 mapping file, so Play Console shows readable stack traces.

### The release guard

`npm run build:android` writes `out-android/build-info.json` with the API host baked into the bundle, the git commit, `versionCode` and `versionName`. It resolves `CICLO_API_BASE` the way `next build` does (the environment, then the `.env` files) and hands `next build` that exact value. `cap sync` copies the file into the app.

Before anything of a release build compiles (`assembleRelease`, `bundleRelease`, `lintVitalRelease`), the Gradle task `verifyReleaseBuildInfo` reads the copy in `app/src/main/assets/public` and fails the build when:

- the file is missing: the export was not made by `npm run build:android`, or never copied in;
- `apiBase` is not https, or is a local address (`localhost`, `127.0.0.1`, the emulator's `10.0.2.2`, and the like);
- the commit is not `git rev-parse HEAD`: the export is stale;
- `versionCode` or `versionName` differ from `version.json`.

Debug builds skip it. It cannot see uncommitted changes, which is why `build:release` warns about them.

### R8

Release builds shrink and obfuscate the Java code (R8) and drop unused resources. The bridge finds plugin classes and their `@PluginMethod` methods by reflection; Capacitor's own R8 rules keep them, so `DeviceVaultPlugin` needs nothing in `proguard-rules.pro`. A new native class that is only reached by reflection needs a keep rule there.

CI builds the release APK unsigned the same way (export for `https://www.openciclo.com`, `cap sync`, `gradlew assembleRelease lintVitalRelease`), so the guard, R8 and lint run on every pull request.

## Security notes

- `allowBackup="false"` and `data_extraction_rules.xml` keep all app data out of Google backups and device transfers. The sealed phrase files are useless without this phone's Keystore, and older app versions kept a hosted phrase in WebView storage.
- Debug builds may use plain http, but only to `localhost` (`android/app/src/debug`). Release builds use Android's default: https only.
- The only runtime permission is the camera, for the phrase QR scanner. It is declared with `required="false"`, so phones without a camera can still install the app and type the phrase. A web feature that needs a device permission (camera, microphone, location) only works if the manifest declares it; otherwise Android denies it without asking.
- WebView debugging is on in debug builds only (Capacitor's default).
- Capacitor's bridge logging is off in every build (`loggingBehavior: "none"`). With it on, logcat would get every request and response body (emails on the recovery endpoints) and every plugin result, including the phrase from `DeviceVault.readPhrase`. Debug through `chrome://inspect` instead.
- The app has a Content Security Policy in a meta tag (`layout.android.tsx`), since a static export sends no headers.
- On Android 13+ the recents screen never shows the app's content (`setRecentsScreenshotEnabled(false)` in `MainActivity`, every account). Screenshots stay allowed unless the app lock is on (`FLAG_SECURE`).
- A copied phrase is marked sensitive (`DeviceVault.copySensitive`; Android 13+ hides it in the clipboard preview) and cleared about a minute later if the clipboard still holds it (`clearCopied`). If the app is in the background then, Android 10+ hides the clipboard from it, so it tries again when the app is back in front.
- The bundle needs Chrome 111. A script at the top of the Android root layout reads the WebView's Chrome version from its user agent and sends an older one to `webview-update.html` (exported by `apps/web/app/webview-update.html/route.android.tsx`): plain HTML in every UI language that asks to update Android System WebView. Capacitor's own `minWebViewVersion` check is not used: below Android 8 it reads the Chrome package's version, not the WebView in use. With no WebView at all, `MainActivity` shows a short message instead of crashing.
- `configChanges` includes `fontScale` and `fontWeightAdjustment`, so changing the system font size or bold text does not recreate the activity (which would reload the page and close a session not kept signed in). `MainActivity.onConfigurationChanged` sets the WebView's text zoom from the new font scale instead.
- The launcher icon (adaptive, themed, and bitmaps for Android 7) and the splash screen are the brand mark. The system splash shows the still mark, then the web loading screen draws the same mark at the same size and moves it. `npm run icons` in `apps/web` regenerates them. See `docs/brand/logo.md`.

## Old app builds

A build installed from Google Play can stay in use for months while the web changes every week.

- **Newer diaries.** If a newer build saved the diary (the web, or the app on another phone), an older build opens it read-only and shows **Update Ciclo**. It never saves it back, because it would drop what it does not know. The host refuses such a save too. Any new field or value in the diary needs a new `DIARY_SCHEMA_VERSION` (see `lib/diary-schema.test.ts`).
- **Recovery kits.** The app reads the PBKDF2 iteration count from each kit (100k to 3M), so the cost for new kits can rise without locking out installed builds.
- **Backups.** While a diary from a newer build is open, the JSON export writes it exactly as stored, so nothing this build cannot read is lost, and CSV export is off. CSV files now carry a `schemaVersion` column, so an older build refuses a newer CSV as it refuses a newer JSON.
- **Retiring a build.** Set `MIN_ANDROID_VERSION_CODE` on the host. Builds below it can still sign in, but the vault, recovery and research routes and new sign-ups answer 426, and the app asks for an update. Signing in keeps their session fresh, so sign-out and account deletion keep working. Builds made before the `x-ciclo-client` header existed cannot be retired this way.

## Known gaps

- A full reload always lands on the start screen. Capacitor serves the root `index.html` for any path without a file extension.
- Edge-to-edge layout still uses Capacitor defaults.
- The web build emits Capacitor as a lazy chunk (Turbopack keeps dynamic imports). The web never requests it.

## Roadmap

1. **Android polish.** Safe areas.
2. **Google Play.** Release signing, the health apps declaration, the Data safety form, and the privacy policy.
