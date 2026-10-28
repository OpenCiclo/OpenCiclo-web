import type { Metadata, Viewport } from "next";

import { CicloProvider } from "@/lib/client/ciclo-context";
import { DeviceLockGate } from "@/components/device-lock-gate";
import { FloatingTabBar } from "@/components/floating-tab-bar";
import { ThemeClass } from "@/components/theme-class";
import { API_BASE } from "@/lib/app-target";
import { themeBootScript } from "@/lib/client/color-scheme";
import { fraunces, nunito } from "./fonts";
import "./globals.css";

// Root layout of the Android bundle (apps/mobile). Same chrome as the web
// layout, minus the service worker and the installed-PWA redirect.

// A static export has no response headers, so the policy goes in a meta tag.
// It mirrors the web CSP; connect-src adds the API host.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self' ${API_BASE}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: "Ciclo",
  description:
    "Privacy-first menstrual cycle forecasts. Not a medical device or contraceptive method.",
};

export const viewport: Viewport = {
  themeColor: "#f7f7f8",
  width: "device-width",
  initialScale: 1,
};

export default function AndroidRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
        <CicloProvider>
          {children}
          <FloatingTabBar />
          <DeviceLockGate />
          <ThemeClass />
        </CicloProvider>
      </body>
    </html>
  );
}
