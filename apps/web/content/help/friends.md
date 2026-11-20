# Friends: sharing your phase

**Friends** (Spanish UI: **Amigas**) lets you and a few close friends see each other's cycle phase, so you can be gentle with each other or notice when you are in sync. It is off until you turn it on, and only for a diary in the Ciclo cloud. A diary kept **Only on this device** shares nothing.

## What a friend sees

A card with your name, your current phase (Menstrual, Follicular, Ovulation, Luteal), and, if you choose:

- your cycle day,
- when your period is expected (a countdown; once the day comes it says "Period expected about now" for a few days, never "days late"),
- a short note, shown for 2 days.

They never see your symptoms, the notes in your diary, flow, or past cycles. To draw the card, their phone receives the estimated dates of your current cycle (its start, the expected next start and how long a period usually lasts), so the card stays right on days you do not open Ciclo. Hiding the cycle day or the expected period hides them from the card; the dates still travel inside the encrypted message.

Phases are estimates from each person's own logs, the same as on your Calendar card (see [Calendar phases and “estimated”](/help/calendar-phases-estimated)). They are not medical facts.

## Adding a friend

1. Open **Friends**, tick the box and choose the name your friends see.
2. Tap **Invite a friend** and send the link to **one** person (chat, email, or the QR code).
3. Your friend opens the link, or pastes it in **Friends** → **I have an invite**, and accepts.
4. The next time you open Friends, you see each other.

Whoever opens a link first becomes your friend; anyone else gets "already used". A link works for 7 days. You can cancel an invite nobody has opened. Sharing is mutual: accepting means both of you see each other.

## Pausing, removing, turning off

- **Pause** one friend, or **pause with everyone**: they see "Not sharing right now".
- **Remove** a friend: they see that you stopped sharing, and you stop seeing them.
- **Turn off Friends**: every friend is told, and your friend list and invites are deleted.
- Deleting your account does the same first.

## What Ciclo's server can see

Everything a friend receives is encrypted on your phone with a key only your two phones can work out. They make it from a secret in the invite link (after the `#`, a part of a link that browsers never send to a server) and a key exchange between the two phones when your friend accepts. The link alone is not enough to read or change what you share. The server stores:

- your friend list, as one encrypted blob linked to your account;
- one encrypted message per friend and direction, all the same size, with no account attached and an expiry date rounded to a week.

So the server cannot read what you share or tell who your friends are. It can see that your account uses Friends and when your device makes requests; for about a day after a write, its records could show which account wrote a message, but not who reads it.

Someone who gets hold of your invite link before your friend opens it could accept it instead. You see their name on the card, and you can remove them.
