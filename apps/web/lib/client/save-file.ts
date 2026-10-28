// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { IS_ANDROID_APP } from "@/lib/app-target";

/** Browser download on the web. In the Android app (a WebView cannot download), the share sheet. */
export async function saveFile(filename: string, body: string, type: string): Promise<void> {
  if (IS_ANDROID_APP) {
    const { deviceVault } = await import("@/lib/client/device-storage");
    await deviceVault.shareFile({ filename, data: body, mimeType: type });
    return;
  }
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
