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
 * Friends (share your cycle phase, sealed, with close friends). On since
 * 2026-11-20, shown as experimental. Turned off, the screen and tab are hidden
 * and every /api/friends route answers 404, so nothing more is stored; the
 * privacy policy's Friends parts go with it (lib/privacy/policy.test.ts checks).
 */
export const FRIENDS_AVAILABLE = true;

/**
 * Pregnancy mode (PLAN 4, phase 3a): dates, weeks, a pregnancy card, its end,
 * and friends who never learn of it. On since 2026-11-23, after the owner
 * approved its texts. Turned off, nothing offers to turn it on (Settings, the
 * late-period card, a positive test) and /help/pregnancy is a 404; a diary that
 * already holds a pregnancy still shows it, so it can always be ended.
 * /dev-pregnancy shows every state.
 */
export const PREGNANCY_AVAILABLE = true;

/** The week-by-week cards (phase 3b). Off until they have had a medical review. */
export const PREGNANCY_WEEKS_AVAILABLE = false;
