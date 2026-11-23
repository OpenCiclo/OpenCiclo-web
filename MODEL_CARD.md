# Model card — OpenCiclo 0.3.0 timing model

OpenCiclo
Built by Emma Flora Harbison & Luis Rey Sánchez
Copyright © 2026
Apache License 2.0

**Status:** research / engineering scaffold. **Not** a released clinical or consumer accuracy claim.

## Purpose

Provide simple, interpretable statistical forecasts of **next period start** and **cycle length**, with an explicit probability distribution and uncertainty label.

## Intended use

- Local, offline cycle forecasting from period-start dates
- Browser forecasting via a TypeScript port of the same shrinkage + discrete Laplace path
- Benchmarking more complex models against honest baselines
- Research on how much signal exists in cycle history alone

## Non-intended use

- Contraception or pregnancy prevention
- Pregnancy detection or fertility treatment
- Medical diagnosis or treatment decisions
- Any claim of medically validated or worldwide accuracy

## Population prior (published literature)

The prior in `openciclo/artifacts/released_model.json` comes from **published aggregates**, not from any dataset in this repository. With few or no completed cycles the forecast leans on it; each logged cycle moves the forecast toward the person's own median (shrinkage).

| Field | Value | Source |
| --- | --- | --- |
| Location (median) | **29.0 days** | Mean of the two largest published means, rounded: 29.3 days ([Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7), 612,613 ovulatory cycles, 124,648 app users, CC BY 4.0) and 28.7 days ([Li et al. 2023](https://doi.org/10.1038/s41746-023-00848-1), Apple Women's Health Study, 165,668 cycles, 12,608 participants) |
| Spread (MAD) | **3.0 days** | Bull's Table 1 (cohort n, mean, SD) implies a pooled median of 28 and MAD of about 2 days for ovulatory cycles; the Apple study's SD of 6.1 days implies more. 3 sits between the two |
| Mean | 29.0 days | Same as the location |
| People / cycles fitted (`n_users`, `n_cycles`) | 0 / 0 | No individual-level data was fitted |

Notes:

- Published means differ with age: in Bull et al., 30.3 days at 18–24 down to 27.4 at 40–45. A cohort of young adults (mcPHASES, median of person medians 30.5) sits above this prior; an older one sits below. The prior is one number for everyone; an age-aware prior is future work.
- **The final values were confirmed, not blind.** Locations 28–29.3 and MADs 2–3 were all compared on mcPHASES and Utah walk-forward before 29 / 3 was kept (location 28 lost 0.2 days of MAE on mcPHASES; MAD 2 left the 80% interval at 0.63–0.78 coverage). Treat the two cohorts as validation that informed the choice, not as untouched test sets.
- No local dataset enters the artifact. mcPHASES chooses the hyperparameters (below) and its aggregate selection metrics are recorded; Utah/Creighton and Kaggle never touch it. `--fit-release` refuses a fitted prior and any length family whose shape would be fitted on data.

## Hyperparameter selection (mcPHASES)

Walk-forward over every person in **mcPHASES 1.0.0** (`hormones_and_selfreport`, timing only) with the literature prior fixed, so nothing about the scored person enters the prior. The grid and the adoption rule are unchanged (docs/modeling.md): beat the median baseline by 0.05 days of MAE without losing more than 0.05 of 80% coverage; among candidates within 0.05 days of the best, the simplest wins.

| Field | Value |
| --- | --- |
| Selected | `v0.shrinkage.median.k2.5.laplace` (released id `v0.shrinkage.median.laplace`, `shrinkage_k` 2.5) |
| Selection MAE / 80% coverage / n | 3.51 days / 0.785 / 130 forecasts |
| Median baseline, same protocol | 4.05 days / 0.715 |

The CSV is **not** in git (PhysioNet Restricted Health Data). Installers never need it. Personalization uses the user's own dates on-device, shrunk toward the prior.

V0 point estimators are descriptive statistics, not a trained neural net. The same literature prior is the fallback if the release file is missing.

Synthetic cohorts are **CI-only** and were **not** used to choose `model_id`.

## Evaluation

Same walk-forward, released model as shipped, old (0.2.1, mcPHASES prior 30.5 / 3.0, k = 2) vs new (0.3.0, literature prior 29 / 3.0, k = 2.5). The 0.2.1 mcPHASES row is **in-sample** (its prior was fitted on those same people; its published leave-one-person-out figure was 3.50 / 0.777). The 0.3.0 rows are out-of-sample for the prior.

| Cohort | n | MAE | ±1 d | ±2 d | NLL | Brier ±2 | 80% coverage | 80% width |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mcPHASES (Canada), 0.2.1 | 130 | 3.50 | 0.33 | 0.48 | 2.98 | 0.260 | 0.76 | 9.5 |
| mcPHASES (Canada), **0.3.0** | 130 | 3.51 | 0.35 | 0.49 | 2.96 | 0.255 | 0.79 | 10.0 |
| Utah / Creighton, 0.2.1 | 2557 | 3.13 | 0.37 | 0.57 | 2.81 | 0.235 | 0.85 | 9.0 |
| Utah / Creighton, **0.3.0** | 2557 | **3.04** | 0.41 | **0.62** | 2.76 | 0.224 | 0.87 | 9.3 |
| Kaggle factors (synthetic), 0.2.1 | 895 | 7.31 | 0.10 | 0.19 | 3.99 | 0.221 | 0.63 | 16.9 |
| Kaggle factors (synthetic), 0.3.0 | 895 | 7.52 | 0.12 | 0.19 | 4.05 | 0.223 | 0.64 | 17.1 |

By completed cycles seen (MAE, Utah, 0.2.1 → 0.3.0): 0 cycles 4.06 → 3.97 · 1–2: 3.32 → 3.23 · 3–5: 2.92 → 2.80 · 6–11: 1.91 → 1.84 · 12+: 0.73 → 0.67.

For scale: a prior fitted on Utah itself (leave-one-person-out, research only) reaches 3.00 MAE there; the literature prior, which never saw Utah, reaches 3.04.

These rows describe **different cohorts**. They are not product accuracy for all people who menstruate. Do not average them into a worldwide claim. Kaggle factors is a synthetic file (`KAGGLE_FACTORS_DATA_NOTICE`); it is reported, not used for decisions.

**Trade-off:** on Utah the 80% interval was already a little wide (0.85) and is a little wider now (0.87, against a target of 0.80). On mcPHASES it moved toward the target (0.76 → 0.79). NLL, which scores the whole distribution, improved on both real cohorts.

Log-normal, empirical, and clip/blend variants did not beat the mcPHASES winner by 0.05 MAE in the 0.2 selection. Asymmetric Laplace was within noise and was not adopted.

Protocol: [docs/evaluation.md](docs/evaluation.md).

## Population

- **Prior sources (published aggregates):** Natural Cycles app users, mostly Sweden, the UK and the US, ovulatory cycles confirmed by temperature ([Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7)); US adults in the Apple Women's Health Study ([Li et al. 2023](https://doi.org/10.1038/s41746-023-00848-1)). App users self-select; neither is a worldwide sample.
- **mcPHASES (selection):** consenting Canadian young-adult menstruators; no recent hormonal contraception by study eligibility. [PhysioNet record](https://physionet.org/content/mcphases/1.0.0/). See [DATASETS.md](DATASETS.md).
- **Utah / Creighton (validation only):** heterosexually active women 18–40 with no known subfertility; Creighton Model FertilityCare charting in US/Canada centres, 1990–2013. [Hive DOI](https://doi.org/10.7278/S50d-4gxs-s4hj).

## Limitations

- Small n on the selection cohort; geographically and demographically narrow
- One prior for every age, although published means fall about 3 days from 18–24 to 40–45 (Bull et al. 2019)
- The prior values were confirmed on mcPHASES and Utah, so those two are not fully untouched test sets
- Discrete Laplace around a shrinkage point is still an assumption, not a biological law
- Period truth on mcPHASES is `phase == Menstrual` onsets, not `flow_volume`
- LH, hormones, and symptoms are unused in this release
- Missing logs are not yet a generative skip model
- 2–4 starts per mcPHASES series: a raw personal median is unstable, which is why shrinkage is the default
- 80% coverage is 0.79 on mcPHASES but 0.87 on Utah: the interval is a little wide for long, regular histories
- Utah users are fertility-awareness / NFP charting; that is not a general app population

## Metrics

Reports must include MAE, median AE, exact / ±1 / ±2 / ±3 / ±5 day rates, NLL, a Brier score for the ±2-day event, 80% interval coverage and width. Local detail CSVs under `benchmarks/results/` may contain study ids and must not be committed. This card quotes **aggregates only**.

## Calibration

Poor calibration is treated as a model defect. The prior's MAD was chosen with coverage in view: MAD 2 left the 80% interval at 0.63 (mcPHASES) and 0.78 (Utah); MAD 3 gives 0.79 and 0.87. In 0.2, switching the mcPHASES prior from a pooled-cycle median (29, MAD 2.5) to an equal-person median (30.5, MAD 3.0) had raised leave-one-person-out coverage from 0.71 to 0.78. Narrowing the interval for long, regular histories without losing coverage elsewhere is open work.

## Model version

Engine version: `0.3.0` (0.2.1 used the mcPHASES-fitted prior 30.5 / 3.0 and k = 2)
Default model id: `v0.shrinkage.median`
Release artifact: `openciclo/artifacts/released_model.json` (literature prior + hyperparameters; no microdata)

The V1 web app ports this same path to TypeScript and checks it against `tests/fixtures/forecast_parity.json`. The Python package remains the scientific source of truth.

## Features

**Used:** historical period-start dates → cycle lengths; published population prior; shrinkage `k`; Laplace scale from residual MAD mixed with the prior MAD.

**Not used:** symptoms, flow, BBT, LH, mucus, sleep, stress, exercise, contraception, sexual activity.

## Assumptions

Listed in [docs/modeling.md](docs/modeling.md). Observed facts, model assumptions, and predictions are kept distinct in the API.

## Failure modes

- Sparse history → high uncertainty, prior-dominated forecasts
- Regime change → mean/median of the full history lag
- Skipped logs → very long observed cycles pull mean more than median
- Invented precision if scale were allowed to collapse to zero (scale is floored)

## Privacy

The Python engine forecasts locally. The V1 web app encrypts the diary with AES-GCM before it leaves the device; the host stores ciphertext. See [PRIVACY.md](PRIVACY.md).
