// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { WrappedKit } from "@/lib/crypto/wrap";
import type { DeviceVaultPlugin } from "@/lib/device-vault";

// An email sign-up creates the account (with its phrase) before the 6-digit code
// arrives. Until the code is confirmed and the diary opens, the phrase exists only
// here: an app closed while the person reads the email would leave an account no
// one can open. So the sign-up waits in a PendingSignupStore, under the same rules
// as a kept phrase (agents.txt "Crypto / identity"): in the Android app sealed by
// its own Keystore key (`files/pending-signup.bin`, DeviceVaultPlugin.java), never in
// WebView storage; on the web in sessionStorage only (this tab), never localStorage.

export type StoredPendingSignup = {
  mnemonic: string;
  email: string;
  kit: WrappedKit;
  persist: boolean;
  /** The host took the code: only opening the diary is left. */
  confirmed: boolean;
};

export type PendingSignupStore = {
  /** Null when there is none, or it cannot be read. */
  read(): Promise<StoredPendingSignup | null>;
  /** Best effort: the sign-up still goes on in memory if this fails. */
  write(pending: StoredPendingSignup): Promise<void>;
  /** Best effort. */
  clear(): Promise<void>;
};

export const PENDING_SIGNUP_KEY = "ciclo.pendingSignup";

const FORMAT = 1;

export function encodePendingSignup(pending: StoredPendingSignup): string {
  return JSON.stringify({ format: FORMAT, ...pending });
}

/** Null for anything unexpected. */
export function decodePendingSignup(data: string | null | undefined): StoredPendingSignup | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;
    const { format, mnemonic, email, kit, persist, confirmed } = parsed;
    if (
      format !== FORMAT ||
      typeof mnemonic !== "string" ||
      mnemonic.length === 0 ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !kit ||
      typeof kit !== "object" ||
      typeof (kit as WrappedKit).wrappedSecret !== "string" ||
      typeof (kit as WrappedKit).wrapNonce !== "string" ||
      typeof (kit as WrappedKit).wrapSalt !== "string" ||
      typeof persist !== "boolean" ||
      typeof confirmed !== "boolean"
    ) {
      return null;
    }
    return { mnemonic, email, kit: kit as WrappedKit, persist, confirmed };
  } catch {
    return null;
  }
}

/** The web: this tab only. */
export function browserPendingSignupStore(session: () => Storage | null): PendingSignupStore {
  return {
    async read() {
      try {
        return decodePendingSignup(session()?.getItem(PENDING_SIGNUP_KEY));
      } catch {
        return null;
      }
    },
    async write(pending) {
      try {
        session()?.setItem(PENDING_SIGNUP_KEY, encodePendingSignup(pending));
      } catch {
        // Storage full or off: the sign-up goes on in memory.
      }
    },
    async clear() {
      try {
        session()?.removeItem(PENDING_SIGNUP_KEY);
      } catch {
        // Nothing to clear.
      }
    },
  };
}

type PendingSignupPlugin = Pick<DeviceVaultPlugin, "storePendingSignup" | "readPendingSignup" | "clearPendingSignup">;

/** Android: sealed in Keystore. Never falls back to WebView storage. */
export function androidPendingSignupStore(plugin: PendingSignupPlugin): PendingSignupStore {
  return {
    async read() {
      try {
        const { data } = await plugin.readPendingSignup();
        return decodePendingSignup(data);
      } catch {
        return null;
      }
    },
    async write(pending) {
      await plugin.storePendingSignup({ data: encodePendingSignup(pending) }).catch(() => undefined);
    },
    async clear() {
      await plugin.clearPendingSignup().catch(() => undefined);
    },
  };
}
