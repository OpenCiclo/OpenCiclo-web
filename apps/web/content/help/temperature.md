# Temperature

You can log your body temperature for a day and see the readings of each cycle as a chart. Ciclo keeps and draws what you type. It does not read the chart for you.

## What Ciclo does not do

- It does not detect a temperature rise, draw a cover line, or mark an ovulation day from your readings.
- It does not use temperature in the period forecast or in the estimated ovulation on the calendar. Those come from your period dates only (see [How the forecast works](/help/how-the-forecast-works)).
- It does not tell you which days are fertile. Temperature does not confirm or predict ovulation here, and Ciclo is not contraception and not a medical device.

If you chart temperature as part of a fertility awareness method, the reading of the chart is yours, with the rules of your method. The Learn article [Fertility awareness](/learn/fertility-awareness) explains how those methods work and their limits.

## Logging it

Open a day on the calendar. Under **Cervical mucus** there is a **Temperature** row:

- Type the reading with a comma or a dot, with up to two decimals: `36,55` or `36.55`.
- Pick **°C** or **°F** beside the field. The switch shows the same reading in the other unit; it does not change what you logged.
- Ciclo accepts 34 to 42 °C (93.2 to 107.6 °F). Outside that it asks you to check the number and does not save it.
- The **×** in the field clears the reading. **Save entry** saves the day.

Basal temperature is the one taken on waking, before getting up, with the same thermometer and in the same way each day. Illness, alcohol, a short night or a different waking time can move it.

While a pregnancy goes on, the row is not offered on its days. A reading you logged there before still shows and can be cleared.

## The chart in Patterns

Once the diary holds a reading, **Patterns** shows a **Temperature** card:

- One cycle at a time. The arrows go to earlier cycles that have readings.
- Cycle day runs across, temperature up. Each reading is a dot. A line joins readings on consecutive days only, so a day you skipped stays a gap.
- Bleeding you logged is marked along the bottom.
- Touch or point at the chart to read one day. **Show as a table** lists every reading of the cycle.
- Under the chart: days measured, lowest, highest and average for that cycle.

The vertical scale never spans less than 1 °C (2 °F). A cycle with almost flat readings is drawn flat, not stretched until it looks like a rise.

A reading that belongs to no logged cycle is kept but not drawn, and the card says how many there are. That happens before your first logged period, and in the days that held a pregnancy.

The card does not show while a pregnancy goes on.

## Units

The unit is a display setting on this device (**Settings**, beside the week start, or the switch in the day's row). The diary always stores degrees Celsius, to a thousandth of a degree, so a reading typed in Fahrenheit reads back exactly as you typed it.

## Your data

Temperature is part of the encrypted diary, like symptoms and notes. The host cannot read it. Friends never receive it. The research pool never receives it.

It is in the JSON export, and in the CSV export as the column `bbtCelsius` (degrees Celsius, with a dot).

An app version from before this feature opens a diary that has it read-only until the app is updated, so it can never save the diary back without your readings.
