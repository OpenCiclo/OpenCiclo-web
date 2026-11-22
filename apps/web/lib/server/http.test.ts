// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigError, requireSecret } from "./env";
import { ANDROID_APP_ORIGIN, IOS_APP_ORIGIN, apiRoute, describeError, originAllowed, readJson } from "./http";

function post(body: string, headers: Record<string, string> = { "content-type": "application/json" }) {
  return new Request("https://ciclo.test/api/x", { method: "POST", headers, body });
}

describe("readJson", () => {
  it("reads a JSON object sent as application/json, with or without a charset", async () => {
    expect(await readJson(post('{"a":1}'))).toEqual({ ok: true, body: { a: 1 } });
    const withCharset = await readJson(post('{"a":2}', { "Content-Type": "application/json; charset=utf-8" }));
    expect(withCharset).toEqual({ ok: true, body: { a: 2 } });
  });

  it("answers 415 without the JSON content type, so a cross-site form cannot post", async () => {
    const variants: Record<string, string>[] = [
      {},
      { "content-type": "text/plain" },
      { "content-type": "application/x-www-form-urlencoded" },
    ];
    for (const headers of variants) {
      const result = await readJson(post('{"a":1}', headers));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(415);
    }
  });

  it("answers 400 for malformed JSON and for anything but an object", async () => {
    for (const body of ["{", "", "null", "[1,2]", '"text"', "42"]) {
      const result = await readJson(post(body));
      expect(result.ok, body).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(400);
    }
  });

  it("answers 413 when Content-Length is over the cap", async () => {
    const request = post('{"a":1}', { "content-type": "application/json", "content-length": "70000" });
    const result = await readJson(request, 65536);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  function chunked(chunks: string[]) {
    const encoder = new TextEncoder();
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (pulled < chunks.length) controller.enqueue(encoder.encode(chunks[pulled++]));
        else controller.close();
      },
    });
    const request = new Request("https://ciclo.test/api/x", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: stream,
      duplex: "half",
    } as RequestInit);
    return { request, pulled: () => pulled };
  }

  it("cuts off a body sent without Content-Length at the cap, without reading the rest", async () => {
    const big = chunked(Array.from({ length: 50 }, () => "x".repeat(1024)));
    expect(big.request.headers.get("content-length")).toBeNull();
    const result = await readJson(big.request, 4096);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
    expect(big.pulled()).toBeLessThan(10);

    const small = chunked(['{"a":', '"é"}']);
    expect(await readJson(small.request, 4096)).toEqual({ ok: true, body: { a: "é" } });
  });
});

describe("describeError", () => {
  it("keeps error names and codes and drops messages, which can hold query parameters", () => {
    const pg = Object.assign(new Error('duplicate key value (email_lookup)=(abc123)'), { name: "PostgresError", code: "23505" });
    const drizzle = new Error("Failed query: insert into accounts ... params: secret-ciphertext", { cause: pg });
    drizzle.name = "DrizzleQueryError";
    const line = describeError(drizzle);
    expect(line).toBe("DrizzleQueryError <- PostgresError 23505");
    expect(line).not.toMatch(/secret|abc123|insert/);
  });

  it("names a missing setting of our own, never its value", () => {
    expect(describeError(new ConfigError("SESSION_SECRET"))).toBe("ConfigError SESSION_SECRET_MISSING");
    expect(describeError(new ConfigError("DATABASE_URL"))).toBe("ConfigError DATABASE_URL_MISSING");
  });

  it("never prints an odd code or a non-error value", () => {
    const weird = Object.assign(new Error("x"), { code: "a b; DROP" });
    expect(describeError(weird)).toBe("Error");
    expect(describeError("someone@example.com")).toBe("string");
  });
});

describe("apiRoute", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("turns an unexpected error into a plain 500 and logs names only", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = apiRoute(async () => {
      throw new Error("Failed query: params: 0011aabb");
    });
    const response = await handler(new Request("https://ciclo.test/api/vault?x=1", { method: "PUT" }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Server error" });
    expect(log).toHaveBeenCalledWith("API PUT /api/vault failed: Error");
  });

  it("logs which setting is missing when a secret is not configured", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = apiRoute(async () => {
      requireSecret("SESSION_SECRET");
      return Response.json({ ok: true });
    });
    expect((await handler(new Request("https://ciclo.test/api/auth/verify", { method: "POST" }))).status).toBe(500);
    expect(log).toHaveBeenCalledWith("API POST /api/auth/verify failed: ConfigError SESSION_SECRET_MISSING");
    vi.unstubAllEnvs();
  });

  it("passes answers through", async () => {
    const handler = apiRoute(async () => Response.json({ ok: true }, { status: 201 }));
    expect((await handler(new Request("https://ciclo.test/api/x"))).status).toBe(201);
  });
});

describe("originAllowed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function logout(origin?: string) {
    return new Request("https://www.ciclo.test/api/auth/logout", {
      method: "POST",
      headers: origin === undefined ? {} : { origin },
    });
  }

  it("accepts no Origin, this host, APP_URL and the apps", () => {
    vi.stubEnv("APP_URL", "https://ciclo.test");
    expect(originAllowed(logout())).toBe(true);
    expect(originAllowed(logout("https://www.ciclo.test"))).toBe(true);
    expect(originAllowed(logout("https://ciclo.test"))).toBe(true);
    expect(originAllowed(logout(ANDROID_APP_ORIGIN))).toBe(true);
    expect(originAllowed(logout(IOS_APP_ORIGIN))).toBe(true);
  });

  it("refuses another site", () => {
    vi.stubEnv("APP_URL", "https://ciclo.test");
    expect(originAllowed(logout("https://evil.test"))).toBe(false);
    expect(originAllowed(logout("null"))).toBe(false);
    expect(originAllowed(logout("http://localhost"))).toBe(false);
    expect(originAllowed(logout("capacitor://evil.test"))).toBe(false);
  });
});
