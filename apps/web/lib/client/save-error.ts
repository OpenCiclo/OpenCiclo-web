// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { AccountMismatchError, VaultTooLargeError } from "@/lib/client/api";
import { UpdateRequiredError } from "@/lib/client/http";
import type { Messages } from "@/lib/i18n";

/**
 * What to tell the person when a diary save failed. Null when an update is
 * needed: the screen turns read-only and its own notice says so. Never the
 * error's text (it could quote diary data).
 */
export function saveErrorMessage(cause: unknown, t: Messages): string | null {
  if (cause instanceof UpdateRequiredError) return null;
  if (cause instanceof VaultTooLargeError) return t.vaultTooLarge;
  if (cause instanceof AccountMismatchError) return t.accountMismatch;
  return t.errorGeneric;
}
