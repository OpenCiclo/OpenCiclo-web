# How the forecast works

Ciclo does not pick one “certain” date. It builds a **probability distribution** over upcoming days: how likely the next period is to start on each of them. Then it summarises that into a most-likely day, a few window probabilities, and an uncertainty label (low / medium / high).

The same path exists in Python (`openciclo.predict`) and in the browser. The web app does **not** send your dates to a forecast API.

## What is predicted

V1 predicts:

1. Next period start
2. Cycle length

From those it **estimates** when ovulation may fall (see below). It does **not** confirm ovulation, give safe days for unprotected sex, or detect pregnancy.

## Where the “typical length” comes from

With little history, the model leans on a **population prior**: a typical length of 29 days taken from large published studies of real cycles (more than 750,000 cycles, mostly from Europe and the United States; [Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7) and [Li et al. 2023](https://doi.org/10.1038/s41746-023-00848-1)). It is one typical length for everyone, not a worldwide accuracy claim: published averages run a little longer in your early twenties and a little shorter after 35.

As you log more completed cycles, the forecast mixes **your** median length with that prior. The jargon for this mix is **shrinkage**. With few cycles, the prior still weighs a lot. With many, your own history dominates.

Two research datasets check the model, a study of young adults in Canada (mcPHASES) and cycle charts from Utah / Creighton. Neither is mixed into the file the app ships (`released_model.json`).

## Uncertainty

Uncertainty stays **high** when you have fewer than about three completed cycles, or when the spread is wide. **Low** needs more history and a tighter spread. The label is a summary, not a second scientific claim.

A day with no log is **unknown**, not proof that the period did not happen.

## When the expected day has passed

The Calendar home card and the forecast card on Patterns keep the original most-likely day. Once that day has passed without a logged period start, they count the days late, show how long the open cycle already is, and quote today's chance from the initial forecast. They do not move the date forward. Neither draws a chart then, and the “from today” summary is hidden.

## Estimated ovulation

Ovulation usually comes about 12 days before the next period (12.4 ± 2.4 days on average in more than 600,000 cycles; [Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7)). Ciclo combines that spread with the forecast for your next start. The result is a probability for each day; the calendar shows the most likely day and the shortest window holding 80% of it. The window widens when the next start is uncertain.

It was checked against ovulation dated by daily LH tests in a research dataset (mcPHASES, 110 cycles): about 84% of ovulations fell inside the window, which is about 11 days long. The most likely day was about 3.4 days off on average. The old fixed window (16–10 days before the next start) held 57%. Nothing in that dataset was used to set the window: the luteal numbers are published averages.

## Phases vs the forecast

The engine’s job is the **next start**. The words Follicular / Ovulation / Luteal on the home card are a calendar heuristic built on it. See [Calendar phases and “estimated”](/help/calendar-phases-estimated).

## Turning forecasts off

Settings can hide forecasts. Your logs and completed-cycle statistics stay. Observed bleeding does not depend on the model.

## Limits worth repeating

- Forecasts can be wrong, especially with irregular cycles or sparse logs.
- Do not use Ciclo as birth control.
- Symptoms, temperature and test results can be logged in the diary. This release does **not** feed them into the forecast or into the estimated ovulation. Temperature is drawn as a chart you read yourself (see [Temperature](/help/temperature)).
