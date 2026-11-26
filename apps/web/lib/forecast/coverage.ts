// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import type { DailyProbability } from "@/lib/forecast/types";

/** The central interval holding `coverage` of the daily start probabilities (0.8: from the 10th to the 90th percentile). */
export function coverageInterval(daily: DailyProbability[], coverage: number) {
  if (daily.length === 0) return null;
  const tail = (1 - coverage) / 2;
  let cdf = 0;
  let lower = daily[0].date;
  let upper = daily[daily.length - 1].date;
  let lowerSet = false;
  for (const item of daily) {
    cdf += item.probability;
    if (!lowerSet && cdf >= tail) {
      lower = item.date;
      lowerSet = true;
    }
    if (cdf >= 1 - tail) {
      upper = item.date;
      break;
    }
  }
  return { lower, upper };
}
