# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Estimated ovulation as a distribution over days of the cycle.

Ovulation day = next period start − luteal phase. The next start is the forecast's
cycle-length distribution; the luteal phase is a population distribution
(``LUTEAL_*`` in ``openciclo.constants``). Their combination gives a probability for
each day; the app shows the most likely day and the shortest run of days holding
``OVULATION_INTERVAL_COVERAGE`` of it. An estimate from the calendar: it never confirms
ovulation and is not contraception.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from datetime import date, timedelta

import numpy as np
from pydantic import BaseModel, ConfigDict

from openciclo.constants import (
    LUTEAL_MAX_DAYS,
    LUTEAL_MEAN_DAYS,
    LUTEAL_MIN_DAYS,
    LUTEAL_SD_DAYS,
    OVULATION_INTERVAL_COVERAGE,
)
from openciclo.schemas.forecast import Forecast, LengthDistribution

# Masses closer than this count as equal, so Python and TypeScript pick the same day.
TIE_TOLERANCE = 1e-12


class OvulationEstimate(BaseModel):
    """Where ovulation may fall in one cycle. Offsets count days from the cycle's first day (0)."""

    model_config = ConfigDict(extra="forbid")

    cycle_start: date
    offsets: list[int]
    probabilities: list[float]
    most_likely_offset: int
    window_start_offset: int
    window_end_offset: int
    window_probability: float
    coverage: float

    @property
    def most_likely_date(self) -> date:
        return self.cycle_start + timedelta(days=self.most_likely_offset)

    @property
    def window_start(self) -> date:
        return self.cycle_start + timedelta(days=self.window_start_offset)

    @property
    def window_end(self) -> date:
        return self.cycle_start + timedelta(days=self.window_end_offset)

    def probability_on(self, day: date) -> float:
        offset = (day - self.cycle_start).days
        if not self.offsets or offset < self.offsets[0] or offset > self.offsets[-1]:
            return 0.0
        return self.probabilities[offset - self.offsets[0]]


def luteal_pmf(
    mean: float = LUTEAL_MEAN_DAYS,
    sd: float = LUTEAL_SD_DAYS,
    low: int = LUTEAL_MIN_DAYS,
    high: int = LUTEAL_MAX_DAYS,
) -> tuple[list[int], list[float]]:
    """Discrete normal on ``low..high`` days (density at each whole day, normalised)."""

    if sd <= 0 or high < low:
        raise ValueError("luteal distribution needs sd > 0 and high >= low")
    days = list(range(low, high + 1))
    weights = [math.exp(-0.5 * ((day - mean) / sd) ** 2) for day in days]
    total = sum(weights)
    return days, [weight / total for weight in weights]


def point_mass(length_days: int) -> LengthDistribution:
    """A cycle whose next start is known (a closed cycle, or a friend's shared status)."""

    return LengthDistribution(
        support_days=[int(length_days)],
        probabilities=[1.0],
        point_estimate=float(length_days),
        scale=0.0,
        assumption="known_length",
    )


def ovulation_pmf(
    lengths: LengthDistribution,
    *,
    bleed_days: int,
    luteal: tuple[Sequence[int], Sequence[float]] | None = None,
) -> tuple[list[int], list[float]] | None:
    """Probability of ovulation on each offset from the cycle start.

    Days of expected bleeding (offsets below ``bleed_days``) get none: the rest is
    renormalised. None when nothing is left (a cycle too short for any luteal length).
    """

    l_days, l_probs = luteal or luteal_pmf()
    first = max(int(bleed_days), 0)
    mass: dict[int, float] = {}
    for length, p_length in zip(lengths.support_days, lengths.probabilities, strict=True):
        if p_length <= 0.0:
            continue
        for gap, p_gap in zip(l_days, l_probs, strict=True):
            offset = int(length) - int(gap)
            if offset < first:
                continue
            mass[offset] = mass.get(offset, 0.0) + p_length * p_gap
    total = sum(mass.values())
    if not mass or total <= 0.0:
        return None
    offsets = list(range(min(mass), max(mass) + 1))
    return offsets, [mass.get(offset, 0.0) / total for offset in offsets]


def most_likely_index(probabilities: Sequence[float]) -> int:
    """Index of the largest mass; the earliest one among ties."""

    best = 0
    for index, value in enumerate(probabilities):
        if value > probabilities[best] + TIE_TOLERANCE:
            best = index
    return best


def shortest_interval(probabilities: Sequence[float], coverage: float) -> tuple[int, int, float]:
    """Shortest run of consecutive indices holding at least ``coverage`` of the mass.

    Among runs of that length the one with the most mass wins, then the earliest.
    Returns (first index, last index, mass inside), inclusive.
    """

    n = len(probabilities)
    if n == 0:
        raise ValueError("empty distribution")
    cumulative = np.concatenate([[0.0], np.cumsum(np.asarray(probabilities, dtype=np.float64))])
    target = min(max(coverage, 0.0), 1.0) * float(cumulative[-1])
    for width in range(1, n + 1):
        best_start = -1
        best_mass = -1.0
        for start in range(0, n - width + 1):
            inside = float(cumulative[start + width] - cumulative[start])
            if inside > best_mass + TIE_TOLERANCE:
                best_start, best_mass = start, inside
        if best_mass >= target - TIE_TOLERANCE:
            return best_start, best_start + width - 1, best_mass
    return 0, n - 1, float(cumulative[-1])


def ovulation_estimate(
    cycle_start: date,
    lengths: LengthDistribution,
    *,
    bleed_days: int,
    coverage: float = OVULATION_INTERVAL_COVERAGE,
    luteal: tuple[Sequence[int], Sequence[float]] | None = None,
) -> OvulationEstimate | None:
    pmf = ovulation_pmf(lengths, bleed_days=bleed_days, luteal=luteal)
    if pmf is None:
        return None
    offsets, probabilities = pmf
    peak = most_likely_index(probabilities)
    lo, hi, inside = shortest_interval(probabilities, coverage)
    return OvulationEstimate(
        cycle_start=cycle_start,
        offsets=offsets,
        probabilities=probabilities,
        most_likely_offset=offsets[peak],
        window_start_offset=offsets[lo],
        window_end_offset=offsets[hi],
        window_probability=inside,
        coverage=coverage,
    )


def estimate_ovulation(
    forecast: Forecast,
    *,
    bleed_days: int,
    coverage: float = OVULATION_INTERVAL_COVERAGE,
    luteal: tuple[Sequence[int], Sequence[float]] | None = None,
) -> OvulationEstimate | None:
    """Estimated ovulation in the open cycle of ``forecast``.

    Uses the full cycle-length distribution, not the one cut at the reference date, so the
    estimate stays put through the cycle like the anchored next start does.
    """

    return ovulation_estimate(
        forecast.last_period_start,
        forecast.cycle_length_distribution,
        bleed_days=bleed_days,
        coverage=coverage,
        luteal=luteal,
    )


def estimate_ovulation_known_length(
    cycle_start: date,
    next_start: date,
    *,
    bleed_days: int,
    coverage: float = OVULATION_INTERVAL_COVERAGE,
) -> OvulationEstimate | None:
    """Estimated ovulation in a cycle whose next start is known (only the luteal spread)."""

    length = (next_start - cycle_start).days
    if length < 1:
        return None
    return ovulation_estimate(
        cycle_start, point_mass(length), bleed_days=bleed_days, coverage=coverage
    )
