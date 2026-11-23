# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

"""Score estimated-ovulation rules on mcPHASES cycles dated by their urinary LH peak.

Walk-forward: each cycle is forecast from the period starts known on its first day, with the
released model. Metrics fixed before the distribution was scored (docs/evaluation.md):
error of the most likely day, share of reference ovulations inside the window, and whether
the 80% window holds about 80%. Only aggregates are written; the restricted rows stay local.
"""

from __future__ import annotations

import argparse
import math
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from openciclo.artifacts.release import load_released_model
from openciclo.constants import (
    LUTEAL_MAX_DAYS,
    LUTEAL_MIN_DAYS,
    LUTEAL_SD_DAYS,
    MCPHASES_DATA_NOTICE,
)
from openciclo.data.mcphases import LhCycle, default_mcphases_csv, load_mcphases_lh_cycles
from openciclo.evaluation.metrics import history_bucket
from openciclo.forecasting.distribution import most_likely_length
from openciclo.forecasting.engine import predict
from openciclo.forecasting.ovulation import (
    luteal_pmf,
    most_likely_index,
    ovulation_pmf,
    point_mass,
    shortest_interval,
)
from openciclo.schemas.forecast import LengthDistribution

# The app's bleed length when a diary has no periods to measure (lib/cycle/phases.ts).
EVAL_BLEED_DAYS = 5
COVERAGES = (0.5, 0.8, 0.9)
PRIMARY = "calendar window: distribution 12.4 ± 2.4 (shipped)"


@dataclass(frozen=True)
class Window:
    """A rule's most likely day and window; distribution rules also carry their mass."""

    point: int
    start: int
    end: int
    offsets: tuple[int, ...] = ()
    probabilities: tuple[float, ...] = ()
    intervals: tuple[tuple[float, int, int], ...] = ()

    def mass_at(self, offset: int) -> float:
        if not self.offsets or offset < self.offsets[0] or offset > self.offsets[-1]:
            return 0.0
        return self.probabilities[offset - self.offsets[0]]

    def covered(self, level: float, offset: int) -> bool:
        for at, lo, hi in self.intervals:
            if at == level:
                return lo <= offset <= hi
        raise KeyError(level)


Rule = Callable[[LengthDistribution], Window]


def fixed_rule(before_point: int, before_start: int, before_end: int) -> Rule:
    """Calendar rule on the most likely length: point and window counted back from it."""

    def rule(lengths: LengthDistribution) -> Window:
        length = most_likely_length(lengths)
        return Window(
            point=length - before_point, start=length - before_start, end=length - before_end
        )

    return rule


def distribution_rule(mean: float, sd: float = LUTEAL_SD_DAYS, coverage: float = 0.8) -> Rule:
    luteal = luteal_pmf(mean, sd, LUTEAL_MIN_DAYS, LUTEAL_MAX_DAYS)

    def rule(lengths: LengthDistribution) -> Window:
        pmf = ovulation_pmf(lengths, bleed_days=EVAL_BLEED_DAYS, luteal=luteal)
        if pmf is None:
            raise ValueError("no ovulation estimate for this cycle")
        offsets, probs = pmf
        lo, hi, _ = shortest_interval(probs, coverage)
        intervals = []
        for level in COVERAGES:
            a, b, _ = shortest_interval(probs, level)
            intervals.append((level, offsets[a], offsets[b]))
        return Window(
            point=offsets[most_likely_index(probs)],
            start=offsets[lo],
            end=offsets[hi],
            offsets=tuple(offsets),
            probabilities=tuple(probs),
            intervals=tuple(intervals),
        )

    return rule


def ring_rule(coverage: float = 0.8) -> Rule:
    """The phase chapters: the luteal spread counted back from the most likely next start."""

    luteal = luteal_pmf()

    def rule(lengths: LengthDistribution) -> Window:
        pmf = ovulation_pmf(
            point_mass(most_likely_length(lengths)), bleed_days=EVAL_BLEED_DAYS, luteal=luteal
        )
        if pmf is None:
            raise ValueError("no ovulation estimate for this cycle")
        offsets, probs = pmf
        lo, hi, _ = shortest_interval(probs, coverage)
        return Window(point=offsets[most_likely_index(probs)], start=offsets[lo], end=offsets[hi])

    return rule


RING = "phase chapters: luteal spread before the expected start (shipped)"

RULES: dict[str, tuple[Rule, str]] = {
    "phases today: 16–10 days before": (fixed_rule(13, 16, 10), "baseline"),
    "calendar today: 6 days ending 14 before": (fixed_rule(14, 19, 14), "baseline"),
    PRIMARY: (distribution_rule(12.4), "primary"),
    RING: (ring_rule(), "shipped"),
    "distribution 13.4 ± 2.4 (one day earlier)": (distribution_rule(13.4), "sensitivity"),
}


def score(cycles: Sequence[LhCycle], *, reference_shift: int = 0) -> pd.DataFrame:
    """One row per (cycle, rule). ``reference_shift`` moves the reference day (0 = LH peak + 1)."""

    released = load_released_model()
    prior, config, alias = (
        released.to_population_prior(),
        released.to_forecast_config(),
        released.point_estimator_alias,
    )
    rows: list[dict[str, object]] = []
    for cycle in cycles:
        forecast = predict(
            cycle.history,
            reference_date=cycle.history[-1],
            model=alias,
            population_prior=prior,
            config=config,
        )
        truth = cycle.ovulation_offset + reference_shift
        fertile = set(range(truth - 5, truth + 1))
        for name, (rule, role) in RULES.items():
            window = rule(forecast.cycle_length_distribution)
            inside = set(range(window.start, window.end + 1))
            row: dict[str, object] = {
                "rule": name,
                "role": role,
                "history": history_bucket(len(cycle.history) - 1),
                "ae": abs(window.point - truth),
                "in_window": window.start <= truth <= window.end,
                "width": window.end - window.start + 1,
                "fertile_covered": len(fertile & inside) / len(fertile),
            }
            if window.offsets:
                row["log_score"] = -math.log(max(window.mass_at(truth), 1e-12))
                for level in COVERAGES:
                    row[f"cov_{int(level * 100)}"] = window.covered(level, truth)
            rows.append(row)
    return pd.DataFrame(rows)


def summarize(steps: pd.DataFrame, by: Sequence[str] = ("rule",)) -> pd.DataFrame:
    agg: dict[str, tuple[str, object]] = {
        "n": ("ae", "size"),
        "mae": ("ae", "mean"),
        "within_1": ("ae", lambda x: float((x <= 1).mean())),
        "within_2": ("ae", lambda x: float((x <= 2).mean())),
        "in_window": ("in_window", "mean"),
        "width": ("width", "mean"),
        "fertile_covered": ("fertile_covered", "mean"),
    }
    for column in ("log_score", *[f"cov_{int(level * 100)}" for level in COVERAGES]):
        if column in steps:
            agg[column] = (column, "mean")
    order = {name: i for i, name in enumerate(RULES)}
    out = steps.groupby(list(by), sort=False).agg(**agg).reset_index()
    out["_order"] = out["rule"].map(order)
    sort = ["_order", *[column for column in by if column != "rule"]]
    return out.sort_values(sort).drop(columns="_order").reset_index(drop=True)


def render_markdown(
    n_cycles: int,
    n_people: int,
    main: pd.DataFrame,
    shifted: pd.DataFrame,
    by_history: pd.DataFrame,
) -> str:
    def table(frame: pd.DataFrame) -> str:
        cols = [c for c in frame.columns if c != "role"]
        lines = ["| " + " | ".join(cols) + " |", "|" + "---|" * len(cols)]
        for _, row in frame.iterrows():
            cells = []
            for c in cols:
                value = row[c]
                if isinstance(value, float):
                    cells.append("" if math.isnan(value) else f"{value:.2f}")
                else:
                    cells.append(str(value))
            lines.append("| " + " | ".join(cells) + " |")
        return "\n".join(lines)

    return "\n".join(
        [
            "# Estimated ovulation on mcPHASES (LH-dated cycles)",
            "",
            f"Data: {MCPHASES_DATA_NOTICE}. Aggregates only. {n_cycles} completed cycles from "
            f"{n_people} people with a clear urinary LH peak; reference ovulation = the day after "
            "the peak. Each cycle is forecast walk-forward from the period starts known on its "
            "first day, with the released model. Offsets count from the cycle's first day.",
            "",
            "Columns: `mae` = days between the rule's most likely day and the reference; "
            "`in_window` = share of reference days inside the rule's window; `width` = window "
            "length in days; `fertile_covered` = share of the six days ending on the reference "
            "(Wilcox 1995) inside the window; `log_score` = −log probability of the reference day; "
            "`cov_50/80/90` = share inside the shortest 50/80/90% windows (calibration).",
            "",
            "## Reference: day after the LH peak (pre-registered)",
            "",
            table(main),
            "",
            "## Sensitivity: reference on the LH peak day",
            "",
            table(shifted),
            "",
            "## By completed cycles seen",
            "",
            table(by_history),
            "",
        ]
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mcphases-csv", type=Path, default=None)
    parser.add_argument("--out", type=Path, default=Path("benchmarks/results"))
    args = parser.parse_args(argv)
    csv_path = args.mcphases_csv or default_mcphases_csv()
    cycles = load_mcphases_lh_cycles(csv_path)
    steps = score(cycles)
    shifted = score(cycles, reference_shift=-1)
    main_summary = summarize(steps)
    shifted_summary = summarize(shifted)
    by_history = summarize(steps[steps["role"] != "sensitivity"], by=("rule", "history"))
    args.out.mkdir(parents=True, exist_ok=True)
    main_summary.drop(columns="role", errors="ignore").to_csv(
        args.out / "ovulation_mcphases_summary.csv", index=False
    )
    report = render_markdown(
        len(cycles), len({c.person_id for c in cycles}), main_summary, shifted_summary, by_history
    )
    target = args.out / "ovulation_mcphases_report.md"
    target.write_text(report, encoding="utf-8")
    print(f"Wrote {target} and ovulation_mcphases_summary.csv ({len(cycles)} LH-dated cycles).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
