"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCiclo } from "@/lib/client/ciclo-context";
import type { Messages } from "@/lib/i18n";
import type { DeviceLockReason } from "@/lib/device-vault";

// What the lock screen says and offers for each reason the diary stayed locked.
// "Unlock" asks Keystore again; it is hidden when the key can never open the
// phrase. The phrase cannot help a file that cannot be read.
function lockScreen(reason: DeviceLockReason | null, t: Messages) {
  switch (reason) {
    case "key-invalidated":
      return { body: t.deviceLockedKeyInvalidated, unlock: null, phrase: true, remove: true };
    case "no-key":
      return { body: t.deviceLockedNoKey, unlock: null, phrase: true, remove: true };
    case "key-error":
      return { body: t.deviceLockedKeyError, unlock: t.deviceUnlock, phrase: true, remove: true };
    case "unreadable":
      return { body: t.deviceLockedUnreadable, unlock: t.restoreRetry, phrase: false, remove: true };
    default:
      // Locked after time in the background, or the fingerprint check was canceled.
      return { body: t.deviceLockedBody, unlock: t.deviceUnlock, phrase: true, remove: false };
  }
}

// Android only (layout.android.tsx). Covers every screen while an on-device diary
// is locked. /unlock stays reachable so the phrase can open it. The Android back
// button leaves the app here (`data-device-lock`, lib/client/android-back.ts).
// Also covers the app while it is in the background with the app lock on, and
// blocks everything when whether this install keeps a diary could not be read.
export function DeviceLockGate() {
  const { t, ready, deviceLocked, deviceLockReason, deviceStatusFailed, appCovered, retryRestore } = useCiclo();
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      await retryRestore();
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  // Never "no diary" on an unknown answer, and the phrase screen too would not
  // know where to go: nothing is reachable until a retry works.
  if (deviceStatusFailed) {
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
            {t.deviceStatusFailedTitle}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">{t.deviceStatusFailedBody}</p>
          <Button disabled={busy} onClick={() => void retry()}>
            {t.restoreRetry}
          </Button>
        </div>
      </div>
    );
  }

  if (!deviceLocked) {
    // App lock on and the app in the background (or just back): nothing of the diary shows.
    if (!appCovered) return null;
    return (
      <div aria-hidden className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <BrandMark />
      </div>
    );
  }

  if (pathname === "/unlock") return null;

  const screen = lockScreen(deviceLockReason, t);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-lock-title"
      data-device-lock=""
      className="fixed inset-0 z-50 flex flex-col justify-center overflow-y-auto bg-background px-6 py-8"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 id="device-lock-title" className="flex items-center gap-2 font-serif text-2xl tracking-tight">
          <BrandMark />
          {t.deviceLockedTitle}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{screen.body}</p>
        <div className="flex flex-col gap-3">
          {screen.unlock ? (
            <Button disabled={busy} onClick={() => void retry()}>
              {screen.unlock}
            </Button>
          ) : null}
          {screen.phrase ? (
            <Button
              variant={screen.unlock ? "secondary" : "default"}
              disabled={busy}
              onClick={() => router.push("/unlock")}
            >
              {t.deviceUsePhrase}
            </Button>
          ) : null}
        </div>
        {screen.remove ? <DeleteLockedDiary disabled={busy} /> : null}
      </div>
    </div>
  );
}

// A diary that cannot be opened (no phrase, damaged file) can be deleted, after
// typing a word: without its 12 words it is gone for good.
function DeleteLockedDiary({ disabled }: { disabled: boolean }) {
  const { t, deleteLockedDeviceDiary } = useCiclo();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const word = t.deviceDeleteWord;
  const matches = typed.trim().toLowerCase() === word.toLowerCase();

  if (!open) {
    return (
      <button
        type="button"
        className="text-left text-sm text-destructive underline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {t.deleteDeviceDiary}
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-destructive/30 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!matches) return;
        setBusy(true);
        setFailed(false);
        try {
          await deleteLockedDeviceDiary();
        } catch {
          setFailed(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="delete-device-word" className="text-sm leading-6 text-card-foreground">
        {t.deviceDeleteLockedConfirm.replace("{word}", word)}
      </label>
      <Input
        id="delete-device-word"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />
      {failed ? <p className="text-sm text-destructive">{t.errorGeneric}</p> : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={() => {
            setOpen(false);
            setTyped("");
          }}
        >
          {t.cancel}
        </Button>
        <Button type="submit" variant="destructive" className="flex-1" disabled={busy || disabled || !matches}>
          {t.deleteDeviceDiary}
        </Button>
      </div>
    </form>
  );
}
