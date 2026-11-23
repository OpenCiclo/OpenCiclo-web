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

## Estimated ovulation

`openciclo/forecasting/ovulation.py` (TypeScript twin: `apps/web/lib/forecast/ovulation.ts`, parity vectors in `tests/fixtures/forecast_parity.json`).

- **Model:** ovulation day = next start − luteal phase. With `P(L)` the cycle-length distribution above and `P(l)` the luteal distribution, `P(ovulation on day d) = Σ_L P(L) · P(l = L − d)`, d counted from the cycle's first day.
- **Luteal phase:** a discrete normal on 7–17 days, mean 12.4, SD 2.4 (`LUTEAL_*` in `openciclo/constants.py`): Table 1 of [Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7) (612,613 ovulatory cycles; their abstract gives the 7–17 range). Bull counts the days strictly between their estimated ovulation day (the last low temperature) and the next period, so their gap from ovulation to the next start is 13.4. We read 12.4 as that gap with ovulation dated the day after the urinary LH peak, which is how mcPHASES scores it (gap 12.4 ± 3.0 there); a 13.4 mean is reported as a sensitivity in docs/evaluation.md. Published luteal length also varies with cycle length (8.0 days at 15–20, 12.9 at 31–50); one distribution for everyone is an assumption.
- **No ovulation on bleeding days:** days before the expected bleed ends get no mass; the rest is renormalised.
- **Summaries:** the most likely day (earliest among ties within 1e-12) and the shortest run of days holding 80% (`OVULATION_INTERVAL_COVERAGE`; among equal lengths, the one with the most mass, then the earliest).
- **Open cycle:** uses the full (untruncated) length distribution, so the window stays put as days pass, like the anchored next start; it widens with little history or irregular cycles and is cut to end before the expected start.
- **Known next start** (closed cycles, the phase chapters, a friend's card): only the luteal spread, `P(L)` a point mass. For a 28-day cycle that is cycle days 14–19, most likely day 17.

Wording rules: "estimated ovulation", "may fall"; never "safe days" or a per-day chance of pregnancy. Fertile days start about five days before ovulation ([Wilcox et al. 1995](https://doi.org/10.1056/NEJM199512073332301)); the app says so in its tip but does not draw a fertile window.

## Pregnancy dates

`openciclo/pregnancy.py` and its twin `apps/web/lib/pregnancy/dating.ts` (parity vectors in `tests/fixtures/forecast_parity.json`, "pregnancy"). Pregnancy mode itself is behind `PREGNANCY_AVAILABLE` (agents.txt "Pregnancy").

- **Due date** ([ACOG Committee Opinion 700](https://pubmed.ncbi.nlm.nih.gov/28426621/)): last period + 280 days; ovulation or conception + 266; embryo transfer + 266 − the embryo's age (3 or 5 days); ultrasound date + (280 − gestational age that day). The date she was given is taken as it is. A later ultrasound replaces earlier dating.
- **Cycle correction** (Naegele with Parikh's correction, [StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK536986/)): + (usual cycle − 28) days, capped at ±7 here; outside 21–35-day cycles the app recommends ultrasound dating. Optional.
- **Age** counts from 0 ("12 weeks and 3 days" = day 87). Trimesters as usually counted: to 13+6, 14+0–27+6, from 28+0. Term labels from [ACOG Committee Opinion 579](https://pubmed.ncbi.nlm.nih.gov/24150030/): early 37+0–38+6, full 39+0–40+6, late 41+0–41+6, postterm from 42+0. The app shows 37+0–42+0 as the likely window: natural length varies by up to 37 days among pregnancies dated by ovulation ([Jukic et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3777570)).

## Cycles around a pregnancy

`apps/web/lib/cycle/segments.ts`; `predict(..., excluded_starts=...)` in Python for parity.

- The interval between the last period before a pregnancy and the first after it is not a cycle: its length is left out of the forecast, the averages, Patterns and the research pool.
- No forecast while a pregnancy goes on, nor after its end until a period start is logged.
- Bleeding is never a period start from the estimated conception day (due − 266) while the pregnancy goes on, nor within 20 days of its end: the bleeding of the end lasts up to two weeks, spotting up to three, and ovulation comes on day 13 at the earliest ([Donnet et al. 1990](https://scilit.net/publications/465937c8fd78b56c55cd0adce05c82ce)). After a birth, or an end from 14+0, the window is 42 days: bleeding after a birth can last about six weeks ([Cleveland Clinic, lochia](https://my.clevelandclinic.org/health/body/22485-lochia)); for a loss after 13 weeks that is an assumption with no study behind it.
- **Assumptions with no data to validate them** (ESTUDIO-final-del-embarazo, section 5): after a loss the forecast reuses earlier cycles with the Laplace scale floored at 3 days (the prior's MAD) for 3 cycles (`POST_LOSS_WIDE_CYCLES`, `POST_PREGNANCY_MIN_SCALE`); after a birth it leaves out every earlier cycle and starts from the prior.

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
