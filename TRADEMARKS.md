# Trademarks

OpenCiclo is open source under the Apache License 2.0. That license covers the code. It does not cover the project's names or its logo: section 6 of the license grants no right to use the licensor's trademarks. This page says which marks those are and how you may use them.

## The marks

- The names **OpenCiclo** and **Ciclo**, as the name of this project, its apps and its website.
- The **round-sea logo**: a disc with a sea inside whose rim is bent by a few long waves, still or moving (the loading screen), in any color or size.

They belong to Emma Flora Harbison and Luis Rey Sánchez.

## The logo files are not under Apache-2.0

The logo artwork is Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez. All rights reserved. These files are excluded from the Apache License:

- `apps/web/lib/brand/sea-mark.ts` (the logo's shape and its movement)
- `apps/web/app/icon.svg` and `apps/web/app/favicon.ico`
- `apps/mobile/android/app/src/main/res/drawable/ic_launcher_foreground.xml`, `ic_launcher_monochrome.xml`, `splash_mark.xml` and `splash_sea.xml`
- `apps/mobile/android/app/src/main/res/mipmap-*/ic_launcher.png` and `ic_launcher_round.png`
- `docs/brand/sea-mark-motion.html`
- any image drawn from them, such as the icons the web app serves at `/apple-icon` and `/pwa-icon`

You may keep these files, unchanged, in a copy of this repository, and use them to build and run the software for development, testing and your own private use. Anything else needs our written permission.

Earlier versions of these files were published under Apache-2.0. That covers the copyright in those versions only. It never gave a right to use the logo as a brand.

## What you can do without asking

- Say, in plain text, that your work uses, is based on, or works with OpenCiclo.
- Write about the project, link to it, review it, teach with it, and show screenshots of the official app or website.
- Show the logo unchanged next to a mention of the project, for example in an article or a list of apps.

## What needs our permission

- Calling a fork, a modified build, or any other product or service OpenCiclo or Ciclo, or a name likely to be confused with them.
- Using the logo, or something that looks like it, as the icon or logo of anything else.
- Publishing a build to an app store, or running a service for other people, under the names or with the logo.
- Domain names, social accounts and app IDs that use the names (for example `com.openciclo.*`).
- Saying or suggesting that we made, endorse, certify or support your product.

## Forks

Forks are welcome under Apache-2.0. Before you share a fork or run it for other people, rebrand it:

1. Replace the logo in `apps/web/lib/brand/sea-mark.ts` with your own and run `npm run icons` in `apps/web`. It rewrites the icon files listed above.
2. Change the name: `appName` in `apps/web/lib/i18n.ts`, the brand in `apps/web/lib/marketing/copy.ts`, `apps/web/public/manifest.json`, and the metadata in `apps/web/app/layout.tsx` and `apps/web/app/layout.android.tsx`.
3. Change the Android app ID `com.openciclo.app` and the app's label: `apps/mobile/capacitor.config.ts`, `apps/mobile/android/app/build.gradle` and `apps/mobile/android/app/src/main/res/values/strings.xml`.
4. Keep the copyright notices and the NOTICE file, as Apache-2.0 requires. "Based on OpenCiclo" is fine.

## Asking

Open an issue at https://github.com/OpenCiclo/OpenCiclo-web/issues or write to us from https://openciclo.com/contact.
