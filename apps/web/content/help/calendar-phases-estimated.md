# Calendar phases and “estimated”

On the Calendar home card, Ciclo may show something like **Follicular** with **Chapter 2 of 4 · estimated** above it and **Day 7 · Period in 21 days** below. The phase name is the claim. The word **estimated** (Spanish UI: **estimada**) is a confidence label, not a second phase. The ring beside it is the cycle: one arc per phase, filled up to today.

Tap the card to open your cycle, phase by phase: the days and dates of each phase, what happens inside, how you may feel, what may help, and the next period. On a phone the card grows down the screen; in the Android app you can also drag its handle up to close it. On a computer it opens in the middle of the window.

This page is about **what the app is doing**. For general biology of the cycle, use the **Learn** tab.

## What “estimated” means

**Estimated** means: this phase is inferred from calendar timing and your logged period history. It is **not** confirmed by a measurement that day.

| Source | When it appears | Meaning |
| --- | --- | --- |
| Observed | Flow is logged on that day | Phase is **Menstrual**, from the diary |
| Estimated | No flow that day, forecasting is on, and Ciclo can place the day inside a cycle | Phase is a timing guess |

**Follicular · estimated** does not mean “we scored how follicular you are.” It means: “we think you are in the follicular part of the cycle, and that guess is estimated.”

## The four labels

| Phase | Inner season (if enabled) | Rough idea in the UI |
| --- | --- | --- |
| Menstrual | Winter | Bleeding / early cycle |
| Follicular | Spring | After bleeding, before the estimated ovulation window |
| Ovulation | Summer | The days around ovulation, counted back from the next expected start |
| Luteal | Fall | After that window, until the next period |

These labels are educational context. They are not a diagnosis, a fertility test, or contraception.

## How Ciclo picks a phase

1. Find the cycle that contains today: last period start on or before today, and the next start (logged, or the forecast most-likely date).
2. If today’s diary has **flow** → **Menstrual**, source **observed**.
3. Otherwise, if estimated phases are allowed:
   - Days from cycle start through the expected bleeding length → **Menstrual**, still **estimated** if you did not log flow.
   - The days ovulation most likely falls on if the next period comes on its expected day → **Ovulation**, estimated. Ciclo takes the next start minus a luteal phase of 12.4 ± 2.4 days (the average in more than 600,000 cycles, [Bull et al. 2019](https://doi.org/10.1038/s41746-019-0152-7)) and keeps the shortest run of days holding 80% of it: about **15–10 days before** the next start, six days. Never on a day of expected bleeding.
   - Before that window → **Follicular**, estimated.
   - After that window → **Luteal**, estimated.

A friend you share with sees the same phase: their phone works it out from the same three dates the same way.

If you turn forecasting off, Ciclo only shows a phase when flow is observed.

## Estimated ovulation on the calendar

The calendar shades the days ovulation may fall on and marks the most likely one more strongly. Open the phase card to read it as a line: **Estimated ovulation · Most likely 16 Nov · window 11–21 Nov**.

For the cycle you are in, that window is wider than the ovulation chapter. It also carries the uncertainty about when your next period starts, so it widens when you have logged few cycles or your cycles vary. It is usually about 11 days long. In a research dataset where ovulation was dated with daily LH tests, about 8 in 10 ovulations fell inside it, and the most likely day was about 3 days off on average. When the window reaches two weeks or more, the card says your cycles vary a lot and that an ovulation test can narrow it down. Past cycles are counted back from the period that came.

The window never reaches the expected period day. Fertile days start about five days before ovulation ([Wilcox et al. 1995](https://doi.org/10.1056/NEJM199512073332301)). The window is not a list of safe days, and outside it pregnancy is still possible.

## When the expected day passes

The most likely start is taken from the full forecast, before days already passed are dropped. The calendar keeps that day marked. It does not move the marker forward.

If that day arrives and you have not logged a new period start, the phase stays **Luteal · estimated**, but the home card switches to the **expected period** (Spanish UI: **Periodo previsto**). On that day it says the period may start today. After it, it counts days late from that date. Open it to see today's chance from the **initial** forecast. Example: if 10 October was 30%, 11 October 15%, and 12 October 11%, then on 12 October the card says you are 2 days late, and the expanded card says the initial forecast gave today an 11% chance. The calendar keeps the most likely day where it was.

The expanded card also shows the forecast with past days removed, like Patterns (its own tab on a phone, next to the calendar on a computer). That chart answers “what is still ahead?” Logging the first day of bleeding ends the expected-period card and starts a new cycle.

## Which day is “today”

Ciclo uses the time zone of your phone or computer to decide which day is today. The calendar moves to the next day at midnight on your clock. If Ciclo is open at midnight, or you come back to it the next day, it moves on by itself; you do not need to reload. The phase card, the forecast, and the tips in Patterns all count from that same day.

To use a different zone, go to **Settings** → **Time zone** (Spanish UI: **Zona horaria**). **Automatic** follows the device. The choice is saved on that device only.

Before October 2026, Ciclo used UTC (Coordinated Universal Time, the world reference clock). West of UTC, the calendar could switch to tomorrow in the evening. In Mexico City that was 18:00.

## Not the same as the period forecast

The forecast engine predicts the **next period start**. The phase labels and the estimated ovulation are built on top of it with a published luteal-phase length. They are calendar estimates, not a measurement of your hormones.

OpenCiclo does not claim to confirm ovulation. Do not use Ciclo as birth control.

## When it can look wrong

- Cycles vary a lot in length.
- Starts or flow were logged late or incompletely.
- There is little history, so the next start leans on a population typical length.
- Ovulation fell outside the window: about 1 in 6 times in the research data, and more often with irregular cycles.

That is why **estimated** stays on the card.
