import { Fraunces, Nunito } from "next/font/google";

// Shared by the web root layout and the Android one (layout.android.tsx).

export const fraunces = Fraunces({
  // latin-ext: Polish and other letters beyond Latin-1. Browsers fetch it only when a page uses them.
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

export const nunito = Nunito({
  // latin-ext: Polish and other letters beyond Latin-1. Browsers fetch it only when a page uses them.
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
});
