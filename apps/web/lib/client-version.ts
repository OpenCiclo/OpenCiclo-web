// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Which client sent an API request. The web is always the build the host just
// served; an app build from Google Play or the App Store can be months old.
// Every client request carries this header, so the host can tell an Android
// build that is too old to talk to it (426, see lib/server/client-version.ts)
// instead of letting it misbehave. Never add anything identifying to it.

export const CLIENT_HEADER = "x-ciclo-client";

export type ClientId = { platform: "android" | "ios"; versionCode: number } | { platform: "web" };

/** `android/<versionCode>` or `ios/<versionCode>` for the apps, `web` for the browser. */
export function formatClientId(client: ClientId): string {
  return client.platform === "web" ? "web" : `${client.platform}/${client.versionCode}`;
}

/** Null when the header is missing (builds from before it existed) or unreadable. */
export function parseClientId(value: string | null): ClientId | null {
  if (value === "web") return { platform: "web" };
  const match = /^(android|ios)\/(\d{1,9})$/.exec(value ?? "");
  if (!match) return null;
  return { platform: match[1] === "ios" ? "ios" : "android", versionCode: Number(match[2]) };
}
