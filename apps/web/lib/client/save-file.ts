// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { IS_ANDROID_APP } from "@/lib/app-target";

// Handing a text file (a diary export, the phrase backup) to the person. The
// web downloads it. A WebView cannot download, so the Android app either saves
// it where she chooses or opens the share sheet: `useSaveFile`
// (components/save-file-dialog.tsx) asks which, and every screen goes through it.

/** Whether the file can go two ways (the Android app), so the person is asked which. */
export const SAVE_ASKS_WHERE = IS_ANDROID_APP;

/** The web: a browser download. */
export function downloadFile(filename: string, body: string, type: string): void {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * The Android app: Android's own "Save to" screen (phone storage, Drive, any
 * document provider). False when she backs out of it. Needs no storage permission.
 */
export async function saveToDevice(filename: string, body: string, type: string): Promise<boolean> {
  const { deviceVault } = await import("@/lib/client/device-storage");
  const { saved } = await deviceVault.saveFile({ filename, data: body, mimeType: type });
  return saved === true;
}

/** The Android app: the share sheet, to send the file to another app. */
export async function shareFile(filename: string, body: string, type: string): Promise<void> {
  const { deviceVault } = await import("@/lib/client/device-storage");
  await deviceVault.shareFile({ filename, data: body, mimeType: type });
}
