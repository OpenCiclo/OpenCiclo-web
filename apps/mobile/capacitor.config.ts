import type { CapacitorConfig } from "@capacitor/cli";

// Each platform ships its own static export of apps/web: the texts, the store links and
// a few behaviours differ (apps/web/lib/app-target.ts). The CLI reads this file with the
// platform in its arguments (`cap sync ios`, `cap run ios`, `cap open ios`): always name
// the platform, a bare `cap sync` would copy the Android export into both projects.
const ios = process.argv.includes("ios") || process.env.CICLO_TARGET === "ios";

const config: CapacitorConfig = {
  // Permanent once the app is on Google Play or the App Store (the iOS bundle identifier).
  appId: "com.openciclo.app",
  appName: "Ciclo",
  // Static export of the `*.android.tsx` routes in apps/web (`npm run build`, or
  // `npm run build:ios` for out-ios).
  webDir: ios ? "../web/out-ios" : "../web/out-android",
  // Off in every build. The bridge would log each request and response body
  // (emails on the recovery endpoints) and each plugin result, including the
  // phrase returned by DeviceVault.readPhrase. Debug through chrome://inspect.
  loggingBehavior: "none",
  // No android.minWebViewVersion / server.errorPath: an old WebView is sent to
  // webview-update.html by a script in the web layout instead (see
  // apps/web/lib/webview-update-page.ts for why Capacitor's check misfires).
  plugins: {
    // The bundle is served from https://localhost (capacitor://localhost on iOS) and
    // calls the Ciclo host for /api. Native HTTP keeps the session cookie (httpOnly, SameSite=Lax) in the
    // app's own cookie jar, so the web API needs no CORS or cookie changes.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
