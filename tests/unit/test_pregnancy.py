# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from datetime import date

import pytest

from openciclo.pregnancy import (
    PregnancyDating,
    conception_date,
    cycle_correction,
    due_date_from,
    gestational_age,
    irregular_for_lmp_dating,
    likely_window,
    term_for,
    trimester_for,
    weeks_left,
)


def test_lmp_adds_280_days_with_a_capped_cycle_correction() -> None:
    lmp = date(2026, 1, 10)
    assert due_date_from(PregnancyDating("lmp", lmp=lmp)) == date(2026, 10, 17)
    assert due_date_from(PregnancyDating("lmp", lmp=lmp, cycle_length=32)) == date(2026, 10, 21)
    assert cycle_correction(45) == 7
    assert cycle_correction(18) == -7
    assert cycle_correction(None) == 0
    assert irregular_for_lmp_dating(36)
    assert not irregular_for_lmp_dating(None)


def test_other_methods() -> None:
    assert due_date_from(PregnancyDating("dueDate", due_date=date(2026, 10, 20))) == date(
        2026, 10, 20
    )
    scan = PregnancyDating("ultrasound", scan_date=date(2026, 3, 2), weeks=8, days=3)
    assert due_date_from(scan) == date(2026, 10, 9)
    conception = PregnancyDating("conception", conception=date(2026, 1, 24))
    assert due_date_from(conception) == date(2026, 10, 17)
    day5 = PregnancyDating("transfer", transfer=date(2026, 1, 29), embryo_age=5)
    assert due_date_from(day5) == date(2026, 10, 17)


def test_incomplete_dating_is_refused() -> None:
    with pytest.raises(ValueError):
        due_date_from(PregnancyDating("ultrasound", scan_date=date(2026, 3, 2)))


def test_age_trimester_term() -> None:
    due = date(2026, 10, 17)
    assert gestational_age(due, date(2026, 4, 13)) == (13, 2, 93)
    assert gestational_age(due, date(2025, 12, 1)) == (0, 0, 0)
    assert trimester_for(13 * 7 + 6) == 1
    assert trimester_for(14 * 7) == 2
    assert trimester_for(28 * 7) == 3
    assert term_for(37 * 7) == "earlyTerm"
    assert term_for(39 * 7) == "fullTerm"
    assert term_for(41 * 7) == "lateTerm"
    assert term_for(42 * 7) == "postterm"
    assert conception_date(due) == date(2026, 1, 24)
    assert likely_window(due) == (date(2026, 9, 26), date(2026, 10, 31))
    assert weeks_left(due, date(2026, 4, 13)) == 26


def test_predict_leaves_out_excluded_intervals() -> None:
    from openciclo.forecasting.engine import predict

    starts = [
        date(2025, 1, 1),
        date(2025, 1, 29),
        date(2025, 2, 26),
        date(2026, 1, 10),
        date(2026, 2, 8),
    ]
    kept = predict(starts, reference_date=starts[-1])
    without = predict(starts, reference_date=starts[-1], excluded_starts=[date(2025, 2, 26)])
    assert without.most_likely_cycle_length < kept.most_likely_cycle_length
    assert without.last_period_start == starts[-1]
