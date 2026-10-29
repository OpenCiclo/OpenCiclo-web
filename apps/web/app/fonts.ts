import { Fraunces, Nunito } from "next/font/google";

// Shared by the web root layout and the Android one (layout.android.tsx).

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
