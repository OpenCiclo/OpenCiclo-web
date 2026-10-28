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

// Host the Android bundle calls for `/api`. Defaults to the local stack (reached
// from a phone through `adb reverse tcp:3000 tcp:3000`), so a forgotten value
// fails closed instead of pointing a dev build at production. Release builds
// set it to the production origin. Plain http is only allowed for localhost.
function androidApiBase(): string {
  const value = process.env.CICLO_API_BASE ?? "http://localhost:3000";
  const url = new URL(value);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.origin !== value || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
    throw new Error(`CICLO_API_BASE must be an https origin with no path or trailing slash, got "${value}"`);
  }
  return value;
}

// The Android app (apps/mobile) wraps a static export of the routes named
// `page.android.tsx` / `layout.android.tsx`. API routes, marketing, and the
// console are plain `.tsx`, so they are not routes in this build.
function androidConfig(): NextConfig {
  return {
    output: "export",
    pageExtensions: ["android.tsx"],
    distDir: "out-android",
    poweredByHeader: false,
    images: { unoptimized: true },
    // Leaves out the web dev server's route types (.next/dev), which list
    // routes this build does not have.
    typescript: { tsconfigPath: "tsconfig.android.json" },
    env: {
      NEXT_PUBLIC_CICLO_TARGET: "android",
      NEXT_PUBLIC_CICLO_API_BASE: androidApiBase(),
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
        ],
      },
    ];
  },
};

const nextConfig = process.env.CICLO_TARGET === "android" ? androidConfig() : webConfig;

export default nextConfig;
