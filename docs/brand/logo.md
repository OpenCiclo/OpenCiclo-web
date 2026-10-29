# Brand mark

OpenCiclo
Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
Apache License 2.0

The Ciclo mark is a dark disc with a white "round sea" inside. The sea is almost a circle, but its rim is bent by a few long waves, like a thick liquid. The still mark is the logo, the app icon and the favicon. The moving mark is the loading screen.

The design file is [sea-mark-motion.html](sea-mark-motion.html) ("En movimiento"). Open it in a browser to see the motion and try the controls.

## Geometry

The source of truth is `apps/web/lib/brand/sea-mark.ts`. Everything below is generated from it.

The mark lives in a 32×32 box. The disc fills it (radius 16). The sea is a circle of radius 5.8 whose rim moves in and out by a sum of waves. A wave is described by `k` (how many crests around the rim) and `a` (height, as a share of the radius).

| Still waves | k = 2 | k = 3 | k = 4 | k = 5 |
| --- | --- | --- | --- | --- |
| Height `a` | 0.022 | 0.034 | 0.024 | 0.016 |

Only long waves (few crests) are used for the still shape. Waves with 6 to 9 crests made the sea look like a pebble with flat sides.

## Motion

The sea does not turn. Its shape stays in place and only the rim moves:

- **Breathing.** Each still wave grows and shrinks by up to 15 %, slowly.
- **Surface waves.** Four more waves (k = 3, 4, 6, 8) run clockwise along the rim.
- **Dispersion.** As in deep water, a wave's frequency grows with √k, so long waves travel faster than short ones. The waves keep overtaking each other, so the edge keeps changing instead of spinning.
- **Density.** A thicker sea (default 0.6 of 1) damps the short waves and slows everything down.
- **Crests.** A little steepness makes crests narrower than troughs, which reads as water rather than jelly. Total steepness is capped so the rim never folds over itself (`sea-mark.test.ts` checks this).

`seaMarkPath(t)` returns the shape at `t` seconds. With no `t` it returns the still mark. People who ask for reduced motion get the still mark.

## Colors

| Use | Disc | Sea | Background |
| --- | --- | --- | --- |
| Icons, favicon, light pages | `#24272a` | `#fcfcfc` | `#f9fafb` |
| Dark pages | `#e6e8ea` | `#101214` | `#101214` |

The dark-page colors match `.dark .marketing-theme`. `BrandMark` in the app header follows the theme's primary colors instead, so it is rose there.

## Where it is used

| Surface | File |
| --- | --- |
| Header mark | `apps/web/components/brand-mark.tsx` |
| Favicon | `apps/web/app/icon.svg`, `apps/web/app/favicon.ico` (16, 32, 48 px) |
| Home-screen icons | `apps/web/app/apple-icon.tsx`, `apps/web/app/pwa-icon/[size]/route.tsx` |
| Loading screen | `apps/web/components/boot-splash.tsx`, `apps/web/lib/brand/boot-splash-script.ts` |
| Android icon | `apps/mobile/android/app/src/main/res/drawable/ic_launcher_*.xml` (adaptive and themed), `mipmap-*/ic_launcher*.png` (Android 7) |
| Android splash | `res/values/styles.xml`, `drawable/splash*.xml`, `values*/brand_colors.xml` |

## Loading screen

The loading screen covers the page from the first paint until the app is ready, which means the stored session has been restored. It stays at least 0.7 s, so it never flickers, and at most 6 s, so a slow network never hides a page that is already there. Then it fades out in 0.3 s.

A small inline script shows it and moves the sea before React loads. If scripts are off, CSS keeps it hidden.

On Android the system splash shows the still mark first, with a 160 dp disc on the page background. The web loading screen then draws the same mark at the same size and starts the waves, so the hand-over is seamless.

## Changing the mark

1. Edit `apps/web/lib/brand/sea-mark.ts`.
2. Run `npm run icons` in `apps/web`. It rewrites `icon.svg` and `favicon.ico`, and the Android drawables, bitmaps and colors when `apps/mobile` is present.
3. Run `npm test`. A test fails if `icon.svg` no longer matches the code.

## Variants explored

Six shapes were drawn before choosing. They are kept here for reference only.

| Name | Idea | Status |
| --- | --- | --- |
| Mar redondo | Almost round, long swell | Chosen |
| Gota densa | Thick as mercury, three slow lobes | Runner-up, available in the design file |
| Marea | Stretched into an oval, like a tide | Not used |
| Oleaje | Small waves on one side only | Not used |
| Corriente | Three lobes leaning clockwise | Not used |
| Mar abierto | Sea at half the disc, thin dark ring | Not used |
