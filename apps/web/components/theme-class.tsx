"use client";

import { useEffect } from "react";

import { IS_IOS_APP } from "@/lib/app-target";
import { applyColorScheme } from "@/lib/client/color-scheme";
import { useCiclo } from "@/lib/client/ciclo-context";

export function ThemeClass() {
  const { colorScheme } = useCiclo();

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyColorScheme(colorScheme, media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [colorScheme]);

  // iOS draws the status bar text and the keyboard for its own light or dark
  // mode: tell it when Settings picks the other one.
  useEffect(() => {
    if (!IS_IOS_APP) return;
    void import("@/lib/client/device-storage")
      .then(({ deviceVault }) => deviceVault.setAppearance?.({ scheme: colorScheme }))
      .catch(() => {});
  }, [colorScheme]);

  return null;
}
