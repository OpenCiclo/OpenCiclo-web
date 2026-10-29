// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

/**
 * Pages with chrome of their own (the landing, Help, the console, the dev
 * playgrounds): neither the phone tab bar nor the desktop header shows there.
 */
export function hidesAppChrome(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/dev-") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/console")
  );
}
