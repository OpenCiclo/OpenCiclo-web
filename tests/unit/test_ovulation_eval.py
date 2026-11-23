# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from datetime import date, timedelta
from pathlib import Path

import pandas as pd

from openciclo.data.mcphases import LhCycle, load_mcphases_lh_cycles
from openciclo.evaluation.ovulation import PRIMARY, main, score, summarize

COLUMNS = ["id", "study_interval", "day_in_study", "phase", "lh"]


def _synthetic_csv(path: Path) -> Path:
    """Invented rows: one person, three 28-day cycles; LH peaks on day 14, then a flat cycle."""

    rows = []
    for cycle in range(3):
        start = 1 + cycle * 28
        for day in range(28):
            phase = "Menstrual" if day < 4 else "Follicular"
            lh = 5.0
            if cycle < 2 and day == 13:
                lh = 40.0
            rows.append([90001, 2024, start + day, phase, lh])
    rows.append([90001, 2024, 85, "Menstrual", 5.0])
    pd.DataFrame(rows, columns=COLUMNS).to_csv(path, index=False)
    return path


def test_lh_cycles_keep_clear_peaks_only(tmp_path: Path) -> None:
    cycles = load_mcphases_lh_cycles(_synthetic_csv(tmp_path / "lh.csv"))
    assert [c.cycle_index for c in cycles] == [0, 1]  # the flat third cycle has no peak
    first = cycles[0]
    assert first.length_days == 28
    assert first.lh_peak_offset == 13
    assert first.ovulation_offset == 14
    assert len(first.history) == 1
    assert len(cycles[1].history) == 2


def _cycle(length: int, ovulation: int, n_history: int) -> LhCycle:
    history = [date(2026, 1, 1) + timedelta(days=28 * i) for i in range(n_history)]
    return LhCycle(
        person_id="p",
        user_id="p-1",
        cycle_index=n_history - 1,
        length_days=length,
        lh_peak_offset=ovulation - 1,
        history=history,
    )


def test_score_and_summary_cover_every_rule() -> None:
    steps = score([_cycle(28, 15, 3), _cycle(30, 17, 4)])
    summary = summarize(steps)
    assert PRIMARY in set(summary["rule"])
    primary = summary[summary["rule"] == PRIMARY].iloc[0]
    assert primary["n"] == 2
    assert 0.0 <= primary["cov_80"] <= 1.0
    assert primary["width"] >= 7
    baseline = summary[summary["rule"].str.startswith("phases today")].iloc[0]
    assert baseline["width"] == 7


def test_cli_writes_aggregates_only(tmp_path: Path) -> None:
    csv = _synthetic_csv(tmp_path / "lh.csv")
    out = tmp_path / "out"
    assert main(["--mcphases-csv", str(csv), "--out", str(out)]) == 0
    assert sorted(p.name for p in out.iterdir()) == [
        "ovulation_mcphases_report.md",
        "ovulation_mcphases_summary.csv",
    ]
    summary = pd.read_csv(out / "ovulation_mcphases_summary.csv")
    assert "person_id" not in summary.columns
    assert "user_id" not in summary.columns
