# Android: keep the diary on the phone

The Android app can keep your diary only on the phone, with no account and no server. Pick **Only on this device** when you create an account.

## What is stored, and where

- The diary is encrypted on the phone the same way as a hosted diary: AES-256-GCM, with a key derived from your 12-word phrase. The file lives in the app's private storage.
- The 12-word phrase is encrypted with a key held by Android Keystore. That key cannot be copied out of the phone, so the app opens the diary without asking you for the phrase.
- Nothing goes to the Ciclo server. The one exception is the optional research pool (cycle lengths only), if you turn it on.
- Android backups skip the app's data. A new phone does not get the diary on its own.

## The 12 words

You still get a 12-word phrase. Write it down. The app asks for it only when it cannot open the diary by itself, for example after you enroll a new fingerprint with the app lock on.

## Lock with fingerprint or PIN

Settings → Where your diary is saved. With the lock on:

- Ciclo asks for your fingerprint or screen lock when it opens, and again after 30 seconds in the background.
- The key that holds the phrase only works right after that check.
- The app is hidden in recent apps, and screenshots are blocked.

It needs Android 11 or newer, with a fingerprint or a screen lock set up.

## Backups

There is no copy anywhere else. If you lose the phone or uninstall the app, the diary is gone unless you exported it. Export from Settings → Backup, which opens the Android share sheet.

The export file is **not** encrypted. Keep it somewhere private.

## Moving between the phone and the cloud

- **Save to the cloud** uploads the encrypted diary as a 12-word account, then deletes the copy on the phone. If that phrase already had a hosted diary, the two are combined.
- **Keep only on this device** (from a hosted account) saves the diary on the phone, then deletes the hosted account, including email sign-in.

Either way, the old copy is deleted only after the new one is saved.

## Delete

Settings → **Delete the diary on this device** removes the diary, the encrypted phrase, and the Keystore keys. It cannot be undone.
