# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

import pandas as pd
import pytest

from openciclo.evaluation.metrics import (
    abs_error_days,
    history_bucket,
    summarize_by_history,
    summarize_metrics,
    within_k,
)


def test_window_metrics() -> None:
    assert abs_error_days(28, 30) == 2
    assert within_k(28, 30, 2) is True
    assert within_k(28, 31, 2) is False


def test_summarize_metrics_from_real_rows() -> None:
    rows = pd.DataFrame(
        [
            {
                "model_id": "v0.baseline.median",
                "subgroup": "regular",
                "abs_error": 1,
                "nll": 0.5,
                "brier_within_2": 0.1,
                "in_interval_80": 1,
                "interval_width": 6,
            },
            {
                "model_id": "v0.baseline.median",
                "subgroup": "regular",
                "abs_error": 3,
                "nll": 1.5,
                "brier_within_2": 0.3,
                "in_interval_80": 0,
                "interval_width": 8,
            },
        ]
    )
    summary = summarize_metrics(rows)
    overall = summary[summary["subgroup"] == "all"].iloc[0]
    assert overall["n"] == 2
    assert abs(float(overall["mae"]) - 2.0) < 1e-9
    assert abs(float(overall["within_2"]) - 0.5) < 1e-9


def test_history_bucket_edges() -> None:
    assert [history_bucket(n) for n in (0, 1, 2, 3, 5, 6, 11, 12, 40)] == [
        "0",
        "1-2",
        "1-2",
        "3-5",
        "3-5",
        "6-11",
        "6-11",
        "12+",
        "12+",
    ]
    with pytest.raises(ValueError):
        history_bucket(-1)


def test_summarize_by_history_groups_and_survives_repeated_index() -> None:
    base = {"nll": 1.0, "brier_within_2": 0.2, "in_interval_80": 1, "interval_width": 6}
    one = pd.DataFrame(
        [
            {**base, "model_id": "a", "n_lengths_visible": 0, "abs_error": 4},
            {**base, "model_id": "a", "n_lengths_visible": 7, "abs_error": 2},
        ]
    )
    two = one.assign(model_id="b", abs_error=[6, 0])
    # Concatenated without ignore_index, as frames from separate runs often are.
    summary = summarize_by_history(pd.concat([one, two]))
    got = {(row.model_id, row.subgroup): row.mae for row in summary.itertuples()}
    assert got == {
        ("a", "history 0"): 4.0,
        ("a", "history 6-11"): 2.0,
        ("b", "history 0"): 6.0,
        ("b", "history 6-11"): 0.0,
    }
