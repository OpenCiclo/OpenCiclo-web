# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Dump Python forecast vectors for TypeScript parity tests. Not a model-selection step."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import numpy as np

from openciclo import predict
from openciclo.artifacts.release import load_released_model
from openciclo.forecasting.distribution import discrete_laplace_pmf, estimate_scale
from openciclo.forecasting.ovulation import (
    OvulationEstimate,
    estimate_ovulation,
    estimate_ovulation_known_length,
    luteal_pmf,
)
from openciclo.models.shrinkage import mixed_scale, shrink_toward_prior
from openciclo.pregnancy import (
    PregnancyDating,
    conception_date,
    due_date_from,
    gestational_age,
    likely_window,
    term_for,
    trimester_for,
    weeks_left,
)
from openciclo.schemas.config import ForecastConfig, literature_prior

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests" / "fixtures" / "forecast_parity.json"


def _forecast_payload(
    history: list[date],
    reference: date,
    excluded: tuple[date, ...] = (),
    min_scale: float | None = None,
) -> dict[str, object]:
    config = load_released_model().to_forecast_config()
    if min_scale is not None:
        config = config.model_copy(update={"min_laplace_scale": min_scale})
    forecast = predict(history, reference_date=reference, config=config, excluded_starts=excluded)
    dist = forecast.cycle_length_distribution
    return {
        "history": [day.isoformat() for day in history],
        "reference_date": reference.isoformat(),
        "excluded_starts": [day.isoformat() for day in excluded],
        "min_laplace_scale": min_scale,
        "most_likely_date": forecast.most_likely_date.isoformat(),
        "most_likely_cycle_length": forecast.most_likely_cycle_length,
        "uncertainty": forecast.uncertainty.value,
        "model_id": forecast.model_id,
        "model_version": forecast.model_version,
        "probability_within_next_n_days": {
            str(k): v for k, v in forecast.probability_within_next_n_days.items()
        },
        "probability_within_n_days_of_point": {
            str(k): v for k, v in forecast.probability_within_n_days_of_point.items()
        },
        "daily_probabilities": [
            {"date": item.date.isoformat(), "probability": item.probability}
            for item in forecast.daily_probabilities
        ],
        "point_estimate": dist.point_estimate,
        "scale": dist.scale,
        "assumption": dist.assumption,
        "support_days": dist.support_days,
        "probabilities": dist.probabilities,
        "notes": forecast.notes,
    }


def _ovulation_payload(estimate: OvulationEstimate | None) -> dict[str, object] | None:
    if estimate is None:
        return None
    return {
        "cycle_start": estimate.cycle_start.isoformat(),
        "offsets": estimate.offsets,
        "probabilities": estimate.probabilities,
        "most_likely_offset": estimate.most_likely_offset,
        "window_start_offset": estimate.window_start_offset,
        "window_end_offset": estimate.window_end_offset,
        "window_probability": estimate.window_probability,
    }


def _ovulation_cases() -> dict[str, object]:
    histories = [
        ([date(2026, 6, 1)], date(2026, 6, 1), 5),
        ([date(2026, 5, 2), date(2026, 6, 1), date(2026, 6, 29)], date(2026, 7, 20), 5),
        (
            [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26), date(2026, 3, 26)],
            date(2026, 3, 26),
            4,
        ),
        (
            [date(2025, 11, 1), date(2025, 12, 15), date(2026, 1, 10), date(2026, 3, 1)],
            date(2026, 3, 15),
            7,
        ),
    ]
    from_forecast = []
    for history, reference, bleed in histories:
        forecast = predict(history, reference_date=reference)
        from_forecast.append(
            {
                "history": [day.isoformat() for day in history],
                "reference_date": reference.isoformat(),
                "bleed_days": bleed,
                "expected": _ovulation_payload(estimate_ovulation(forecast, bleed_days=bleed)),
            }
        )
    known = []
    for length, bleed in ((21, 5), (28, 5), (35, 5), (20, 6), (12, 6), (8, 7)):
        start = date(2026, 4, 1)
        next_start = date.fromordinal(start.toordinal() + length)
        known.append(
            {
                "cycle_start": start.isoformat(),
                "next_start": next_start.isoformat(),
                "bleed_days": bleed,
                "expected": _ovulation_payload(
                    estimate_ovulation_known_length(start, next_start, bleed_days=bleed)
                ),
            }
        )
    days, probs = luteal_pmf()
    return {
        "luteal": {"days": days, "probabilities": probs},
        "from_forecast": from_forecast,
        "known_length": known,
    }


def _pregnancy_cases() -> dict[str, object]:
    datings: list[tuple[dict[str, object], PregnancyDating]] = [
        (
            {"method": "lmp", "lmp": "2026-01-10", "cycleLength": None},
            PregnancyDating("lmp", lmp=date(2026, 1, 10)),
        ),
        (
            {"method": "lmp", "lmp": "2026-01-10", "cycleLength": 32},
            PregnancyDating("lmp", lmp=date(2026, 1, 10), cycle_length=32),
        ),
        (
            {"method": "lmp", "lmp": "2026-01-10", "cycleLength": 45},
            PregnancyDating("lmp", lmp=date(2026, 1, 10), cycle_length=45),
        ),
        (
            {"method": "lmp", "lmp": "2026-01-10", "cycleLength": 24},
            PregnancyDating("lmp", lmp=date(2026, 1, 10), cycle_length=24),
        ),
        (
            {"method": "dueDate", "dueDate": "2026-10-20"},
            PregnancyDating("dueDate", due_date=date(2026, 10, 20)),
        ),
        (
            {"method": "ultrasound", "scanDate": "2026-03-02", "weeks": 8, "days": 3},
            PregnancyDating("ultrasound", scan_date=date(2026, 3, 2), weeks=8, days=3),
        ),
        (
            {"method": "conception", "conception": "2026-01-24"},
            PregnancyDating("conception", conception=date(2026, 1, 24)),
        ),
        (
            {"method": "transfer", "transfer": "2026-01-29", "embryoAge": 5},
            PregnancyDating("transfer", transfer=date(2026, 1, 29), embryo_age=5),
        ),
        (
            {"method": "transfer", "transfer": "2026-01-29", "embryoAge": 3},
            PregnancyDating("transfer", transfer=date(2026, 1, 29), embryo_age=3),
        ),
    ]
    due_dates = [{"dating": raw, "due_date": due_date_from(d).isoformat()} for raw, d in datings]
    due = date(2026, 10, 17)
    ages = []
    for day in (
        "2026-01-10",
        "2026-01-09",
        "2026-01-24",
        "2026-04-10",
        "2026-04-17",
        "2026-07-24",
        "2026-07-25",
        "2026-09-26",
        "2026-10-17",
        "2026-10-31",
    ):
        weeks, days, total = gestational_age(due, date.fromisoformat(day))
        ages.append(
            {
                "due_date": due.isoformat(),
                "date": day,
                "weeks": weeks,
                "days": days,
                "total_days": total,
                "trimester": trimester_for(total),
                "term": term_for(total),
                "weeks_left": weeks_left(due, date.fromisoformat(day)),
            }
        )
    start, end = likely_window(due)
    return {
        "due_dates": due_dates,
        "ages": ages,
        "conception": {"due_date": due.isoformat(), "expected": conception_date(due).isoformat()},
        "likely_window": {
            "due_date": due.isoformat(),
            "start": start.isoformat(),
            "end": end.isoformat(),
        },
    }


def main() -> None:
    released = load_released_model()
    prior = literature_prior()
    config = ForecastConfig(shrinkage_k=2.0)
    support = np.arange(1, 91, dtype=int)
    laplace = discrete_laplace_pmf(28.0, 2.0, support)

    payload = {
        "engine_version": released.engine_version,
        "released_model_id": released.model_id,
        "released_dataset": released.dataset,
        "population_median": released.population_median,
        "population_mad": released.population_mad,
        "population_mean": released.population_mean,
        "shrinkage_k": released.shrinkage_k,
        "length_family": released.length_family,
        "shrinkage_cases": [
            {
                "personal": 22.0,
                "n": 2,
                "k": 2.0,
                "prior_median": prior.median_length,
                "expected": shrink_toward_prior(22.0, 2, prior, config),
            },
            {
                "personal": 22.0,
                "n": 1,
                "k": 2.0,
                "prior_median": prior.median_length,
                "expected": shrink_toward_prior(22.0, 1, prior, config),
            },
            {
                "personal": 22.0,
                "n": 8,
                "k": 2.0,
                "prior_median": prior.median_length,
                "expected": shrink_toward_prior(22.0, 8, prior, config),
            },
        ],
        "mixed_scale_cases": [
            {
                "lengths": [28.0, 28.0, 28.0],
                "point": 28.0,
                "shrinkage_k": 2.0,
                "min_scale": 0.75,
                "prior_median": prior.median_length,
                "prior_mad": prior.mad_length,
                "expected": mixed_scale(
                    [28.0, 28.0, 28.0],
                    28.0,
                    prior,
                    shrinkage_k=2.0,
                    min_scale=0.75,
                ),
            },
            {
                "lengths": [22.0, 30.0, 28.0],
                "point": 28.0,
                "shrinkage_k": 2.0,
                "min_scale": 0.75,
                "prior_median": prior.median_length,
                "prior_mad": prior.mad_length,
                "expected": mixed_scale(
                    [22.0, 30.0, 28.0],
                    28.0,
                    prior,
                    shrinkage_k=2.0,
                    min_scale=0.75,
                ),
            },
        ],
        "estimate_scale_cases": [
            {
                "lengths": [28.0],
                "point": 28.0,
                "min_scale": 0.75,
                "prior_mad": prior.mad_length,
                "expected": estimate_scale(np.array([28.0]), 28.0, prior, 0.75),
            }
        ],
        "laplace_pmf": {
            "center": 28.0,
            "scale": 2.0,
            "support_days": support.tolist(),
            "probabilities": [float(x) for x in laplace.tolist()],
        },
        "ovulation": _ovulation_cases(),
        "pregnancy": _pregnancy_cases(),
        "forecasts": [
            _forecast_payload([date(2026, 6, 1)], date(2026, 6, 1)),
            _forecast_payload(
                [date(2026, 5, 2), date(2026, 6, 1), date(2026, 6, 29)],
                date(2026, 7, 20),
            ),
            _forecast_payload(
                [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26), date(2026, 3, 26)],
                date(2026, 3, 26),
            ),
            _forecast_payload(
                [date(2025, 11, 1), date(2025, 12, 15), date(2026, 1, 10), date(2026, 3, 1)],
                date(2026, 3, 15),
            ),
            # A pregnancy between the third and fourth start, then a loss: its interval
            # is left out and the scale floor is raised for the first cycles after it.
            _forecast_payload(
                [
                    date(2025, 1, 1),
                    date(2025, 1, 29),
                    date(2025, 2, 26),
                    date(2026, 1, 10),
                    date(2026, 2, 8),
                ],
                date(2026, 2, 20),
                excluded=(date(2025, 2, 26),),
            ),
            _forecast_payload(
                [
                    date(2025, 1, 1),
                    date(2025, 1, 29),
                    date(2025, 2, 26),
                    date(2026, 1, 10),
                    date(2026, 2, 8),
                ],
                date(2026, 2, 20),
                excluded=(date(2025, 2, 26),),
                min_scale=3.0,
            ),
        ],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
