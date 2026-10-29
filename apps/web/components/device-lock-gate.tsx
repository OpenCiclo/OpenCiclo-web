"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { useCiclo } from "@/lib/client/ciclo-context";

// Android only (layout.android.tsx). Covers every screen while an on-device diary
// is locked. /unlock stays reachable so the phrase can open it. The Android back
// button leaves the app here (`data-device-lock`, lib/client/android-back.ts).
export function DeviceLockGate() {
  const { t, ready, deviceLocked, retryRestore } = useCiclo();
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!ready || !deviceLocked || pathname === "/unlock") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-lock-title"
      data-device-lock=""
      className="fixed inset-0 z-50 flex flex-col justify-center bg-background px-6"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 id="device-lock-title" className="flex items-center gap-2 font-serif text-2xl tracking-tight">
          <BrandMark />
          {t.deviceLockedTitle}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{t.deviceLockedBody}</p>
        <div className="flex flex-col gap-3">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await retryRestore();
              } finally {
                setBusy(false);
              }
            }}
          >
            {t.deviceUnlock}
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => router.push("/unlock")}>
            {t.deviceUsePhrase}
          </Button>
        </div>
      </div>
    </div>
  );
}
