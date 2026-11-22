import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Only the camera, for the phrase QR scanner on this origin. Everything else
// a page could ask for is off.
const permissionsPolicy = [
  "camera=(self)",
  "microphone=()",
  "geolocation=()",
  "display-capture=()",
  "payment=()",
  "usb=()",
  "serial=()",
  "hid=()",
  "bluetooth=()",
  "midi=()",
  "accelerometer=()",
  "gyroscope=()",
  "magnetometer=()",
  "browsing-topics=()",
].join(", ");

// Host an app bundle (Android or iOS) calls for `/api`. Defaults to the local stack
// (reached from an Android phone through `adb reverse tcp:3000 tcp:3000`, and from the
// iOS simulator directly), so a forgotten value
// fails closed instead of pointing a dev build at production. Release builds
// set it to the production origin. Plain http is only allowed for localhost.
// scripts/build-android.mjs (`npm run build:android`) repeats this default and
// passes the value explicitly, so build-info.json names the host baked here.
function androidApiBase(): string {
  const value = process.env.CICLO_API_BASE ?? "http://localhost:3000";
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.origin !== value || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
    throw new Error(`CICLO_API_BASE must be an https origin with no path or trailing slash, got "${value}"`);
  }
  return value;
}

// The app version, kept in apps/mobile/version.json. Gradle reads the same file
// for versionCode/versionName, and scripts/build-android.mjs copies it into
// out-android/build-info.json for the release guard. `next build` runs in apps/web.
function androidVersion(): { code: string; name: string } {
  const file = path.resolve(process.cwd(), "../mobile/version.json");
  const { versionCode, versionName } = JSON.parse(readFileSync(file, "utf8")) as {
    versionCode?: unknown;
    versionName?: unknown;
  };
  if (!Number.isInteger(versionCode) || (versionCode as number) < 1) {
    throw new Error(`${file}: versionCode must be a positive integer`);
  }
  if (typeof versionName !== "string" || versionName.trim() === "") {
    throw new Error(`${file}: versionName must be a non-empty string`);
  }
  return { code: String(versionCode), name: versionName };
}

// The apps (apps/mobile) wrap a static export of the routes named
// `page.android.tsx` / `layout.android.tsx`. API routes, marketing, and the
// console are plain `.tsx`, so they are not routes in this build. The iOS app
// uses the same routes (the files keep their `.android.tsx` name) in an export
// of its own, `out-ios`, where NEXT_PUBLIC_CICLO_TARGET is "ios"
// (lib/app-target.ts).
function appConfig(target: "android" | "ios"): NextConfig {
  const version = androidVersion();
  return {
    output: "export",
    pageExtensions: ["android.tsx"],
    distDir: `out-${target}`,
    poweredByHeader: false,
    images: { unoptimized: true },
    // Leaves out the web dev server's route types (.next/dev), which list
    // routes this build does not have.
    typescript: { tsconfigPath: "tsconfig.android.json" },
    env: {
      NEXT_PUBLIC_CICLO_TARGET: target,
      NEXT_PUBLIC_CICLO_API_BASE: androidApiBase(),
      NEXT_PUBLIC_CICLO_VERSION_CODE: version.code,
      NEXT_PUBLIC_CICLO_VERSION_NAME: version.name,
    },
  };
}

const webConfig: NextConfig = {
  // Docker/self-host needs standalone. On Vercel, Next 16.3 + this flag
  // skips next-server.js.nft.json and the platform packager then fails.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["postgres"],
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/help": ["./content/help/**/*"],
    "/help/[slug]": ["./content/help/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: permissionsPolicy },
          // Browsers ignore it over plain http (local dev, docker on localhost).
          // No includeSubDomains or preload: not every subdomain is known to be https.
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]),
        ],
      },
      {
        // Answers carry sessions, kits and ciphertext: no browser or CDN cache.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

const target = process.env.CICLO_TARGET;
const nextConfig = target === "android" || target === "ios" ? appConfig(target) : webConfig;

export default nextConfig;
