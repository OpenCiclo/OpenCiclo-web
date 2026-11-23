# Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
# SPDX-License-Identifier: Apache-2.0

from pathlib import Path

import pandas as pd
import pytest

from openciclo.artifacts.release import load_released_model, write_released_model
from openciclo.constants import (
    LITERATURE_PRIOR_MAD,
    LITERATURE_PRIOR_MEDIAN,
    LITERATURE_PRIOR_SOURCE,
    MCPHASES_DATA_NOTICE,
)
from openciclo.data.mcphases import load_mcphases_series, mcphases_csv_available
from openciclo.evaluation.mcphases import (
    _parse_candidate_id,
    build_released_model,
    main,
    reference_candidates,
    run_mcphases_benchmark,
    score_with_fixed_prior,
    select_winner,
    timing_candidates,
    write_mcphases_reports,
)
from openciclo.schemas.config import literature_prior

FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "mcphases_tiny.csv"


def test_mcphases_pipeline_on_fixture(tmp_path: Path) -> None:
    series = load_mcphases_series(FIXTURE)
    rows, summary, prior, train, test = run_mcphases_benchmark(series, test_fraction=0.5, seed=2026)
    assert not rows.empty
    assert prior.source.startswith("mcPHASES")
    train_people = {item.person_id for item in train}
    test_people = {item.person_id for item in test}
    assert train_people.isdisjoint(test_people)
    winner = select_winner(summary)
    released = build_released_model(winner=winner)
    out = tmp_path / "released_model.json"
    write_released_model(released, out)
    assert out.is_file()


def test_release_carries_the_literature_prior_not_the_dataset() -> None:
    series = load_mcphases_series(FIXTURE)
    candidates = timing_candidates() + reference_candidates()
    _rows, summary = score_with_fixed_prior(
        series, literature_prior(), candidates, notice=MCPHASES_DATA_NOTICE
    )
    released = build_released_model(winner=select_winner(summary))
    assert released.population_median == LITERATURE_PRIOR_MEDIAN
    assert released.population_mad == LITERATURE_PRIOR_MAD
    assert released.dataset == LITERATURE_PRIOR_SOURCE
    assert released.prior_location == "literature"
    # No individual-level data behind the prior: nothing counted, no data-fitted shape.
    assert (released.n_users, released.n_cycles, released.n_series) == (0, 0, 0)
    assert released.empirical_probabilities is None


def test_shipped_release_is_the_literature_prior() -> None:
    released = load_released_model()
    prior = literature_prior()
    assert released.population_median == prior.median_length
    assert released.population_mad == prior.mad_length
    assert released.population_mean == prior.mean_length
    assert released.dataset == prior.source


def test_references_are_scored_but_never_selected() -> None:
    reference_id = reference_candidates()[0][1]
    assert reference_id.startswith("v0.reference.")
    summary = pd.DataFrame(
        [
            {
                "model_id": "v0.baseline.median",
                "subgroup": "all",
                "n": 40,
                "mae": 4.0,
                "coverage_80": 0.80,
            },
            {"model_id": reference_id, "subgroup": "all", "n": 40, "mae": 1.0, "coverage_80": 0.90},
        ]
    )
    winner = select_winner(summary)
    assert winner["model_id"] == "v0.baseline.median"


@pytest.mark.parametrize("family", ["lognormal", "empirical"])
def test_release_refuses_a_family_fitted_on_data(family: str) -> None:
    spec = _parse_candidate_id(f"v0.shrinkage.median.k2.{family}")
    winner = {**spec, "mae": 3.0, "coverage_80": 0.8, "n": 10, "reason": "test"}
    with pytest.raises(ValueError, match="published aggregates only"):
        build_released_model(winner=winner)  # type: ignore[arg-type]


def test_fit_release_refuses_a_fitted_prior(tmp_path: Path) -> None:
    artifact = tmp_path / "released_model.json"
    code = main(["--fit-release", "--prior", "fitted", "--artifact-path", str(artifact)])
    assert code == 2
    assert not artifact.exists()


def test_report_has_history_breakdown(tmp_path: Path) -> None:
    series = load_mcphases_series(FIXTURE)
    rows, summary = score_with_fixed_prior(
        series,
        literature_prior(),
        timing_candidates()[:3] + reference_candidates(),
        notice=MCPHASES_DATA_NOTICE,
    )
    md_path, _csv, _steps = write_mcphases_reports(
        summary, rows, select_winner(summary), tmp_path, protocol="literature"
    )
    assert md_path.name == "mcphases_literature_report.md"
    assert (tmp_path / "mcphases_literature_history.csv").is_file()
    assert "## By completed cycles seen" in md_path.read_text(encoding="utf-8")


@pytest.mark.skipif(
    not mcphases_csv_available(), reason="mcPHASES CSV not present (expected in CI)"
)
def test_real_mcphases_loader_person_split() -> None:
    series = load_mcphases_series()
    assert len(series) >= 1
    people = {item.person_id for item in series}
    assert len(people) >= 1
