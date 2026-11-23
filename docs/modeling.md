# Modeling

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

This file is the contract for the Python engine: what is observed, what is assumed, and what is predicted. The web app copies the released path; it does not invent a second model. Calendar **phase labels** (follicular, “estimated”, inner seasons) are a separate UI heuristic — see Help `/help/calendar-phases-estimated`.

**Shrinkage** here means: mix the person’s own median cycle length with a published population typical length, so one or two cycles do not dominate.

## Observed fact vs assumption vs prediction

| Kind | Example |
| --- | --- |
| Observed fact | Period start logged on 2026-06-29; consecutive `flow` days in a closed cycle |
| Unknown | No log on 2026-07-28 — not the same as “no period” |
| Descriptive statistic | Mean length of completed cycles; mean/range of closed period (bleeding) runs |
| Assumption | V0.2 may use discrete Laplace, a discrete log-normal, or a shifted empirical histogram over lengths 1–90 |
| Prediction | Most likely next start, with probabilities |
| Derived estimate | Expected bleeding length = median of closed period runs; expected period interval = modal start + that length |

The API keeps these separate (`quality_issues`, `notes`, distribution `assumption`, forecast fields).

## V0 / V0.2 models

Point estimators output a **point length**. A scale (or log-normal sigma / empirical histogram) then defines the PMF.

| Id / alias | Point estimate |
| --- | --- |
| `v0.baseline.last_cycle` | Most recent cycle length |
| `v0.baseline.mean` | Arithmetic mean of observed lengths |
| `v0.baseline.median` | Median of observed lengths |
| `v0.baseline.rolling_mean` | Mean of the last `rolling_window` lengths (default 6) |
| `v0.baseline.rolling_median` | Median of that window |
| `v0.baseline.recency_weighted_mean` | Mean with weights `λ^{age}` (newest age 0) |
| `v0.baseline.recency_weighted_median` | Weighted median, same weights |
| `v0.baseline.population_prior` | Prior median only (ignores personal lengths) |
| `v0.shrinkage.median` | Personal median shrunk toward the population prior |

Shrinkage (empirical Bayes, not a neural net):

```text
μ = n/(n+k) * personal_median + k/(n+k) * μ_pop
```

`k` is chosen on mcPHASES walk-forward with the literature prior fixed (2.5 since engine 0.3.0; see the released artifact). If the user has **no completed cycle** (zero or one start date), every personal baseline falls back to the population prior. Uncertainty is high.

Default `λ = 0.90`. Benchmarks also run `λ ∈ {0.70, 0.80, 0.90, 0.95, 1.00}`. `λ = 1` is equal weights (should match mean/median aside from rolling).

## Population prior

Default `predict()` loads `openciclo/artifacts/released_model.json`. Its prior comes from **published aggregates** (`LITERATURE_PRIOR_*` in `openciclo/constants.py`), not from a dataset in this repository:

- **Location 29.0 days:** the mean of the two largest published cycle-length means, rounded to a day: 29.3 ([Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7), 612,613 ovulatory cycles) and 28.7 ([Li et al. 2023](https://doi.org/10.1038/s41746-023-00848-1), Apple Women's Health Study, 165,668 cycles).
- **MAD 3.0 days:** Bull's Table 1 gives each cycle-length cohort's n, mean and SD; treating each cohort as a normal cut to its band gives a pooled median of 28 and MAD of about 2 days for ovulatory cycles. The Apple study's SD of 6.1 days implies more spread. 3 sits between them.
- **Confirmed, not blind:** locations 28–29.3 and MADs 2–3 were compared on mcPHASES and Utah walk-forward before 29 / 3 was kept. Location 28 cost about 0.2 days of MAE on mcPHASES (a young cohort: published means are about 30 at 18–24 and 27.4 at 40–45); MAD 2 dropped 80% coverage to 0.63 there.

The JSON is not microdata (`n_users` and `n_cycles` are 0: nothing individual was fitted). It is one typical length for everyone, **not** a global accuracy claim about everyone who menstruates. An age-aware prior is future work.

Until engine 0.2.1 the prior was fitted on mcPHASES 1.0.0 (median of 42 people's medians: 30.5 days, MAD 3.0).

mcPHASES chooses the hyperparameters and records aggregate selection metrics. A release may never carry a dataset's rows or a shape fitted on them: `build_released_model` refuses the log-normal and empirical families until their shape has a published source.

Creighton/Utah charted cycles (local CSV only) are a **validation cohort**, never mixed into the released artifact: NFP / fertility-care users, 1990–2013, tighter and slightly shorter cycles (person-median 29.0, MAD 2.0). Source: [https://doi.org/10.7278/S50d-4gxs-s4hj](https://doi.org/10.7278/S50d-4gxs-s4hj). Walk-forward there does not overwrite `released_model.json`.

Other sources:

- The same literature prior is the fallback if the release file is missing (`literature_prior()`).
- `synthetic_train`: median/MAD of training users’ observed lengths in the synthetic split (CI pipeline only).

Regenerate the release file locally (DUA required for the selection data): `python -m openciclo.evaluation.mcphases --fit-release`. It refuses `--prior fitted`.

## Probabilistic representation

Let `μ` be the point length. The released `length_family` chooses the PMF on integers 1–90:

- `laplace`: `P(L = k) ∝ exp(-|k - μ| / b)` with scale `b` from residual MAD (floored)
- `lognormal`: discrete log-normal with median `μ` and `sigma` from the release file
- `empirical`: Laplace-smoothed train histogram, shifted so its discrete median matches `μ`

These are **model assumptions**, not biological laws. Cycle lengths are often right-skewed; that is why log-normal and empirical families are ablated on mcPHASES.

Mapping to dates: `next_start = last_start + L days`.

If `reference_date` is after `last_start`, probability mass on dates **before** `reference_date` is removed and the remainder renormalized for the **display** forecast. That is a practical “what is still in the future?” view. Walk-forward scoring uses `reference_date = last_start` so the next cycle is entirely in the future (no truncation). Incomplete-history notes fire when elapsed days look suspiciously long; the observation is not deleted.

The calendar does not follow that truncated date. It keeps the unconditional mode (the most likely day of the full distribution) marked, including after that day has passed. The home card then counts days late from that day and quotes today's probability from the untruncated distribution. Patterns still shows the truncated display forecast.

## Period duration (web, derived)

The published `predict()` path still forecasts **cycle length / next start only**. The web app then derives bleeding duration separately:

- Closed period runs: consecutive `flow` days from a start, cut at the next observed start. The open cycle is excluded.
- Descriptive UI stats use the **mean** and min–max of those closed lengths.
- The expected bleeding length is the **median** of the same closed lengths (rounded). No recency weights.
- The expected period interval on the calendar is `[anchor, anchor + expectedDays - 1]`, where `anchor` is the unconditional mode. That matches `mostLikelyDate` until that day has passed. Alternate probable start dates keep their start markers and do not spawn extra bleeding bands.
- Intermenstrual bleeding is a symptom. It is not `flow` and does not create starts, period runs, or pool lengths.
- If the user turns forecasts off, `predict()` is not called in the UI. Observed means, ranges, completed-cycle history, and current cycle day remain.

These duration fields are not part of the Python forecast object and must not be mixed into `daily_probabilities`.

## Uncertainty labels

Configurable thresholds (defaults):

- **High** if fewer than 3 completed cycles or scale is large
- **Low** if at least 6 completed cycles and scale is small
- **Medium** otherwise

Labels are summaries, not extra scientific claims.

## Evidence strength (future features)

Starting **priors** for optional signals, to be replaced by empirical weights:

| Signal | Starting evidence |
| --- | --- |
| Observed period start | Very high |
| LH test, BBT shift, observed ovulation | High |
| Cervical mucus | Medium |
| Symptoms | Low–medium |
| Sleep, stress, mood | Low |

V0 does not apply these. Personalized feature effects need an evidence threshold; one or two cramp logs must not dominate.

## Recency and regime change

Exponential recency is **investigated** via benchmarks. It is not forced if it loses to equal weights.

Regime-change detectors (change-point, rolling-only models) are Phase 3. Rolling mean/median are the V0 probes.

## What V0 will not do

- Drop outliers without an explicit, documented rule (V0 does not drop them)
- Treat unknown as “no period”
- Use deep learning
- Emit causal copy (“cramps caused your period”)

## Adoption rule for later models

A candidate must beat the median baseline on walk-forward MAE **and** be no worse on 80% interval coverage without a documented trade-off (see `openciclo.evaluation.mcphases`). Prefer the simpler model when the MAE gain is smaller than 0.05 days. **Synthetic** scores never choose the released `model_id`.
