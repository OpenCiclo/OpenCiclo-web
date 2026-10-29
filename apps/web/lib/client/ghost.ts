// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext } from "react";

/**
 * True inside a ghost: a copy of a tab screen drawn out of sight, so a drag
 * of the tab bar can slide it in (see TabGhosts). A ghost is only looked at,
 * never used, so it must do nothing a screen does on its own: no navigation,
 * no reading the address, no taking browser events another screen needs.
 */
export const GhostContext = createContext(false);

export function useIsGhost(): boolean {
  return useContext(GhostContext);
}
