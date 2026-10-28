import type { Metadata, Viewport } from "next";

import { CicloProvider } from "@/lib/client/ciclo-context";
import { FloatingTabBar } from "@/components/floating-tab-bar";
import { RegisterSw } from "@/components/register-sw";
import { StandaloneHomeRedirect } from "@/components/standalone-home-redirect";
import { ThemeClass } from "@/components/theme-class";
import { themeBootScript } from "@/lib/client/color-scheme";
import { fraunces, nunito } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciclo",
  description:
    "Privacy-first menstrual cycle forecasts. Not a medical device or contraceptive method.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Ciclo",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
        <CicloProvider>
          {children}
          <FloatingTabBar />
          <StandaloneHomeRedirect />
          <ThemeClass />
          <RegisterSw />
        </CicloProvider>
      </body>
    </html>
  );
}
