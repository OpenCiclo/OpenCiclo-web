"use client";

import { useEffect } from "react";

import { androidBack } from "@/lib/client/android-back";

// Android only (layout.android.tsx). Exposes the back-button handler to MainActivity.
export function AndroidBack() {
  useEffect(() => {
    const target = window as Window & { cicloBack?: typeof androidBack };
    target.cicloBack = androidBack;
    return () => {
      delete target.cicloBack;
    };
  }, []);
  return null;
}
