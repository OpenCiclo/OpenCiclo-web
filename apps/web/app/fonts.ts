import { Fraunces, Nunito } from "next/font/google";

// Shared by the web root layout and the Android one (layout.android.tsx).
// `subsets` only picks which files every page preloads. next/font still
// self-hosts every subset with its unicode-range, so the latin-ext files
// (Polish and other letters beyond Latin-1) load only when a page uses them.

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
