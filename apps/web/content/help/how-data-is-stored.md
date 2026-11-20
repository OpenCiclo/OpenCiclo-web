# How data is stored

Ciclo is built so that **the people who run the server cannot read your diary**. That is a design choice, not a policy we could quietly reverse without changing the code.

## The short version

Period dates, symptoms, mucus, and day notes are encrypted **in the browser** (AES-256-GCM) before they are sent. Postgres stores that ciphertext. Forecasting runs in the browser too. There is no analytics SDK.

Ciclo cannot reset your password or your 12-word phrase. If both are gone, the hosted diary is gone. Export a backup while you still can.

You can change the wrap password in Settings while you are signed in. That only replaces the wrapped copy of the phrase. The diary blob stays the same.

**Keep me signed in** stores the unlock secret in this browser until you sign out. That is a device convenience, not a server session that can decrypt the diary. The Android app keeps it sealed by Android Keystore instead of browser storage. Unchecked, the app keeps it in memory only, so closing the app signs you out.

If Ciclo cannot reach the server when it opens (no connection, or a server error), it keeps that secret and shows **Try again**. It does not show an empty diary while it waits, so nothing can be saved over your real one.

In the Android app, with **Keep me signed in** on, Ciclo also keeps a copy of your diary on the phone, encrypted the same way as on the server. Without a connection it opens that copy so you can look through it, and says when it was last saved. You cannot change anything until the connection comes back, then the app loads the diary from the server again. Signing out deletes the copy.

## What happens on save

1. You are signed in. The browser already holds a key derived from your 12-word phrase.
2. The diary is encrypted. Only the encrypted blob and a nonce go to the server.
3. The server stores that blob on your account row. It does not add columns for flow, symptoms, or notes.

A new symptom label or a day note does not change the database schema. It stays inside the blob.

### Two devices at once

Each save says which version of the diary it was made on. If another device (or another tab) saved in between, the server refuses the save and sends back the newer encrypted copy. Your browser decrypts it, combines both sets of edits, and saves again. The server never sees the contents.

Edits on different days, or to different things on the same day, are all kept. Something deleted on one device stays deleted. If both devices changed the same thing (for example the note on the same day), the device that saves last wins.

## What the server does store

- **Account identity** — a public key hash, not your phrase.
- **Diary ciphertext** — unreadable without the device key.
- **Email accounts only** — an HMAC of your email, plus a copy of the phrase **wrapped with your password**. The plaintext email is never stored. Signup writes a short-lived `mailbox_pending` row and emails a hashed 6-digit code; the mailbox row is created only after that code is confirmed (`verified_at`). Email alone cannot unwrap the kit.
- **Optional research rows** — cycle lengths as whole numbers, with a random pool id. No link from your account to that id.

The password never leaves the browser in the clear. Login is a short-lived cryptographic challenge: you prove you still hold the key.

## What does not leave the device

By default: no period dates in the clear, no symptom lists, no notes.

These display settings stay in this browser and are not sent to the server: appearance, visual seasons, moon phases, week start, and time zone. The interface language is saved in the encrypted diary too, so it follows you to other devices. Before any language is saved, Ciclo starts in your device language when it has it (Portuguese from Portugal gets Brazilian Portuguese), and in English otherwise.

The research pool is a separate, off-by-default consent. It sends lengths only. It is not a backup.

## Deletion and export

Settings can export JSON or CSV after decrypting on the device. Import restores **diary data** into the same or a new account. It does not restore the old keys.

Dates are written as `YYYY-MM-DD`. A date that does not exist on the calendar, such as `2026-02-30` or `2026-13-01`, or a year outside 1900–2999, is skipped on import; the other rows still come in. Only an earlier import could have put such a date in a diary. If yours holds one, Ciclo leaves that day out when it opens the diary, together with any note written on it, and the next save removes it. Earlier versions listed a note on such a day in **Diary** (Spanish UI: **Diario**) and Patterns under the next real date (for example 2 March for 30 February), but no calendar day showed it.

Delete account removes your ciphertext and mailbox row. Research rows that were already uploaded without an account link cannot be found later, so they cannot be deleted on request. That limit is shown before you contribute.

## The Python library

`openciclo` still runs offline. You pass dates in; you get a forecast back in memory. No hosted app required.
