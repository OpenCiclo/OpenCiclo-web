// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// An invite code opened from a link (/friends/join) and waiting for the Friends
// screen: kept for this tab only (sessionStorage), read once.

const KEY = "ciclo.pendingInvite";

export function keepPendingInvite(code: string) {
  try {
    window.sessionStorage.setItem(KEY, code);
  } catch {
    // Storage blocked: the join page still shows the code to copy.
  }
}

export function takePendingInvite(): string | null {
  try {
    const code = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return code;
  } catch {
    return null;
  }
}
