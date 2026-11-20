// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Features that are built but not shown yet. Flip the flag to bring one back.

/**
 * Visual seasons is unfinished. While this is false the Settings switch is
 * hidden and the effect is off for everyone, including people who turned it
 * on before; otherwise they would keep the seasonal card with no way to turn
 * it off. Their stored choice (`ciclo.visualSeasons`) is left as it is.
 */
export const VISUAL_SEASONS_AVAILABLE = false;

/**
 * Friends (share your cycle phase, sealed, with close friends). While false the
 * screen and tab are hidden and every /api/friends route answers 404, so
 * nothing is stored. Turn on only with the privacy policy describing it
 * (lib/privacy/policy.test.ts checks).
 */
export const FRIENDS_AVAILABLE = false;
