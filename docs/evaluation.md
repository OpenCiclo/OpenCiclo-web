# Evaluation

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

We score forecasts the way a real user would live them: only dates that already happened may be used to predict the next start. Randomly shuffling a person’s cycles into train/test leaks the future and makes the model look better than it is.

The released prior comes from published literature (docs/modeling.md). Walk-forward on **mcPHASES** chooses the hyperparameters with that prior fixed; mcPHASES and Utah/Creighton both validate the release. CI uses **synthetic** cycles and must not pick `model_id`.

## Forbidden split

Do **not** shuffle a person’s cycles into random train/test rows. That leaks the future (the person’s later typical length) into earlier predictions.

## Existing-user walk-forward

For a user with period starts `s0, s1, …, s_{n-1}`:

```text
visible starts s0 … s_{k-1}  →  forecast the start at s_k
k = 1, 2, …, n-1
```

The model may use only starts before `s_k`. Cycle lengths after that point must not appear in features, prior fitting, or scaling.

Prediction time for this protocol is `reference_date = s_{k-1}` (the last known period). The next start is then in the future, so date truncation does not apply.

## New-user protocol

1. Split **users** (not cycles) into train and test, stratified by subgroup when labels exist.
2. Fit the population prior on **train users only**.
3. On each test user, run the same walk-forward, including the cold-start step (only `s0` visible).

This measures both unseen-user generalization (especially k=1) and personal forecasting as history grows.

## Daily online backtest (later)

A fuller product simulation would step calendar day by day, reveal only logs that existed that day, and update P(start on day t). If the expected period passes without a log, the state is **unknown**, not an automatic model failure. That daily loop is not required to score V0 length forecasts and is deferred.

## Metrics

### Point

- Mean absolute error (days)
- Median absolute error
- Error distribution quantiles (reported in CSV)

### Windows

Fraction of forecasts with absolute error ≤ 0, 1, 2, 3, 5 days.

### Probabilistic

- Mean negative log-likelihood of the **actual length** under the discrete PMF (`-log p(L_true)`)
- Brier score for the event `|L - μ_point| ≤ 2` (predicted probability vs 0/1 outcome)
- 80% central prediction-interval coverage and mean width

### Calibration

Bin predicted P(|error| ≤ 2) and compare to observed frequency. Report coverage of the 80% interval. Miscalibration is a first-class failure mode.

## Subgroups

Where labels exist (synthetic by construction):

- regular vs irregular
- sparse vs longer history
- regime change
- skipped-log artifacts

Do not invent demographic medical claims from tiny slices.

## Leakage guards

Tests must assert:

- walk-forward history never contains the target start
- population prior fitted on train does not include held-out users’ lengths

## mcPHASES protocol (hyperparameter selection)

Restricted CSV stays on disk (`training/dataset-do-not-commit/` or `$OPENCICLO_MCPHASES_CSV`). Git never receives microdata.

**Default: `--prior literature`.** Every person is scored with the published literature prior, the same for everyone, so nothing about the scored person enters the prior and no person needs to be held out. This uses all 130 next-start forecasts.

1. Extract period starts as the first day of each `phase == Menstrual` run, grouped by `(id, study_interval)`. Do not concatenate a person’s 2022 and 2024 intervals.
2. Walk-forward with V0 baselines and shrinkage variants (`k` grid, mean/last/recency, optional last-cycle blend and clipping), plus the evaluation references (`v0.reference.*`, never selected).
3. Choose the winner (MAE primary; require ≥0.05 days vs personal median; do not tank 80% coverage; prefer no extra knobs when MAE is within 0.05 of the best).
4. With `--fit-release`, write `openciclo/artifacts/released_model.json`: the literature prior plus the winner's settings and aggregate selection metrics. It refuses `--prior fitted` and the log-normal and empirical families (their shape would be fitted on the data).

```bash
python -m openciclo.evaluation.mcphases --fit-release
```

**Research: `--prior fitted`.** Refit the prior on mcPHASES people: `--protocol loo` (default; for each person, fit on everyone else) or `--protocol holdout` (30% of people, noisier, `n ≈ 40` per split). Never released.

Reports (`benchmarks/results/mcphases_literature_*`, `mcphases_loo_*`, `mcphases_*`) carry an overall table and a **by-history** table (`*_history.csv`, and in the markdown report): the same metrics by how many completed cycles each forecast saw (0, 1–2, 3–5, 6–11, 12+). Report both ends: forecasts with little history lean on the prior, long ones are personal.

Local reports may contain study ids. `benchmarks/results/` is gitignored (some files committed before that rule are still tracked; do not add more). The model card may quote **aggregate** MAE, coverage, and n only.

### Evaluation references

`v0.reference.recent_mean` is a common tracker heuristic: the mean of the last 12 completed lengths that fall within 21–45 days, falling back to the prior median when none do. It runs next to the candidates so reports show how the released model compares with it. `select_winner` skips every `v0.reference.*` id, so a reference can never be released.

## Estimated ovulation (mcPHASES LH)

`python -m openciclo.evaluation.ovulation` (local; writes `ovulation_mcphases_summary.csv` and `ovulation_mcphases_report.md`, aggregates only, under the gitignored `benchmarks/results/`). Fixed before the distribution was scored (plan of 2026-11-23):

- **Cycles:** completed mcPHASES cycles of 18–50 days with urinary LH on at least 60% of their days and a peak at least 2.5 times the cycle's median LH, not within 5 days of either start (`load_mcphases_lh_cycles`): 110 cycles, 39 people.
- **Reference:** ovulation on the day after the LH peak. Ovulation follows the LH peak by about 16 hours on average ([WHO Task Force 1980](https://scilit.com/publications/3e6e5815c2f018f3c28a4df921107bc8)); against ultrasound, the urinary LH peak was on average less than a day before ovulation, but the day it points to was early in about 10% of cycles and late in about 23% ([Ecochard et al. 2001](https://pubmed.ncbi.nlm.nih.gov/11510707/)). The peak day itself is reported as a sensitivity.
- **Forecast:** walk-forward from the period starts known on the cycle's first day, released model, bleed length 5.
- **Metrics:** error of the most likely day; share of reference ovulations inside the window; whether the 80% window holds about 80% (also 50% and 90%). Width and the share of the six fertile days ending on the reference ([Wilcox et al. 1995](https://doi.org/10.1056/NEJM199512073332301)) are reported next to them.

Results (engine 0.3.0):

| Rule | MAE (days) | ±1 day | ±2 days | Inside window | Width (days) | Fertile days covered | 50 / 80 / 90% held |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Old phases: 16–10 days before | 3.49 | 0.29 | 0.45 | 0.57 | 7 | 0.55 | |
| Old calendar: 6 days ending 14 before | 3.85 | 0.25 | 0.42 | 0.30 | 6 | 0.45 | |
| Calendar window (shipped) | 3.36 | 0.27 | 0.45 | 0.84 | 11.3 | 0.74 | 0.53 / 0.84 / 0.92 |
| Phase chapters (shipped) | 3.33 | 0.29 | 0.45 | 0.52 | 6 | 0.47 | |
| Sensitivity: luteal mean 13.4 | 3.55 | 0.28 | 0.44 | 0.85 | 11.1 | 0.77 | 0.50 / 0.85 / 0.91 |

With the reference on the LH peak day: old phases 3.33 MAE / 0.62 inside, calendar window 3.36 / 0.84, luteal mean 13.4 3.35 / 0.84. By completed cycles seen, the calendar window held 0.75 of ovulations with no completed cycle (51 cycles, width 11.0) and 0.93 with one or two (57, width 11.6). mcPHASES series are short (2–4 starts), so long histories are not tested here. On Utah walk-forward (no LH) the window's median width was 11 days (p90 13); 6% of forecasts reached 15 days or more.

## Creighton / Utah protocol (validation)

If `training/dataset-do-not-commit/CrMcyclelength_share.csv` (or `$OPENCICLO_CREIGHTON_CSV`) is present:

```bash
python -m openciclo.evaluation.creighton
```

Leave-one-person-out walk-forward with a prior refitted on Utah people (research), plus the **released model as shipped** (`creighton_frozen_release_summary.csv` and `_history.csv`): the external check of the release. Charted cycle **starts**. Reports stay local (`benchmarks/results/creighton_*`). This does **not** overwrite `released_model.json`. Use `--grid core` for baselines plus median-shrinkage `k`; `--grid full` matches the mcPHASES selection grid.

## Cross-dataset transfer (Utah ↔ mcPHASES)

Fit the population prior on one local cohort and walk-forward on the other. Same-dataset numbers use leave-one-person-out so the scored person is not in the prior.

```bash
python -m openciclo.evaluation.cross_dataset
```

This does **not** overwrite `released_model.json`. Reports stay under `benchmarks/results/cross_*`.

## Kaggle synthetic factors (non-production)

If `training/dataset-do-not-commit/menstrual_cycle_dataset_with_factors.csv` is present:

```bash
python -m openciclo.evaluation.kaggle_factors
```

Label: **SYNTHETIC / NON-PRODUCTION**. Does not overwrite `released_model.json`.

## Synthetic protocol (CI only)

The default `python -m openciclo.evaluation` path still uses the OpenCiclo synthetic V0 cohort. Label: **SYNTHETIC / NON-PRODUCTION**. It proves the pipeline. It does **not** select the production `model_id`.
