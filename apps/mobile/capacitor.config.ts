import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Permanent once the app is on Google Play.
  appId: "com.openciclo.app",
  appName: "Ciclo",
  // Static export of the `*.android.tsx` routes in apps/web (`npm run build`).
  webDir: "../web/out-android",
  // Off in every build. The bridge would log each request and response body
  // (emails on the recovery endpoints) and each plugin result, including the
  // phrase returned by DeviceVault.readPhrase. Debug through chrome://inspect.
  loggingBehavior: "none",
  plugins: {
    // The bundle is served from https://localhost and calls the Ciclo host for
    // /api. Native HTTP keeps the session cookie (httpOnly, SameSite=Lax) in the
    // app's own cookie jar, so the web API needs no CORS or cookie changes.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
