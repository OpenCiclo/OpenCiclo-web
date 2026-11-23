# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from datetime import date, timedelta

import pytest

from openciclo.constants import LUTEAL_MAX_DAYS, LUTEAL_MIN_DAYS
from openciclo.forecasting.distribution import length_distribution
from openciclo.forecasting.engine import predict
from openciclo.forecasting.ovulation import (
    estimate_ovulation,
    estimate_ovulation_known_length,
    luteal_pmf,
    most_likely_index,
    ovulation_estimate,
    ovulation_pmf,
    point_mass,
    shortest_interval,
)
from openciclo.schemas.config import ForecastConfig


def test_luteal_pmf_normalises_on_its_range() -> None:
    days, probs = luteal_pmf()
    assert days == list(range(LUTEAL_MIN_DAYS, LUTEAL_MAX_DAYS + 1))
    assert sum(probs) == pytest.approx(1.0)
    assert days[most_likely_index(probs)] == 12  # 12.4 rounds to 12


def test_known_length_is_next_start_minus_luteal() -> None:
    pmf = ovulation_pmf(point_mass(29), bleed_days=5)
    assert pmf is not None
    offsets, probs = pmf
    assert offsets[0] == 29 - LUTEAL_MAX_DAYS
    assert offsets[-1] == 29 - LUTEAL_MIN_DAYS
    assert offsets[most_likely_index(probs)] == 17  # cycle day 18, 12 days before day 30


def test_never_inside_expected_bleeding() -> None:
    pmf = ovulation_pmf(point_mass(20), bleed_days=6)
    assert pmf is not None
    offsets, probs = pmf
    assert offsets[0] == 6
    assert sum(probs) == pytest.approx(1.0)


def test_no_estimate_when_the_cycle_is_all_bleeding() -> None:
    assert ovulation_pmf(point_mass(8), bleed_days=7) is None
    assert estimate_ovulation_known_length(date(2026, 1, 1), date(2026, 1, 1), bleed_days=5) is None


def test_shortest_interval_prefers_more_mass_then_earliest() -> None:
    assert shortest_interval([0.1, 0.4, 0.4, 0.1], 0.8) == (1, 2, pytest.approx(0.8))
    lo, hi, inside = shortest_interval([0.25, 0.25, 0.25, 0.25], 0.5)
    assert (lo, hi) == (0, 1)
    assert inside == pytest.approx(0.5)
    assert shortest_interval([1.0], 0.8) == (0, 0, pytest.approx(1.0))


def test_most_likely_index_takes_the_earliest_tie() -> None:
    assert most_likely_index([0.2, 0.4, 0.4]) == 1


def test_window_widens_with_cycle_length_uncertainty() -> None:
    config = ForecastConfig()
    narrow = ovulation_estimate(
        date(2026, 1, 1), length_distribution(29.0, 0.75, config), bleed_days=5
    )
    wide = ovulation_estimate(
        date(2026, 1, 1), length_distribution(29.0, 4.0, config), bleed_days=5
    )
    assert narrow is not None and wide is not None
    narrow_width = narrow.window_end_offset - narrow.window_start_offset
    wide_width = wide.window_end_offset - wide.window_start_offset
    assert wide_width > narrow_width
    assert narrow.window_probability >= 0.8
    assert wide.window_probability >= 0.8


def test_estimate_dates_and_probability_lookup() -> None:
    start = date(2026, 3, 1)
    est = estimate_ovulation_known_length(start, start + timedelta(days=28), bleed_days=5)
    assert est is not None
    assert est.most_likely_date == start + timedelta(days=16)
    assert est.window_start <= est.most_likely_date <= est.window_end
    assert est.probability_on(est.most_likely_date) == max(est.probabilities)
    assert est.probability_on(start) == 0.0


def test_estimate_from_forecast_uses_the_full_length_distribution() -> None:
    starts = [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26), date(2026, 3, 26)]
    early = predict(starts, reference_date=starts[-1])
    late = predict(starts, reference_date=starts[-1] + timedelta(days=27))
    a = estimate_ovulation(early, bleed_days=5)
    b = estimate_ovulation(late, bleed_days=5)
    assert a is not None and b is not None
    assert a.most_likely_date == b.most_likely_date
    assert (a.window_start, a.window_end) == (b.window_start, b.window_end)
    assert a.cycle_start == starts[-1]
