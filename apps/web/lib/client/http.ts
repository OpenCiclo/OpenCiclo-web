// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { APP_VERSION_CODE, IS_ANDROID_APP, apiUrl } from "@/lib/app-target";
import { CLIENT_HEADER, formatClientId } from "@/lib/client-version";

/**
 * How long one API request may take, body included. On a connection that
 * opens but never answers (a subway, a captive portal) a request would
 * otherwise hang forever: the app's native HTTP sets no timeout of its own.
 * Saves are compare-and-set, so a save that timed out here but reached the
 * host shows up as a 409 on the next try and merges.
 */
export const REQUEST_TIMEOUT_MS = 20_000;

/** The host did not answer within REQUEST_TIMEOUT_MS. */
export class RequestTimeoutError extends Error {
  constructor() {
    super("The request timed out");
    this.name = "RequestTimeoutError";
  }
}

/**
 * This build must be updated to go on. `reason`: "server", the host answered
 * 426 (it no longer serves this Android build); "diary", a newer build saved the
 * diary; "kit", a newer build made the recovery kit with parameters this one
 * does not take.
 */
export class UpdateRequiredError extends Error {
  constructor(readonly reason: "server" | "diary" | "kit" = "server") {
    super("This version of Ciclo needs an update");
    this.name = "UpdateRequiredError";
  }
}

const CLIENT_ID = formatClientId(
  IS_ANDROID_APP ? { platform: "android", versionCode: APP_VERSION_CODE } : { platform: "web" },
);

const updateListeners = new Set<() => void>();

/** Called whenever any API request gets a 426. Returns the unsubscribe. */
export function onUpdateRequired(listener: () => void): () => void {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
}

export type ApiRequestInit = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Plain object only: the app's native HTTP layer copies headers from it. */
  headers?: Record<string, string>;
  body?: string;
};

// 204, 205 and 304 may not carry a body; the API answers none of them today.
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

async function send(path: string, init: ApiRequestInit, signal: AbortSignal): Promise<Response> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { ...init.headers, [CLIENT_HEADER]: CLIENT_ID },
    signal,
  });
  // On the web fetch resolves when the headers arrive: read the body inside
  // the time limit too, then hand the caller a complete response.
  const body = await response.text();
  if (response.status === 426) {
    for (const listener of updateListeners) listener();
    throw new UpdateRequiredError();
  }
  return new Response(NULL_BODY_STATUSES.has(response.status) ? null : body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * Every client call to the Ciclo API goes through here: it builds the URL
 * (`apiUrl`), says which client is asking (`x-ciclo-client`), gives up after
 * `timeoutMs` with `RequestTimeoutError`, and turns a 426 into
 * `UpdateRequiredError`. Network failures reject as from `fetch`.
 */
export async function apiFetch(
  path: string,
  init: ApiRequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new RequestTimeoutError());
      // The app's native HTTP ignores the signal; its request finishes in the
      // background and its answer is dropped.
      controller.abort();
    }, timeoutMs);
  });
  const sending = send(path, init, controller.signal);
  // Whichever loses the race must not surface as an unhandled rejection.
  sending.catch(() => undefined);
  timedOut.catch(() => undefined);
  try {
    return await Promise.race([sending, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}
