# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from collections.abc import Sequence

import numpy as np
import pandas as pd

from openciclo.forecasting.distribution import (
    central_interval,
    pmf_lookup,
    probability_within_window,
)
from openciclo.schemas.forecast import Forecast


def abs_error_days(predicted_length: int, actual_length: int) -> int:
    return abs(int(predicted_length) - int(actual_length))


def nll(forecast: Forecast, actual_length: int) -> float:
    probability = pmf_lookup(forecast.cycle_length_distribution, actual_length)
    return float(-np.log(probability))


def within_k(predicted_length: int, actual_length: int, k: int) -> bool:
    return abs_error_days(predicted_length, actual_length) <= k


def brier_within_k(forecast: Forecast, actual_length: int, k: int) -> float:
    center = forecast.most_likely_cycle_length
    predicted = probability_within_window(forecast.cycle_length_distribution, center, k)
    outcome = 1.0 if within_k(center, actual_length, k) else 0.0
    return float((predicted - outcome) ** 2)


def interval_stats(
    forecast: Forecast,
    actual_length: int,
    coverage: float = 0.80,
) -> tuple[bool, int, int, int]:
    low, high = central_interval(forecast.cycle_length_distribution, coverage)
    covered = low <= actual_length <= high
    return covered, high - low, low, high


def summarize_metrics(rows: pd.DataFrame) -> pd.DataFrame:
    """Aggregate walk-forward rows. Input must come from actual experiments."""

    if rows.empty:
        return rows

    pieces: list[pd.DataFrame] = []
    for model_id, model_group in rows.groupby("model_id", sort=True):
        pieces.append(_summary_row(model_group, str(model_id), "all"))
        if "subgroup" in model_group.columns:
            for subgroup, sub_group in model_group.groupby("subgroup", sort=True):
                pieces.append(_summary_row(sub_group, str(model_id), str(subgroup)))
    return pd.concat(pieces, ignore_index=True)


# Completed cycles a forecast could see, grouped. Forecasts with little history lean on the
# population prior; with long history they are personal. Reports show both ends.
HISTORY_BUCKETS: tuple[tuple[str, int, int | None], ...] = (
    ("0", 0, 0),
    ("1-2", 1, 2),
    ("3-5", 3, 5),
    ("6-11", 6, 11),
    ("12+", 12, None),
)


def history_bucket(n_lengths_visible: int) -> str:
    for label, low, high in HISTORY_BUCKETS:
        if n_lengths_visible >= low and (high is None or n_lengths_visible <= high):
            return label
    raise ValueError(f"n_lengths_visible must be >= 0, got {n_lengths_visible}")


def summarize_by_history(rows: pd.DataFrame) -> pd.DataFrame:
    """The `summarize_metrics` columns per model and history bucket (`subgroup` = bucket)."""

    if rows.empty or "n_lengths_visible" not in rows.columns:
        return pd.DataFrame()
    order = {label: index for index, (label, _low, _high) in enumerate(HISTORY_BUCKETS)}
    # A fresh index: rows concatenated from several runs can repeat index labels.
    tagged = rows.reset_index(drop=True)
    tagged["history_bucket"] = tagged["n_lengths_visible"].astype(int).map(history_bucket)
    pieces: list[pd.DataFrame] = []
    for model_id, model_group in tagged.groupby("model_id", sort=True):
        for label in sorted(model_group["history_bucket"].unique(), key=order.__getitem__):
            group = model_group[model_group["history_bucket"] == label]
            pieces.append(_summary_row(group, str(model_id), f"history {label}"))
    return pd.concat(pieces, ignore_index=True)


def _summary_row(group: pd.DataFrame, model_id: str, subgroup: str) -> pd.DataFrame:
    errors = group["abs_error"].to_numpy(dtype=float)
    return pd.DataFrame(
        [
            {
                "model_id": model_id,
                "subgroup": subgroup,
                "n": int(len(group)),
                "mae": float(np.mean(errors)),
                "medae": float(np.median(errors)),
                "exact": float(np.mean(errors <= 0)),
                "within_1": float(np.mean(errors <= 1)),
                "within_2": float(np.mean(errors <= 2)),
                "within_3": float(np.mean(errors <= 3)),
                "within_5": float(np.mean(errors <= 5)),
                "nll": float(group["nll"].mean()),
                "brier_within_2": float(group["brier_within_2"].mean()),
                "coverage_80": float(group["in_interval_80"].mean()),
                "width_80": float(group["interval_width"].mean()),
                "ae_p90": float(np.quantile(errors, 0.90)),
            }
        ]
    )


def reliability_bins(
    predicted: Sequence[float],
    outcomes: Sequence[float],
    n_bins: int = 10,
) -> pd.DataFrame:
    """Simple reliability table for predicted probabilities vs binary outcomes."""

    pred = np.asarray(predicted, dtype=float)
    y = np.asarray(outcomes, dtype=float)
    edges = np.linspace(0.0, 1.0, n_bins + 1)
    records: list[dict[str, float | int]] = []
    for i in range(n_bins):
        left, right = edges[i], edges[i + 1]
        if i == n_bins - 1:
            mask = (pred >= left) & (pred <= right)
        else:
            mask = (pred >= left) & (pred < right)
        count = int(mask.sum())
        if count == 0:
            records.append({"bin": i, "p_mean": float("nan"), "y_mean": float("nan"), "n": 0})
            continue
        records.append(
            {
                "bin": i,
                "p_mean": float(pred[mask].mean()),
                "y_mean": float(y[mask].mean()),
                "n": count,
            }
        )
    return pd.DataFrame.from_records(records)
