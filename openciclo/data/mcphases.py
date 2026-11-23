# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Load mcPHASES self-report rows into OpenCiclo period-start sequences.

Restricted microdata stay on disk. This module never writes them into git.
"""

from __future__ import annotations

import os
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
from pydantic import BaseModel, ConfigDict, Field

from openciclo.constants import MCPHASES_CSV_ENV, MCPHASES_EPOCH, MENSTRUAL_PHASE
from openciclo.data.cycles import cycle_lengths

DEFAULT_MCPHASES_CSV = (
    Path(__file__).resolve().parents[2]
    / "training"
    / "dataset-do-not-commit"
    / "hormones_and_selfreport.csv"
)
# Continue a Menstrual run across a single missing study day (gap of 2 in the index).
MAX_MENSTRUAL_GAP_DAYS = 2


class McphasesSeries(BaseModel):
    """One (person, study interval) sequence of period starts."""

    model_config = ConfigDict(extra="forbid")

    person_id: str
    study_interval: int
    user_id: str
    subgroup: str
    period_starts: list[date]
    study_start_days: list[int] = Field(default_factory=list)

    @property
    def cycle_lengths(self) -> list[int]:
        return cycle_lengths(list(self.period_starts))


def default_mcphases_csv() -> Path:
    env = os.environ.get(MCPHASES_CSV_ENV)
    if env:
        return Path(env)
    return DEFAULT_MCPHASES_CSV


def mcphases_csv_available(path: Path | None = None) -> bool:
    return (path or default_mcphases_csv()).is_file()


def study_day_to_date(day_in_study: int, *, epoch: date = MCPHASES_EPOCH) -> date:
    """Map a study-relative day index to a calendar date. Not the participant's real calendar."""

    return epoch + timedelta(days=int(day_in_study))


def menstrual_onset_days(
    days: list[int],
    phases: list[str],
    *,
    max_gap: int = MAX_MENSTRUAL_GAP_DAYS,
) -> list[int]:
    """First day of each Menstrual run. A 1-day hole in the index does not split a run."""

    onsets: list[int] = []
    last_menstrual_day: int | None = None
    prev_phase: str | None = None
    for day, phase in zip(days, phases, strict=False):
        if phase != MENSTRUAL_PHASE:
            prev_phase = phase
            continue
        if last_menstrual_day is None:
            onsets.append(day)
        else:
            gap = day - last_menstrual_day
            saw_other = prev_phase is not None and prev_phase != MENSTRUAL_PHASE
            if saw_other or gap > max_gap:
                onsets.append(day)
        last_menstrual_day = day
        prev_phase = phase
    return onsets


def load_mcphases_series(path: Path | None = None) -> list[McphasesSeries]:
    csv_path = path or default_mcphases_csv()
    if not csv_path.is_file():
        raise FileNotFoundError(
            f"mcPHASES CSV not found at {csv_path}. Place the DUA-restricted file locally "
            f"or set {MCPHASES_CSV_ENV}."
        )
    frame = pd.read_csv(csv_path)
    required = {"id", "study_interval", "day_in_study", "phase"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"mcPHASES CSV missing columns: {sorted(missing)}")

    series: list[McphasesSeries] = []
    grouped = frame.groupby(["id", "study_interval"], sort=True)
    for (person_id, interval), group in grouped:
        ordered = group.sort_values("day_in_study")
        days = [int(value) for value in ordered["day_in_study"].tolist()]
        phases = [str(value) if pd.notna(value) else "" for value in ordered["phase"].tolist()]
        onsets = menstrual_onset_days(days, phases)
        if not onsets:
            continue
        interval_int = int(str(interval))
        person = str(person_id)
        series.append(
            McphasesSeries(
                person_id=person,
                study_interval=interval_int,
                user_id=f"{person}-{interval_int}",
                subgroup=f"interval_{interval_int}",
                period_starts=[study_day_to_date(day) for day in onsets],
                study_start_days=onsets,
            )
        )
    return series


def split_by_person(
    series: list[McphasesSeries],
    *,
    test_fraction: float = 0.3,
    seed: int = 2026,
) -> tuple[list[McphasesSeries], list[McphasesSeries]]:
    """Hold out whole people. Both intervals of a test person stay in test."""

    import numpy as np

    people = sorted({item.person_id for item in series})
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(people))
    n_test = max(1, int(round(len(people) * test_fraction)))
    test_ids = {people[int(i)] for i in order[:n_test]}
    train = [item for item in series if item.person_id not in test_ids]
    test = [item for item in series if item.person_id in test_ids]
    return train, test


# Cycles with a usable urinary LH peak (docs/evaluation.md "Estimated ovulation"). Rules fixed
# before the ovulation model was scored: a cycle of 18-50 days, LH measured on at least 60% of
# its days, a peak at least 2.5 times the cycle's median LH, and not within 5 days of either start.
LH_CYCLE_MIN_DAYS = 18
LH_CYCLE_MAX_DAYS = 50
LH_MIN_COVERAGE = 0.6
LH_PEAK_RATIO = 2.5
LH_EDGE_DAYS = 5


class LhCycle(BaseModel):
    """A completed cycle whose LH peak dates ovulation. Offsets count from its first day."""

    model_config = ConfigDict(extra="forbid")

    person_id: str
    user_id: str
    cycle_index: int
    length_days: int
    lh_peak_offset: int
    history: list[date]

    @property
    def ovulation_offset(self) -> int:
        """Reference ovulation: the day after the LH peak."""

        return self.lh_peak_offset + 1


def load_mcphases_lh_cycles(
    path: Path | None = None,
    series: list[McphasesSeries] | None = None,
) -> list[LhCycle]:
    """Completed cycles with a clear LH peak, each with the period starts known at its start."""

    import math
    import statistics

    csv_path = path or default_mcphases_csv()
    frame = pd.read_csv(csv_path, usecols=["id", "study_interval", "day_in_study", "lh"])
    sequences = series if series is not None else load_mcphases_series(csv_path)
    out: list[LhCycle] = []
    for item in sequences:
        rows = frame[
            (frame["id"].astype(str) == item.person_id)
            & (frame["study_interval"] == item.study_interval)
        ]
        lh = dict(zip(rows["day_in_study"].astype(int), rows["lh"], strict=False))
        days = item.study_start_days
        for i in range(len(days) - 1):
            start, nxt = days[i], days[i + 1]
            length = nxt - start
            if not (LH_CYCLE_MIN_DAYS <= length <= LH_CYCLE_MAX_DAYS):
                continue
            observed = [
                (day, float(value))
                for day in range(start, nxt)
                if (value := lh.get(day)) is not None
                and not (isinstance(value, float) and math.isnan(value))
            ]
            if len(observed) < LH_MIN_COVERAGE * length:
                continue
            peak_day, peak_value = max(observed, key=lambda pair: pair[1])
            median = statistics.median(value for _, value in observed)
            if median <= 0 or peak_value < LH_PEAK_RATIO * median:
                continue
            if peak_day - start < LH_EDGE_DAYS or nxt - peak_day < LH_EDGE_DAYS:
                continue
            out.append(
                LhCycle(
                    person_id=item.person_id,
                    user_id=item.user_id,
                    cycle_index=i,
                    length_days=length,
                    lh_peak_offset=peak_day - start,
                    history=list(item.period_starts[: i + 1]),
                )
            )
    return out
