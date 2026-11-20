"use client";

import { useEffect, useState } from "react";

import { IS_ANDROID_APP } from "@/lib/app-target";
import { useCiclo } from "@/lib/client/ciclo-context";
import { useBrowserValue } from "@/lib/client/hooks";
import {
  detectInstallPlatform,
  isInstalledDisplay,
  type InstallPlatform,
} from "@/lib/client/install-platform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NUDGE_KEY = "ciclo.installHintUntil";
const CALENDAR_KEY = "ciclo.installCalendarDismissed";
const NUDGE_MS = 30 * 24 * 60 * 60 * 1000;

type InstallPromptMode = "nudge" | "calendar" | "settings";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readDismissed(mode: InstallPromptMode): boolean {
  try {
    if (mode === "settings") return false;
    if (mode === "calendar") return localStorage.getItem(CALENDAR_KEY) === "1";
    const until = Number(localStorage.getItem(NUDGE_KEY) ?? "0");
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function installedNow(): boolean {
  // The Android app is already installed; its WebView user agent still says Chrome.
  if (IS_ANDROID_APP) return true;
  return isInstalledDisplay({
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    iosStandalone:
      "standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  });
}

export function InstallPrompt({ mode = "nudge" }: { mode?: InstallPromptMode }) {
  const { t } = useCiclo();
  // Browser-only (user agent, display mode, localStorage), so read after hydration.
  const detected = useBrowserValue<InstallPlatform | null>(() => {
    if (installedNow() || readDismissed(mode)) return null;
    return detectInstallPlatform(navigator.userAgent, { maxTouchPoints: navigator.maxTouchPoints });
  }, null);
  const [dismissed, setDismissed] = useState(false);
  const platform = dismissed ? null : detected;
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!detected) return;
    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [detected]);

  if (!platform) return null;

  const body = {
    "ios-safari": t.installIosSafari,
    "ios-chrome": t.installIosChrome,
    "ios-firefox": t.installIosFirefox,
    "ios-edge": t.installIosEdge,
    "ios-other": t.installIosOther,
    "android-chrome": t.installAndroidChrome,
    "android-samsung": t.installAndroidSamsung,
    "android-firefox": t.installAndroidFirefox,
    "android-edge": t.installAndroidEdge,
    "android-other": t.installAndroidOther,
  }[platform];

  function dismiss() {
    if (mode === "calendar") localStorage.setItem(CALENDAR_KEY, "1");
    else if (mode === "nudge") localStorage.setItem(NUDGE_KEY, String(Date.now() + NUDGE_MS));
    setDismissed(true);
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") dismiss();
  }

  return (
    <aside
      className={cn(
        "w-full border border-border bg-card p-4 text-sm text-card-foreground shadow-sm",
        mode === "nudge" ? "max-w-md rounded-2xl" : "rounded-3xl",
        mode === "settings" && "mt-4",
      )}
    >
      <p className="font-medium">{t.installTitle}</p>
      <p className="mt-1 leading-6 text-muted-foreground">{body}</p>
      {promptEvent || mode !== "settings" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {promptEvent ? (
            <Button type="button" onClick={() => void install()}>
              {t.installAction}
            </Button>
          ) : null}
          {mode !== "settings" ? (
            <Button type="button" variant="outline" onClick={dismiss}>
              {t.installDismiss}
            </Button>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
