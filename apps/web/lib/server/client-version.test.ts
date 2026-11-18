// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { UPGRADE_REQUIRED_CODE } from "@/lib/auth-codes";
import { CLIENT_HEADER, formatClientId, parseClientId } from "@/lib/client-version";

import { rejectOutdatedClient } from "./client-version";

function request(client?: string) {
  return new Request("http://localhost/api/vault", { headers: client ? { [CLIENT_HEADER]: client } : {} });
}

describe("client id header", () => {
  it("round-trips the app and the web", () => {
    expect(parseClientId(formatClientId({ platform: "android", versionCode: 12 }))).toEqual({
      platform: "android",
      versionCode: 12,
    });
    expect(parseClientId(formatClientId({ platform: "web" }))).toEqual({ platform: "web" });
  });

  it("ignores anything else", () => {
    for (const value of [null, "", "android/", "android/-1", "android/1.2", "ios/3", "android/12 extra"]) {
      expect(parseClientId(value)).toBeNull();
    }
  });
});

describe("rejectOutdatedClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("serves everyone while no minimum is set", () => {
    vi.stubEnv("MIN_ANDROID_VERSION_CODE", "");
    expect(rejectOutdatedClient(request("android/1"))).toBeNull();
  });

  it("refuses Android builds below the minimum with a 426 the app understands", async () => {
    vi.stubEnv("MIN_ANDROID_VERSION_CODE", "5");
    const response = rejectOutdatedClient(request("android/4"));
    expect(response?.status).toBe(426);
    expect(await response?.json()).toMatchObject({ code: UPGRADE_REQUIRED_CODE });
    expect(rejectOutdatedClient(request("android/5"))).toBeNull();
    expect(rejectOutdatedClient(request("android/6"))).toBeNull();
  });

  it("always serves the web, builds that send no header, and builds that do not know their version", () => {
    vi.stubEnv("MIN_ANDROID_VERSION_CODE", "5");
    expect(rejectOutdatedClient(request("web"))).toBeNull();
    expect(rejectOutdatedClient(request())).toBeNull();
    expect(rejectOutdatedClient(request("garbage"))).toBeNull();
    expect(rejectOutdatedClient(request("android/0"))).toBeNull();
  });

  it("ignores a minimum it cannot read", () => {
    vi.stubEnv("MIN_ANDROID_VERSION_CODE", "soon");
    expect(rejectOutdatedClient(request("android/1"))).toBeNull();
  });
});
