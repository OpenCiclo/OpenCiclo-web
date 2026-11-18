// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CLIENT_HEADER } from "@/lib/client-version";
import { REQUEST_TIMEOUT_MS, RequestTimeoutError, UpdateRequiredError, apiFetch, onUpdateRequired } from "./http";

describe("apiFetch", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("says which client is asking and keeps the caller's headers", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const response = await apiFetch("/api/vault", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    expect(await response.json()).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/vault");
    expect(init?.method).toBe("PUT");
    expect(init?.headers).toEqual({ "content-type": "application/json", [CLIENT_HEADER]: "web" });
  });

  it("gives up on a request that never answers", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const pending = apiFetch("/api/vault");
    const settled = expect(pending).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await settled;
  });

  it("gives up when the headers arrive but the body never does", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({
      status: 200,
      text: () => new Promise<string>(() => {}),
    } as unknown as Response);
    const pending = apiFetch("/api/vault");
    const settled = expect(pending).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await settled;
  });

  it("does not time out a request that answered in time", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const response = await apiFetch("/api/vault");
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS * 2);
    expect(response.status).toBe(200);
  });

  it("turns a 426 into UpdateRequiredError and tells the listeners", async () => {
    const listener = vi.fn();
    const stop = onUpdateRequired(listener);
    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ code: "upgrade-required" }), { status: 426 }),
    );
    await expect(apiFetch("/api/auth/challenge", { method: "POST" })).rejects.toBeInstanceOf(UpdateRequiredError);
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    await expect(apiFetch("/api/auth/challenge", { method: "POST" })).rejects.toBeInstanceOf(UpdateRequiredError);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("passes other errors through as responses for the caller to read", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "Vault changed" }), { status: 409 }));
    const response = await apiFetch("/api/vault", { method: "PUT", body: "{}" });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Vault changed" });
  });

  it("rejects like fetch when the network fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(apiFetch("/api/vault")).rejects.toBeInstanceOf(TypeError);
  });
});
