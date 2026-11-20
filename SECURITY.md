# Security

Ciclo keeps a menstrual-health diary. The diary is encrypted on the person's device before it is stored, and the host must never be able to read it. We treat any way around that as a serious bug.

## Report a vulnerability privately

Use GitHub's private vulnerability reporting:

**https://github.com/OpenCiclo/OpenCiclo-web/security/advisories/new**

Only the maintainers can see the report, and we can work on the fix with you there. The same address is published at `https://www.openciclo.com/.well-known/security.txt`. You can write in English or Spanish.

**If that link does not open a report form** (private reporting not switched on yet), [open a public issue](https://github.com/OpenCiclo/OpenCiclo-web/issues/new) titled "Security contact request" that says only that you have something to report privately. Put nothing else in it: no details, no affected part of the app, no proof of concept. A maintainer will answer there with a private way to send the report.

Please do not open a public issue, pull request, or discussion about a vulnerability until a fix is out.

A useful report says:

- what is affected (the web app at www.openciclo.com, the Android app and its version, a commit, or the Python library)
- the steps to reproduce it, or a proof of concept
- what an attacker gains, and what they need first (an account, a stolen device, a position on the network)

Never put real health data, a real recovery phrase, a password, or a private key in a report. Use a test account and made-up entries.

We are a small team. We reply in the advisory, keep you posted while we fix it, and credit you when it is published, unless you prefer otherwise.

## What is in scope

- **The web app and its API** (`apps/web`, hosted at www.openciclo.com): sign-in and sessions, the encrypted vault, email sign-in and recovery kits, the research pool, the operator console, and the public pages.
- **The Android app** (`apps/mobile`, `com.openciclo.app` on Google Play): the Capacitor shell, the on-device diary and its Keystore-sealed phrase, the offline copy, the app lock, backups and exported files.
- **The cryptography and diary code** shared by both (`apps/web/lib/crypto`, `lib/diary*`, vault sync).
- **The Python library** (`openciclo/`).

We especially want to hear about anything that would let the host, another user, or a network attacker:

- read a diary, a recovery phrase, a password, or a key
- learn whether an email address has an account
- sign in as someone else, or change or delete someone else's diary
- get past the per-address limits on sign-in, sign-up, recovery, or research uploads
- run script in the app (XSS, a CSP bypass), or read the phrase from the Android WebView or device storage

## What is out of scope

- Attacks that need a device or browser that is already compromised (malware, root, a malicious extension), or physical access to an unlocked device.
- Denial of service by sheer volume, and spam.
- Reports from automated scanners, or missing headers and settings, without a way to exploit them.
- Self-XSS, social engineering, and phishing.
- Problems in services we use (Vercel, Neon, Resend, GitHub, Google Play): please report those to them.
- Copies that other people host from this code, when the problem comes from their setup (for example no trusted proxy in front of the app; see the Help article *Run it yourself*).

## Supported versions

The web app at www.openciclo.com (built from `main`) and the latest Android release on Google Play. Fixes are not backported to older Android builds; the API can ask outdated builds to update (`MIN_ANDROID_VERSION_CODE`).

## What this project will not do

- Custom cryptography: only standard primitives (BIP39, HKDF-SHA-256, AES-256-GCM, Ed25519, PBKDF2) from Web Crypto and audited libraries.
- Telemetry, analytics SDKs, ad pixels, or exception trackers that could receive health data.
- Logging period dates, symptoms, notes, phrases, passwords, or keys.
- Storing an email address in plain text, or resetting a password on the host's word: the host never holds what it would take to decrypt a diary.
- Tying research contributions to an account.

## More

- [docs/threat-model.md](docs/threat-model.md): what we defend against, and what we do not
- [PRIVACY.md](PRIVACY.md): what data exists and where
- [docs/android.md](docs/android.md): how the Android app stores the diary and the phrase
