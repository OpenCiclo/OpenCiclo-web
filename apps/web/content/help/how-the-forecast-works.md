# How the forecast works

Ciclo does not pick one “certain” date. It builds a **probability distribution** over upcoming days: how likely the next period is to start on each of them. Then it summarises that into a most-likely day, a few window probabilities, and an uncertainty label (low / medium / high).

The same path exists in Python (`openciclo.predict`) and in the browser. The web app does **not** send your dates to a forecast API.

## What is predicted

V1 predicts:

1. Next period start
2. Cycle length

It does **not** predict ovulation, a fertile window for contraception, or pregnancy.

## Where the “typical length” comes from

With little history, the model leans on a **population prior**: a typical length of 29 days taken from large published studies of real cycles (more than 750,000 cycles, mostly from Europe and the United States; [Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7) and [Li et al. 2023](https://doi.org/10.1038/s41746-023-00848-1)). It is one typical length for everyone, not a worldwide accuracy claim: published averages run a little longer in your early twenties and a little shorter after 35.

As you log more completed cycles, the forecast mixes **your** median length with that prior. The jargon for this mix is **shrinkage**. With few cycles, the prior still weighs a lot. With many, your own history dominates.

Two research datasets check the model, a study of young adults in Canada (mcPHASES) and cycle charts from Utah / Creighton. Neither is mixed into the file the app ships (`released_model.json`).

## Uncertainty

Uncertainty stays **high** when you have fewer than about three completed cycles, or when the spread is wide. **Low** needs more history and a tighter spread. The label is a summary, not a second scientific claim.

A day with no log is **unknown**, not proof that the period did not happen.

## When the expected day has passed

The Calendar home card and the forecast card on Patterns keep the original most-likely day. Once that day has passed without a logged period start, they count the days late, show how long the open cycle already is, and quote today's chance from the initial forecast. They do not move the date forward. The Patterns chart then shows that same initial calculation, with the original day highlighted. The “from today” summary is hidden in that case.

## Phases vs the forecast

The engine’s job is the **next start**. The words Follicular / Ovulation / Luteal on the home card are a separate calendar heuristic. See [Calendar phases and “estimated”](/help/calendar-phases-estimated).

## Turning forecasts off

Settings can hide forecasts. Your logs and completed-cycle statistics stay. Observed bleeding does not depend on the model.

## Limits worth repeating

- Forecasts can be wrong, especially with irregular cycles or sparse logs.
- Do not use Ciclo as birth control.
- Optional symptoms, temperature, and lab-style signals may be stored in the diary. This release does **not** feed them into the forecast.
