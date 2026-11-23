# Pregnancy mode

Pregnancy mode replaces period forecasts with the weeks of a pregnancy. Only you turn it on: Ciclo never suggests that you might be pregnant, not even when a period is late.

## Turning it on

You can turn it on from **Settings** → **Pregnancy**, from the expected-period card (**I'm pregnant**, under the details), or from the day sheet after you log a positive pregnancy test. A short sheet asks how to date it:

| What you know | How Ciclo works out the due date |
| --- | --- |
| Your last period | 280 days after its first day, adjusted by up to a week for your usual cycle length ([Naegele's rule with Parikh's correction](https://www.ncbi.nlm.nih.gov/books/NBK536986/)) |
| The due date you were given | That date |
| An ultrasound | The scan date plus the days left to 40 weeks from the age you were given that day |
| The day of ovulation or conception | 266 days after it |
| An embryo transfer | 266 days after it, minus the embryo's age (day 3 or day 5) |

These follow [ACOG Committee Opinion 700](https://pubmed.ncbi.nlm.nih.gov/28426621/). An ultrasound in the first trimester is the most accurate, so a later scan replaces what you entered before (**Change** on the card). If your cycles are usually shorter than 21 or longer than 35 days, Ciclo suggests dating by ultrasound.

## What you see

- **The card above the calendar**: the week and days (counted from zero: "Week 12 and 3 days"), the trimester, the weeks to go and the due date. Tap it for the likely window (37 to 42 weeks), how it was dated and the dates of each trimester.
- **The calendar**: a small number on the first day of each week, the due date circled, and the weeks 37 to 42 shaded. Period forecasts and ovulation estimates go away.
- **The day sheet**: the flow section is called **Bleeding**. Bleeding logged during a pregnancy never counts as a period.

Trimesters are counted as usual: the first to 13 weeks and 6 days, the second from 14 weeks to 27 weeks and 6 days, the third from 28 weeks. Term follows [ACOG Committee Opinion 579](https://pubmed.ncbi.nlm.nih.gov/24150030/). The dates are estimates. Ciclo does not replace your medical care.

## Friends

A pregnancy is never shared. While pregnancy mode is on, your friends see one of two things, as you choose:

- **No news** (the default): what they would see if you had stopped logging. For a few days your card says the period is expected about now, then that there is no recent update. Turning pregnancy mode on changes nothing they receive.
- **Simulated cycle**: phases as if your usual cycles went on from your last real period. A friend who looks closely may notice that "logged today" never appears.

You can change this in **Settings** → **Pregnancy**. Once your period comes back after the pregnancy, your card works as before.

## When the pregnancy ends

**The pregnancy has ended** is at the bottom of the open card and in Settings. It asks two things: whether your baby was born or the pregnancy ended, and when. It never asks why.

Everything about the pregnancy goes at once: the card, the weeks, the due date. Until you log your next period, the card above the calendar only says that your cycle starts again then. There is no forecast and nothing is ever "late". Bleeding in the first 20 days after the end never counts as a period (six weeks after a birth, or after a pregnancy that ended from 14 weeks on). After that, the first bleeding asks once whether your period has come back.

You choose what stays: kept in your diary (a thin line on the calendar that you can hide), or deleted completely. **I turned it on by mistake** deletes it as if it had never been there.

After a pregnancy that ended without a birth, the forecast uses your cycles from before it, with a wider spread for the first three cycles. After a birth it starts again from the typical cycle length. Both are assumptions: there is no data to check them against yet.

## Your data

Pregnancy dates live only in your encrypted diary, like everything else you log. The server cannot read them, and nothing about a pregnancy goes to the research pool: the interval that held it is not counted as a cycle. A JSON export includes your pregnancies; a CSV export does not.
