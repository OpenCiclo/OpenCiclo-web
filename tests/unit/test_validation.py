# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from datetime import date

from openciclo.data.validation import validate_history, validate_observations
from openciclo.schemas.cycle import PeriodStart
from openciclo.schemas.enums import IssueSeverity, ObservationStatus
from openciclo.schemas.observations import DailyObservation


def test_duplicate_start_is_an_error() -> None:
    issues = validate_history(
        [
            PeriodStart(date=date(2026, 6, 1)),
            PeriodStart(date=date(2026, 6, 1)),
        ]
    )
    assert any(issue.code == "duplicate_period_start" for issue in issues)
    assert any(issue.severity is IssueSeverity.ERROR for issue in issues)


def test_long_cycle_is_kept_not_deleted() -> None:
    issues = validate_history(
        [
            PeriodStart(date=date(2026, 6, 1)),
            PeriodStart(date=date(2026, 8, 15)),
        ]
    )
    codes = {issue.code for issue in issues}
    assert "suspiciously_long_cycle" in codes or "unusual_long_cycle" in codes
    assert not any(issue.severity is IssueSeverity.ERROR for issue in issues)


def _codes_for_cycle(length_days: int) -> set[str]:
    start = date(2026, 6, 1)
    later = date.fromordinal(start.toordinal() + length_days)
    return {
        issue.code for issue in validate_history([PeriodStart(date=start), PeriodStart(date=later)])
    }


def test_usual_band_matches_the_24_to_38_day_adult_range() -> None:
    # Same range the Learn articles give for "worth getting checked".
    assert "unusual_short_cycle" in _codes_for_cycle(23)
    assert "unusual_short_cycle" not in _codes_for_cycle(24)
    assert not {"unusual_short_cycle", "unusual_long_cycle"} & _codes_for_cycle(28)
    assert "unusual_long_cycle" not in _codes_for_cycle(38)
    assert "unusual_long_cycle" in _codes_for_cycle(39)


def test_unusual_cycles_are_notes_that_keep_the_data() -> None:
    for length in (23, 39):
        issues = validate_history(
            [
                PeriodStart(date=date(2026, 6, 1)),
                PeriodStart(date=date.fromordinal(date(2026, 6, 1).toordinal() + length)),
            ]
        )
        unusual = [issue for issue in issues if issue.code.startswith("unusual_")]
        assert unusual and all(issue.severity is IssueSeverity.NOTE for issue in unusual)


def test_unknown_status_is_not_a_negative_observation() -> None:
    issues = validate_history(
        [
            PeriodStart(date=date(2026, 6, 1), status=ObservationStatus.UNKNOWN),
            PeriodStart(date=date(2026, 6, 29)),
        ]
    )
    assert any(issue.code == "unknown_status_preserved" for issue in issues)
    assert all(issue.code != "period_did_not_happen" for issue in issues)


def test_gap_without_log_is_unknown_not_negative() -> None:
    issues = validate_history(
        [PeriodStart(date=date(2026, 6, 1))],
        reference_date=date(2026, 7, 14),
    )
    assert any(issue.code == "possibly_incomplete_history" for issue in issues)
    assert all(issue.severity is not IssueSeverity.ERROR for issue in issues)


def test_period_end_before_start() -> None:
    issues = validate_history(
        [PeriodStart(date=date(2026, 6, 10))],
        period_ends={date(2026, 6, 10): date(2026, 6, 1)},
    )
    assert any(issue.code == "period_end_before_start" for issue in issues)


def test_future_start_warning() -> None:
    issues = validate_history(
        [PeriodStart(date=date(2026, 8, 1))],
        reference_date=date(2026, 7, 1),
    )
    assert any(issue.code == "future_period_start" for issue in issues)


def test_empty_history_error() -> None:
    issues = validate_history([])
    assert issues[0].code == "empty_history"


def test_observation_not_treated_as_required() -> None:
    issues = validate_observations(
        [DailyObservation(date=date(2026, 6, 2), cramps=None)],
        reference_date=date(2026, 6, 10),
    )
    assert issues == []


def test_implausible_bbt_is_kept() -> None:
    issues = validate_observations([DailyObservation(date=date(2026, 6, 2), bbt_celsius=12.0)])
    assert any(issue.code == "implausible_bbt" for issue in issues)
    assert all(issue.severity is not IssueSeverity.ERROR for issue in issues)
