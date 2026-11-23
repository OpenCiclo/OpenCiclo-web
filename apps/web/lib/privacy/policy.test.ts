// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getTableName, is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import * as schema from "@/lib/db/schema";
import { FRIENDS_AVAILABLE } from "@/lib/features";
import { messages, type BaseLocale } from "@/lib/i18n";
import { CONTROLLER, PRIVACY_EMAIL } from "@/lib/marketing/copy";
import { deleteAccountGuide } from "@/lib/privacy/delete-account";
import { functionRegions } from "@/lib/privacy/hosting";
import { WEB_ONLY_PATHS, legalDocLinks, legalDocTexts, type LegalDoc } from "@/lib/privacy/legal-doc";
import { DEFAULT_POLICY_CONTEXT, privacyPolicy, type PolicyContext } from "@/lib/privacy/policy";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LANGS: BaseLocale[] = ["es", "en"];
const EMAIL = "privacy@example.org";
const OWNER = { name: "Example Controller S.L.", address: "Calle Falsa 123, 28000 Madrid, Spain" };

const contexts: Record<string, PolicyContext> = {
  "nothing set, US functions": { controller: null, email: null, regions: functionRegions({}) },
  "everything set, EU functions": { controller: OWNER, email: EMAIL, regions: functionRegions({ regions: ["fra1"] }) },
  "email only": { controller: null, email: EMAIL, regions: functionRegions({}) },
};

function text(doc: LegalDoc): string {
  return legalDocTexts(doc).join("\n");
}

function routeOf(href: string): string {
  return href.split(/[?#]/)[0].replace(/\/$/, "");
}

/** True when an internal href is a page of the web app. */
function isRoute(href: string): boolean {
  const route = routeOf(href);
  return [`app${route}/page.tsx`, `app/(marketing)${route}/page.tsx`].some((file) => existsSync(path.join(webRoot, file)));
}

/** True when the Android app has the page too (an `.android.tsx` twin). */
function isAndroidRoute(href: string): boolean {
  return existsSync(path.join(webRoot, `app${routeOf(href)}/page.android.tsx`));
}

function checkDoc(doc: LegalDoc, context: { email: string | null }) {
  const body = text(doc);
  // A value the owner has not chosen yet must never show as a placeholder.
  expect(body).not.toMatch(/\b(TODO|TBD|null|undefined)\b|\[\]|\(\)|mailto:(\)|$|\s)/);
  if (context.email) {
    expect(legalDocLinks(doc).some((link) => link.href === `mailto:${context.email}`)).toBe(true);
  } else {
    expect(body).not.toContain("mailto:");
    expect(body).not.toContain("@");
  }
  for (const link of legalDocLinks(doc)) {
    if (!link.href.startsWith("/")) continue;
    expect(isRoute(link.href), link.href).toBe(true);
    // The Android app opens a web-only page on the website instead of a route it does not have.
    expect(isAndroidRoute(link.href) || WEB_ONLY_PATHS.includes(routeOf(link.href)), link.href).toBe(true);
  }
}

describe("web-only pages", () => {
  it("have no Android route", () => {
    for (const route of WEB_ONLY_PATHS) {
      expect(isRoute(route), route).toBe(true);
      expect(isAndroidRoute(route), route).toBe(false);
    }
  });
});

describe("privacy policy", () => {
  for (const [name, context] of Object.entries(contexts)) {
    for (const lang of LANGS) {
      it(`${lang}, ${name}: reads cleanly, with working links`, () => {
        checkDoc(privacyPolicy(lang, context), context);
      });
    }
  }

  it("names the controller only once it is set", () => {
    for (const lang of LANGS) {
      expect(text(privacyPolicy(lang, contexts["nothing set, US functions"]))).not.toContain(OWNER.name);
      const body = text(privacyPolicy(lang, contexts["everything set, EU functions"]));
      expect(body).toContain(OWNER.name);
      expect(body).toContain(OWNER.address);
    }
  });

  it("says where the server code runs, and only claims the EU when it is there", () => {
    const us = text(privacyPolicy("en", contexts["nothing set, US functions"]));
    expect(us).toContain("Washington, D.C. (United States)");
    expect(us).toContain("passes through there");
    const eu = text(privacyPolicy("en", contexts["everything set, EU functions"]));
    expect(eu).toContain("both inside the EU");
    expect(text(privacyPolicy("es", contexts["everything set, EU functions"]))).toContain("ambos dentro de la UE");
  });

  it("has the same sections in Spanish and English", () => {
    const ids = (lang: BaseLocale) => privacyPolicy(lang, DEFAULT_POLICY_CONTEXT).sections.map((section) => section.id);
    expect(ids("es")).toEqual(ids("en"));
    const items = (lang: BaseLocale) =>
      privacyPolicy(lang, DEFAULT_POLICY_CONTEXT).sections.flatMap((section) =>
        section.blocks.filter((block) => block.kind === "item").map((block) => block.kind === "item" && block.rows.length),
      );
    expect(items("es")).toEqual(items("en"));
  });

  it("covers what GDPR article 13 and Google Play ask for", () => {
    const ids = privacyPolicy("en", DEFAULT_POLICY_CONTEXT).sections.map((section) => section.id);
    for (const id of ["controller", "contact", "data", "processors", "transfers", "retention", "deletion", "rights", "children", "changes"]) {
      expect(ids).toContain(id);
    }
    expect(legalDocLinks(privacyPolicy("en", DEFAULT_POLICY_CONTEXT)).map((link) => link.href)).toContain("/delete-account");
  });

  it("names the most sensitive things a diary can hold, in the policy and at sign-up", () => {
    const en = text(privacyPolicy("en", DEFAULT_POLICY_CONTEXT));
    for (const word of ["pregnancy", "ovulation test", "contraceptive pill", "medicines", "anxiety", "obsessive thoughts", "urinary", "alcohol", "travel", "sexual activity"]) {
      expect(en, word).toContain(word);
    }
    const es = text(privacyPolicy("es", DEFAULT_POLICY_CONTEXT));
    for (const word of ["embarazo", "ovulación", "píldora anticonceptiva", "medicamentos", "ansiedad", "pensamientos obsesivos", "urinarias", "alcohol", "viajes", "actividad sexual"]) {
      expect(es, word).toContain(word);
    }
    for (const word of ["pregnancy", "contraceptive", "mental health", "sex"]) expect(messages.en.signupConsentHosted, word).toContain(word);
    for (const word of ["embarazo", "anticonceptivas", "salud mental", "sexual"]) expect(messages.es.signupConsentHosted, word).toContain(word);
  });

  it("does not claim a record of consent, or that sign-up asks about staying signed in", () => {
    for (const lang of LANGS) {
      const body = text(privacyPolicy(lang, DEFAULT_POLICY_CONTEXT));
      expect(body).not.toMatch(/ask for your consent again|pedirá de nuevo el consentimiento|which you give when you create|que das al crear/);
    }
    expect(text(privacyPolicy("en", DEFAULT_POLICY_CONTEXT))).toContain("Right after you create an account, Ciclo keeps you signed in");
    expect(text(privacyPolicy("es", DEFAULT_POLICY_CONTEXT))).toContain("Justo después de crear una cuenta, Ciclo mantiene tu sesión iniciada");
  });

  it("builds from the owner's values in lib/marketing/copy.ts", () => {
    expect(DEFAULT_POLICY_CONTEXT.controller).toBe(CONTROLLER);
    expect(DEFAULT_POLICY_CONTEXT.email).toBe(PRIVACY_EMAIL);
  });

  // A new table means new personal data, or not: decide, then describe it in
  // lib/privacy/policy.ts, PRIVACY.md and docs/play/privacy-checklist.md, and add it here.
  it("has been checked against every database table", () => {
    const described: Record<string, string> = {
      accounts: "diary, account key",
      account_activity_days: "daily activity count",
      recovery_mailboxes: "email sign-in",
      mailbox_pending: "email sign-in (pending code)",
      auth_challenges: "account key (sign-in challenges)",
      recovery_attempts: "protection against abuse",
      rate_limit_hits: "protection against abuse",
      research_contributions: "research pool",
      learn_articles: "not personal data (operator-written articles)",
      recovery_tokens: "not written by any code (legacy table)",
      // Written only while FRIENDS_AVAILABLE is on (the routes answer 404
      // otherwise); the test below holds the flag until the policy says so.
      friend_books: "Friends (sealed friend list, per account)",
      friend_boxes: "Friends (sealed messages between friends, no account)",
      feedback: "feedback (plain text, optional email, no account)",
    };
    const tables = Object.values(schema)
      .filter((value) => is(value, PgTable))
      .map((table) => getTableName(table as PgTable))
      .sort();
    expect(tables).toEqual(Object.keys(described).sort());
  });

  // Friends stores data only once FRIENDS_AVAILABLE is on: by then the policy
  // must describe it, in both authoritative languages.
  it("describes Friends whenever the feature is available", () => {
    if (!FRIENDS_AVAILABLE) return;
    expect(text(privacyPolicy("en", DEFAULT_POLICY_CONTEXT))).toMatch(/\bFriends\b/);
    expect(text(privacyPolicy("es", DEFAULT_POLICY_CONTEXT))).toMatch(/\bAmig[ao]s\b/);
  });

  // A new column in a table that holds personal data fails here until someone
  // has checked the policy (and PRIVACY.md, docs/play/privacy-checklist.md).
  it("has been checked against every column of the tables that hold personal data", () => {
    const reviewed: Record<string, string[]> = {
      accounts: ["id", "pubkey_hash", "pubkey", "ciphertext", "nonce", "schema_version", "created_at", "updated_at", "vault_version"],
      account_activity_days: ["account_id", "day"],
      recovery_mailboxes: [
        "id",
        "email_lookup",
        "wrapped_secret",
        "wrap_nonce",
        "wrap_salt",
        "wrap_params",
        "account_id",
        "verified_at",
        "created_at",
      ],
      mailbox_pending: [
        "id",
        "email_lookup",
        "account_id",
        "wrapped_secret",
        "wrap_nonce",
        "wrap_salt",
        "wrap_params",
        "code_hash",
        "expires_at",
        "attempt_count",
        "created_at",
      ],
      auth_challenges: ["id", "pubkey_hash", "nonce", "expires_at", "created_at"],
      recovery_attempts: ["id", "email_lookup", "ip_hash", "created_at"],
      rate_limit_hits: ["id", "bucket", "key_hash", "created_at"],
      research_contributions: ["pool_id", "contributor_key_hash", "cycle_lengths", "created_at", "updated_at"],
      recovery_tokens: ["id", "email_lookup", "token_hash", "expires_at", "created_at"],
      friend_books: ["account_id", "ciphertext", "nonce", "version", "updated_at"],
      friend_boxes: ["box_hash", "write_hash", "ciphertext", "nonce", "expires_at"],
      feedback: ["id", "created_at", "kind", "body", "contact_email", "platform", "app_version", "locale"],
    };
    const byName = new Map(
      Object.values(schema)
        .filter((value) => is(value, PgTable))
        .map((table) => [getTableName(table as PgTable), table as PgTable] as const),
    );
    for (const [name, columns] of Object.entries(reviewed)) {
      const table = byName.get(name);
      expect(table, name).toBeDefined();
      const actual = getTableConfig(table!).columns.map((column) => column.name).sort();
      expect(actual, name).toEqual([...columns].sort());
    }
  });
});

describe("/delete-account guide", () => {
  for (const email of [null, EMAIL]) {
    for (const lang of LANGS) {
      it(`${lang}, email ${email ? "set" : "not set"}: reads cleanly, with working links`, () => {
        checkDoc(deleteAccountGuide(lang, { email }), { email });
      });
    }
  }

  it("offers the request by email only once the mailbox exists", () => {
    for (const lang of LANGS) {
      const lost = (email: string | null) =>
        deleteAccountGuide(lang, { email }).sections.find((section) => section.id === "lost");
      expect(lost(null)?.blocks).toHaveLength(1);
      expect(lost(EMAIL)?.blocks.length).toBeGreaterThan(1);
    }
  });

  it("has the same sections in Spanish and English, and links to the policy", () => {
    const ids = (lang: BaseLocale) => deleteAccountGuide(lang, { email: EMAIL }).sections.map((section) => section.id);
    expect(ids("es")).toEqual(ids("en"));
    for (const lang of LANGS) {
      expect(legalDocLinks(deleteAccountGuide(lang)).map((link) => link.href)).toContain("/privacy");
    }
  });
});
