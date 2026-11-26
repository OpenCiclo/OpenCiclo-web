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

### A pregnancy that is already over

If the dates you enter are those of a pregnancy that would be over by now (it began more than 44 weeks ago), Ciclo offers to add it as a past pregnancy. It asks the same two questions as an end (what happened, and when) and saves it with that end. The months it lasted then stop counting as one very long cycle in your averages and in Patterns.

## What you see

- **The card above the calendar**: the week and days (counted from zero: "Week 12 and 3 days"), the trimester, the weeks to go and the due date. Tap it for the likely window (37 to 42 weeks), how it was dated and the dates of each trimester.
- **The calendar**: a small number on the first day of each week, the due date circled, and the weeks 37 to 42 shaded. Period forecasts and ovulation estimates go away.
- **The day sheet**: the flow section is called **Bleeding**. Bleeding logged during a pregnancy never counts as a period. That starts on the estimated day of conception: bleeding in the two weeks before it is your last period.
- **Patterns**: your completed cycles stay. There is no "now" row and no day of the cycle, and what you log during the pregnancy is not counted as a cycle's symptoms.

Trimesters are counted as usual: the first to 13 weeks and 6 days, the second from 14 weeks to 27 weeks and 6 days, the third from 28 weeks. Term follows [ACOG Committee Opinion 579](https://pubmed.ncbi.nlm.nih.gov/24150030/). The dates are estimates. Ciclo does not replace your medical care.

## Friends

A pregnancy is private unless you choose to share it. While pregnancy mode is on, your friends see one of three things, as you choose:

- **No news** (the default): what they would see if you had stopped logging. For a few days your card says the period is expected about now, then that there is no recent update. Turning pregnancy mode on changes nothing they receive.
- **Simulated cycle**: phases as if your usual cycles went on from your last real period. A friend who looks closely may notice that "logged today" never appears.
- **My pregnancy week**: your card shows the week you are in and the trimester, and nothing else about the pregnancy: no due date on the card, no symptoms, no notes from your diary. To count the weeks on days you do not open Ciclo, your friends' phones receive your due date inside the encrypted message. It is offered once you have at least one friend, and it is never on unless you turn it on.

You can change this in **Settings** → **Pregnancy**, or with **Share my pregnancy week** in the Friends settings. **How friends see me** on the Friends screen shows your card as they get it.

Sharing is for that pregnancy only, and only while it goes on. The day you log its end, your friends stop getting the week: their card goes back to what **No news** shows, with no message about what happened. A later pregnancy is not shared unless you turn it on again. Pausing sharing with a friend, or with everyone, also hides the week from them.

Once your period comes back after the pregnancy, your card works as before.

With **No news**, bleeding you log reaches your friends as it would without pregnancy mode: they see a period logged that day and a new cycle from it. That keeps the pregnancy private, but it is not what your own calendar shows. If you would rather they saw nothing, pause sharing in Friends. After a birth, the date friends see for your next period can differ by a day or so from yours, for the same reason: their card is worked out from your diary without the pregnancy.

## When the pregnancy ends

**The pregnancy has ended** is at the bottom of the open card and in Settings. It asks two things: whether your baby was born or the pregnancy ended, and when. It never asks why.

Everything about the pregnancy goes at once: the card, the weeks, the due date. Until you log your next period, the card above the calendar only says that your cycle starts again then. Opened, it says what may happen now, and after a pregnancy that ended without a birth it links to a Learn article about recovery, with its sources. There is no forecast and nothing is ever "late". Bleeding in the first 20 days after the end never counts as a period (six weeks after a birth, or after a pregnancy that ended from 14 weeks on). After that, the first bleeding asks once whether your period has come back.

You choose what stays: kept in your diary (a thin line on the calendar that you can hide), or deleted completely. **I turned it on by mistake** deletes it as if it had never been there.

A wrong date or a wrong tap can be put right: **Settings** → **Pregnancy** → **Correct the end** asks the two questions again, and **It has not ended** takes the end back, so the pregnancy goes on.

After a pregnancy that ended without a birth, the forecast uses your cycles from before it, with a wider spread for the first three cycles. After a birth it starts again from the typical cycle length. Both are assumptions: there is no data to check them against yet.

## Your data

Pregnancy dates live only in your encrypted diary, like everything else you log. The server cannot read them, and nothing about a pregnancy goes to the research pool: the interval that held it is not counted as a cycle. A JSON export includes your pregnancies; a CSV export does not.

- **Use JSON for backups.** A CSV has no pregnancies, so a diary restored from one counts bleeding during a pregnancy as periods again.
- **Importing a JSON file** shows how many pregnancies it holds that your diary does not, and you choose whether to add them. The box is ticked by default only for an empty diary. Nothing remembers a pregnancy you deleted completely, so an old backup can still hold it: leave the box unticked to keep it out.
- **Two devices.** Only one pregnancy goes on at a time. If you turn the mode on in two devices before they sync, Ciclo keeps one of the two entries.
