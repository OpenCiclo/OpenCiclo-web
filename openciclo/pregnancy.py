# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Pregnancy dates: the due date from what is known, and gestational age, trimester and term.

Mirrors ``apps/web/lib/pregnancy/dating.ts`` (parity vectors in
``tests/fixtures/forecast_parity.json``, "pregnancy"). Sources in docs/modeling.md
("Pregnancy dates"): ACOG Committee Opinion 700 (due date methods), Naegele's rule with
Parikh's cycle correction (StatPearls), ACOG Committee Opinion 579 (term labels).
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Literal

PREGNANCY_DAYS = 280
OVULATION_TO_DUE_DAYS = 266
STANDARD_CYCLE_DAYS = 28
MAX_CYCLE_CORRECTION_DAYS = 7
REGULAR_CYCLE_MIN = 21
REGULAR_CYCLE_MAX = 35
SECOND_TRIMESTER_DAYS = 14 * 7
THIRD_TRIMESTER_DAYS = 28 * 7
LIKELY_WINDOW_FROM_DAYS = 37 * 7
LIKELY_WINDOW_TO_DAYS = 42 * 7

DatingMethod = Literal["lmp", "dueDate", "ultrasound", "conception", "transfer"]
Trimester = Literal[1, 2, 3]
TermLabel = Literal["preterm", "earlyTerm", "fullTerm", "lateTerm", "postterm"]


@dataclass(frozen=True)
class PregnancyDating:
    """What was entered to date the pregnancy. Only the chosen method's fields are set."""

    method: DatingMethod
    lmp: date | None = None
    cycle_length: int | None = None
    due_date: date | None = None
    scan_date: date | None = None
    weeks: int | None = None
    days: int | None = None
    conception: date | None = None
    transfer: date | None = None
    embryo_age: int | None = None


def cycle_correction(cycle_length: int | None) -> int:
    """Parikh's correction in days, capped at +/-7. Zero without a usual cycle length."""

    if cycle_length is None:
        return 0
    raw = math.floor(cycle_length + 0.5) - STANDARD_CYCLE_DAYS  # Math.round in the TS twin
    return max(-MAX_CYCLE_CORRECTION_DAYS, min(MAX_CYCLE_CORRECTION_DAYS, raw))


def irregular_for_lmp_dating(cycle_length: int | None) -> bool:
    if cycle_length is None:
        return False
    return cycle_length < REGULAR_CYCLE_MIN or cycle_length > REGULAR_CYCLE_MAX


def due_date_from(dating: PregnancyDating) -> date:
    method = dating.method
    if method == "lmp" and dating.lmp is not None:
        return dating.lmp + timedelta(days=PREGNANCY_DAYS + cycle_correction(dating.cycle_length))
    if method == "dueDate" and dating.due_date is not None:
        return dating.due_date
    if (
        method == "ultrasound"
        and dating.scan_date is not None
        and dating.weeks is not None
        and dating.days is not None
    ):
        return dating.scan_date + timedelta(days=PREGNANCY_DAYS - (dating.weeks * 7 + dating.days))
    if method == "conception" and dating.conception is not None:
        return dating.conception + timedelta(days=OVULATION_TO_DUE_DAYS)
    if method == "transfer" and dating.transfer is not None and dating.embryo_age is not None:
        return dating.transfer + timedelta(days=OVULATION_TO_DUE_DAYS - dating.embryo_age)
    raise ValueError(f"incomplete dating for method {method!r}")


def gestational_days(due_date: date, day: date) -> int:
    return PREGNANCY_DAYS - (due_date - day).days


def gestational_age(due_date: date, day: date) -> tuple[int, int, int]:
    """(weeks, days, total days) on ``day``, counted from 0. Negative ages clamp to 0+0."""

    total = max(0, gestational_days(due_date, day))
    return total // 7, total % 7, total


def trimester_for(total_days: int) -> Trimester:
    if total_days >= THIRD_TRIMESTER_DAYS:
        return 3
    if total_days >= SECOND_TRIMESTER_DAYS:
        return 2
    return 1


def term_for(total_days: int) -> TermLabel:
    if total_days >= 42 * 7:
        return "postterm"
    if total_days >= 41 * 7:
        return "lateTerm"
    if total_days >= 39 * 7:
        return "fullTerm"
    if total_days >= 37 * 7:
        return "earlyTerm"
    return "preterm"


def date_at_gestational_days(due_date: date, total_days: int) -> date:
    return due_date + timedelta(days=total_days - PREGNANCY_DAYS)


def conception_date(due_date: date) -> date:
    return date_at_gestational_days(due_date, PREGNANCY_DAYS - OVULATION_TO_DUE_DAYS)


def likely_window(due_date: date) -> tuple[date, date]:
    return (
        date_at_gestational_days(due_date, LIKELY_WINDOW_FROM_DAYS),
        date_at_gestational_days(due_date, LIKELY_WINDOW_TO_DAYS),
    )


def weeks_left(due_date: date, day: date) -> int:
    return max(0, (due_date - day).days // 7)
