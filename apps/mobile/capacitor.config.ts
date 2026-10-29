import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Permanent once the app is on Google Play.
  appId: "com.openciclo.app",
  appName: "Ciclo",
  // Static export of the `*.android.tsx` routes in apps/web (`npm run build`).
  webDir: "../web/out-android",
  // With CapacitorHttp on, the bridge logs every request and response body
  // (emails on the recovery endpoints). Keep that to debug builds; never
  // "production".
  loggingBehavior: "debug",
  plugins: {
    // The bundle is served from https://localhost and calls the Ciclo host for
    // /api. Native HTTP keeps the session cookie (httpOnly, SameSite=Lax) in the
    // app's own cookie jar, so the web API needs no CORS or cookie changes.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
