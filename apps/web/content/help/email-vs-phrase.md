# Email vs 12-word accounts

Ciclo does not use Clerk, Auth0, or a “forgot password” email that can open your diary. Identity is a secret generated on the device. You choose how that secret is stored.

## Email and password (recommended)

The browser still creates a 12-word phrase in the background. Your password **wraps** that phrase (PBKDF2 + AES-GCM). The server stores the wrapped kit and an HMAC of your email.

- Email cannot decrypt the diary by itself.
- Sign-in on a new device: same email and password. If this browser does not have the kit yet, the app downloads the **encrypted** kit (rate-limited). The password unwraps it locally. Day to day you do not need to open your inbox.
- **Creating** the account is different: Ciclo sends a 6-digit code to that inbox once. Without the code, nobody can claim your address. The code does not unwrap the phrase, reset the password, or open the diary. If the app closes while you read the email, the start screen offers to finish: the new account waits on this device (sealed by Android Keystore in the app, for this tab only in a browser).
- If you changed the password on another device, this device takes the new one: when its saved copy does not open, it fetches the current one from the server.
- The browser can save the password like any other site.
- **Keep me signed in** (on by default) stores the unlock secret on this device so you do not type the password every visit. Sign out clears it. Anyone with this browser profile can open the diary until then. In the Android app the secret is sealed by a key in the phone's secure hardware (Android Keystore), so a copy of the app's files does not reveal it; anyone using the unlocked phone can still open the diary.
- You can **change the password** in Settings while signed in. That re-wraps the same phrase. It does not re-encrypt the diary, and it is not a reset by email.

If you forget the password **and** you never saved the phrase, the hosted diary cannot be recovered. That is intentional.

### Adding an email to a 12-word account

A hosted account with no email sign-in can get one in **Settings → Add email and password**. That covers a super private account, and one that went to **Only on this device** and came back to the cloud (moving to the device deletes the account, email included). Type the email and a new password, then the 6-digit code Ciclo sends to that inbox. The code is always required: an address is never saved until its owner confirms it. After that, you can sign in with the email and password or with the phrase, and **Change password** appears in Settings.

## Super private mode (12 words, no email)

You hold the phrase. There is no mailbox row. We cannot show the phrase again if you lose it.

Save it in the browser’s password manager, or write it down somewhere you actually control. Anyone with the phrase can decrypt the diary on a new device.

Signing in with a phrase never creates an account. If no account uses the phrase you type, Ciclo says so and opens nothing. A mistyped word can still form a valid phrase, so check the 12 words before you create a new account. Only **Create account** makes a new one.

On the 12-word setup screen, **Save in the browser** is a normal username + password form (the phrase is the password). The app cannot force the manager to store it; accept the browser prompt if it appears. Copy and download still work. A copied phrase is cleared from the clipboard about a minute later when Ciclo can tell nothing else was copied since. The Android app has no **Save in the browser** form; there, Settings calls the section **Your 12-word phrase**.

Settings (and the 12-word setup screen) can also show a QR of the **same** phrase. It is not a new secret. Anyone who photographs it can open the diary.

Scan it inside Ciclo: Sign in → Super private mode → Scan QR. The camera never sends the phrase to the server. The payload is not a website URL, so a generic camera app will not open a link that contains your words.

Email-and-password accounts can still sign in by typing those credentials. The QR is optional for them: it encodes the hidden 12-word phrase, not the email and password.

## What the server sees in both cases

A public identifier derived from the secret (like an address), plus ciphertext. Login is a signature of a short-lived challenge. That proves you still hold the key without sending the key.

## Switching or exporting

Export JSON/CSV from Settings while you can still decrypt. Import restores diary **data** into an account. It does not clone the old cryptographic identity. A new phrase is a new account row as far as the server is concerned.
