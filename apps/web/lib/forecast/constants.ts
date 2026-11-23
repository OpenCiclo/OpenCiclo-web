// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/** Mirrors openciclo.constants for the released shrinkage + Laplace path. */

export const ENGINE_VERSION = "0.3.0";
export const MIN_CYCLE_LENGTH = 1;
export const MAX_CYCLE_LENGTH = 90;
// 24–38 days: the adult range in Learn (OWH / FIGO). Notes only, never the forecast.
export const UNUSUAL_SHORT_DAYS = 24;
export const UNUSUAL_LONG_DAYS = 38;
export const SUSPICIOUS_SHORT_DAYS = 10;
export const SUSPICIOUS_LONG_DAYS = 60;
export const INCOMPLETE_HISTORY_DAYS = 40;
export const MIN_LAPLACE_SCALE = 0.75;
export const PROBABILITY_WINDOWS = [1, 2, 3, 5] as const;
export const LOW_UNCERTAINTY_MAX_SCALE = 2.0;
export const LOW_UNCERTAINTY_MIN_CYCLES = 6;
export const HIGH_UNCERTAINTY_MIN_SCALE = 5.0;
export const HIGH_UNCERTAINTY_MAX_CYCLES = 2;
export const MEDICAL_DISCLAIMER =
  "Ciclo provides cycle forecasts. Forecasts can be wrong. Ciclo is not a medical device, diagnosis system, or contraceptive method.";
// Estimated ovulation: days from ovulation to the next start (openciclo.constants LUTEAL_*).
// Bull et al. 2019, npj Digit Med 2:83, Table 1: luteal phase 12.4 ± 2.4 days; range 7–17.
export const LUTEAL_MEAN_DAYS = 12.4;
export const LUTEAL_SD_DAYS = 2.4;
export const LUTEAL_MIN_DAYS = 7;
export const LUTEAL_MAX_DAYS = 17;
/** The estimated-ovulation window: the shortest run of days holding this much probability. */
export const OVULATION_INTERVAL_COVERAGE = 0.8;
