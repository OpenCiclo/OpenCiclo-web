// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Going back without leaving Ciclo. The Navigation API lists only this
// origin's history entries, so it tells whether Back stays in the app.
// Browsers without it get the target page instead.

export type NavigationLike = {
  canGoBack: boolean;
  currentEntry: { index: number } | null;
  entries(): { url: string | null }[];
};

type Router = { back(): void; replace(href: string): void };

function navigationApi(): NavigationLike | undefined {
  return (globalThis as { navigation?: NavigationLike }).navigation;
}

function pathAndQuery(url: string): string {
  const parsed = new URL(url, "https://localhost");
  return parsed.pathname + parsed.search;
}

/** Path and query of the previous same-origin history entry, if there is one. */
export function previousPath(navigation: NavigationLike | undefined): string | null {
  const index = navigation?.currentEntry?.index ?? 0;
  if (!navigation || index < 1) return null;
  const url = navigation.entries()[index - 1]?.url;
  return url ? pathAndQuery(url) : null;
}

/** A "Back" link: the previous screen in Ciclo, or `fallback` after a direct visit. */
export function goBack(router: Router, fallback = "/app", navigation = navigationApi()) {
  if (navigation?.canGoBack) router.back();
  else router.replace(fallback);
}

/**
 * Leaves a sign-in form for `href`. Pops back when `href` is the previous
 * screen, so Back does not return to the form afterwards.
 */
export function returnTo(router: Router, href: string, navigation = navigationApi()) {
  if (previousPath(navigation) === pathAndQuery(href)) router.back();
  else router.replace(href);
}
