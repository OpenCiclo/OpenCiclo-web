// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";

import { CLIENT_HEADER } from "@/lib/client-version";
import { FEEDBACK_MAX_LENGTH } from "@/lib/feedback";
import { parseFeedback } from "@/lib/server/feedback";

const web = new Headers({ [CLIENT_HEADER]: "web" });

describe("parseFeedback", () => {
  it("keeps the kind, the trimmed text, the version and a known language", () => {
    const result = parseFeedback(
      { kind: "idea", body: "  A dark calendar  ", appVersion: "web · abc1234", locale: "es" },
      web,
    );
    expect(result).toEqual({
      ok: true,
      value: { kind: "idea", body: "A dark calendar", contactEmail: null, platform: "web", appVersion: "web · abc1234", locale: "es" },
    });
  });

  it("reads the platform from the client header, never from the body", () => {
    const android = new Headers({ [CLIENT_HEADER]: "android/3" });
    const result = parseFeedback({ kind: "problem", body: "x", platform: "web" }, android);
    expect(result.ok && result.value.platform).toBe("android");
    const none = parseFeedback({ kind: "problem", body: "x", platform: "android" }, new Headers());
    expect(none.ok && none.value.platform).toBe("web");
  });

  it("refuses an unknown kind and empty or too long text", () => {
    expect(parseFeedback({ kind: "rant", body: "x" }, web).ok).toBe(false);
    expect(parseFeedback({ kind: "other", body: "   " }, web).ok).toBe(false);
    expect(parseFeedback({ kind: "other", body: "x".repeat(FEEDBACK_MAX_LENGTH + 1) }, web).ok).toBe(false);
    expect(parseFeedback({ kind: "other", body: "x".repeat(FEEDBACK_MAX_LENGTH) }, web).ok).toBe(true);
  });

  it("keeps a typed email normalized, refuses one that is not an address, and treats empty as none", () => {
    const ok = parseFeedback({ kind: "other", body: "x", contactEmail: " Ana@Example.org " }, web);
    expect(ok.ok && ok.value.contactEmail).toBe("ana@example.org");
    expect(parseFeedback({ kind: "other", body: "x", contactEmail: "not an email" }, web).ok).toBe(false);
    expect(parseFeedback({ kind: "other", body: "x", contactEmail: 42 }, web).ok).toBe(false);
    for (const empty of ["", "   ", null, undefined]) {
      const result = parseFeedback({ kind: "other", body: "x", contactEmail: empty }, web);
      expect(result.ok && result.value.contactEmail).toBe(null);
    }
  });

  it("drops an unknown language and control characters in the version, and caps it", () => {
    const result = parseFeedback(
      { kind: "other", body: "x", locale: "xx", appVersion: `1.0\u0000${"9".repeat(60)}` },
      web,
    );
    expect(result.ok && result.value.locale).toBe(null);
    expect(result.ok && result.value.appVersion).toBe(`1.0${"9".repeat(60)}`.slice(0, 40));
  });
});
