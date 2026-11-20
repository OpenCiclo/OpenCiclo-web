"use client";

import { AppShell } from "@/components/app-shell";
import { ScreenErrorView } from "@/components/screen-error";

// A screen that throws while drawing (a diary entry this build cannot show,
// say) shows this in its place instead of a blank app. The tab bar and the
// header live in the layout, outside this boundary, so the other screens stay
// one tap away, and the next navigation clears it. The error itself is never
// shown: its text could quote diary data. "Try again" is `reset` (draw the
// screen again), not a page load: in the Android app a load restarts at / and
// closes a session not kept signed in.
export default function ScreenError({ reset }: { error: unknown; reset: () => void }) {
  return (
    <AppShell>
      <ScreenErrorView onRetry={reset} />
    </AppShell>
  );
}
