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
- In debug builds, `CapacitorHttp` writes every request and response body to logcat, including the email sent to the recovery endpoints. `loggingBehavior: "debug"` keeps that out of release builds. Do not set it to `"production"`.
- The app has a Content Security Policy in a meta tag (`layout.android.tsx`), since a static export sends no headers.

## Known gaps

- The Android back button closes the app instead of going to the previous screen.
- A full reload always lands on the start screen. Capacitor serves the root `index.html` for any path without a file extension.
- Diary export uses a browser download, which a WebView does not handle. It needs the share sheet.
- Edge-to-edge layout, the back button, the app icon, and the splash screen still use Capacitor defaults.

## Roadmap

1. **Storage abstraction.** Split `ciclo-context.tsx` into a vault backend (hosted or on-device) and a secret store (browser storage or Android Keystore). The web keeps its current behaviour.
2. **On-device encrypted mode.** An option to keep the diary only on the phone, with no account:
   - The diary is the same AES-GCM blob the server stores, derived from the same 12-word phrase. No new cryptography.
   - The blob lives in a file in the app's private storage. Writes go to a temporary file first and then replace the old one.
   - The phrase is encrypted with a key in Android Keystore, optionally unlocked with fingerprint or screen lock.
   - Moving between on-device and hosted is an upload or download of that blob.
   - Losing the phone without the phrase loses the diary, as with phrase-only accounts today.
3. **Android polish.** Back button, safe areas, icon and splash screen, export through the share sheet, optional screenshot blocking.
4. **Google Play.** Release signing, the health apps declaration, the Data safety form, and the privacy policy.
