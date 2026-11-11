// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { registerPlugin } from "@capacitor/core";

import { androidPhraseStore } from "@/lib/client/phrase-store";
import { deviceVaultBackend, type DeviceVaultPlugin } from "@/lib/device-vault";

// Android only. Load it with `import()` behind IS_ANDROID_APP so the web never
// loads Capacitor. The plugin is DeviceVaultPlugin.java in apps/mobile.
export const deviceVault = registerPlugin<DeviceVaultPlugin>("DeviceVault");

export const deviceBackend = deviceVaultBackend(deviceVault);

/** "Keep me signed in" for hosted accounts in the app: Keystore, not WebView storage. */
export const hostedPhraseStore = androidPhraseStore(deviceVault, { local: localStorage, session: sessionStorage });
