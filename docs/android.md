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

- Client code builds API URLs with `apiUrl()` (`lib/app-target.ts`). On the web the base is empty, so nothing changes there.
- The Android build bakes the host from `CICLO_API_BASE`. It defaults to `http://localhost:3000`, the local stack. Release builds must pass the production origin, for example `CICLO_API_BASE=https://www.openciclo.com`.
- `CapacitorHttp` sends `fetch` through Android's HTTP stack with the app's own cookie store. The session cookie stays `httpOnly` and `SameSite=Lax`. The server needs no CORS headers.

## Back button

`MainActivity` asks the page first (`window.cicloBack`, `lib/client/android-back.ts`):

- An open sheet or dialog closes. Back sends the Escape key that each one already listens for, so a new overlay must close on Escape too.
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
- **Moving.** Device → hosted signs in with the device blob (or merges into an existing hosted diary like an import), then deletes the device files. Hosted → device writes the device files, then deletes the hosted account; if that delete fails, the device files are removed again.
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

## Security notes

- `allowBackup="false"` and `data_extraction_rules.xml` keep all app data out of Google backups and device transfers. WebView storage can hold the recovery phrase.
- Debug builds may use plain http, but only to `localhost` (`android/app/src/debug`). Release builds use Android's default: https only.
- The only runtime permission is the camera, for the phrase QR scanner. It is declared with `required="false"`, so phones without a camera can still install the app and type the phrase. A web feature that needs a device permission (camera, microphone, location) only works if the manifest declares it; otherwise Android denies it without asking.
- WebView debugging is on in debug builds only (Capacitor's default).
- Capacitor's bridge logging is off in every build (`loggingBehavior: "none"`). With it on, logcat would get every request and response body (emails on the recovery endpoints) and every plugin result, including the phrase from `DeviceVault.readPhrase`. Debug through `chrome://inspect` instead.
- The app has a Content Security Policy in a meta tag (`layout.android.tsx`), since a static export sends no headers.

## Known gaps

- A full reload always lands on the start screen. Capacitor serves the root `index.html` for any path without a file extension.
- Edge-to-edge layout, the app icon, and the splash screen still use Capacitor defaults.
- Hosted accounts in the app still keep "Keep me signed in" in WebView `localStorage`, as on the web. Only on-device diaries use Keystore.
- The web build emits Capacitor as a lazy chunk (Turbopack keeps dynamic imports). The web never requests it.

## Roadmap

1. **Hosted phrase in Keystore.** Move the persisted phrase of hosted accounts from WebView storage to the Keystore seal used by on-device mode.
2. **Android polish.** Safe areas, icon and splash screen.
3. **Google Play.** Release signing, the health apps declaration, the Data safety form, and the privacy policy.
