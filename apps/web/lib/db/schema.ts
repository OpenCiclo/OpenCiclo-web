// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The SQL files in drizzle/ are the source of truth. This file mirrors them so
// queries are typed against the real database: tables, columns, unique
// constraints, indexes (including the partial one), checks, and foreign keys.
// schema-drift.test.ts fails if the two disagree. Never run `drizzle-kit push`.

import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  pubkeyHash: text("pubkey_hash").notNull().unique("accounts_pubkey_hash_key"),
  pubkey: text("pubkey").notNull(),
  ciphertext: text("ciphertext").notNull(),
  nonce: text("nonce").notNull(),
  schemaVersion: integer("schema_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  vaultVersion: integer("vault_version").notNull().default(0),
});

export const accountActivityDays = pgTable(
  "account_activity_days",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.day] }),
    index("account_activity_days_day_idx").on(table.day),
  ],
);

export const recoveryMailboxes = pgTable(
  "recovery_mailboxes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailLookup: text("email_lookup").notNull().unique("recovery_mailboxes_email_lookup_key"),
    wrappedSecret: text("wrapped_secret").notNull(),
    wrapNonce: text("wrap_nonce").notNull(),
    wrapSalt: text("wrap_salt").notNull(),
    wrapParams: jsonb("wrap_params").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("recovery_mailboxes_account_idx").on(table.accountId)],
);

export const mailboxPending = pgTable(
  "mailbox_pending",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailLookup: text("email_lookup").notNull().unique("mailbox_pending_email_lookup_key"),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    wrappedSecret: text("wrapped_secret").notNull(),
    wrapNonce: text("wrap_nonce").notNull(),
    wrapSalt: text("wrap_salt").notNull(),
    wrapParams: jsonb("wrap_params").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("mailbox_pending_account_idx").on(table.accountId)],
);

export const researchContributions = pgTable(
  "research_contributions",
  {
    poolId: uuid("pool_id").defaultRandom().primaryKey(),
    contributorKeyHash: text("contributor_key_hash"),
    cycleLengths: integer("cycle_lengths").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Partial, not a plain UNIQUE: ON CONFLICT must repeat this WHERE to match it.
  (table) => [
    uniqueIndex("research_contributions_contributor_key_hash_idx")
      .on(table.contributorKeyHash)
      .where(sql`${table.contributorKeyHash} IS NOT NULL`),
  ],
);

export const authChallenges = pgTable(
  "auth_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pubkeyHash: text("pubkey_hash").notNull(),
    nonce: text("nonce").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("auth_challenges_hash_idx").on(table.pubkeyHash)],
);

export const recoveryAttempts = pgTable(
  "recovery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailLookup: text("email_lookup").notNull(),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("recovery_attempts_lookup_created_idx").on(table.emailLookup, table.createdAt),
  ],
);

export const learnArticles = pgTable(
  "learn_articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique("learn_articles_slug_key"),
    category: text("category").notNull(),
    reviewedAt: text("reviewed_at").notNull(),
    status: text("status").notNull(),
    sources: jsonb("sources").notNull(),
    copyEs: jsonb("copy_es").notNull(),
    copyEn: jsonb("copy_en").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("learn_articles_status_check", sql`${table.status} IN ('draft', 'published')`)],
);

export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bucket: text("bucket").notNull(),
    keyHash: text("key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("rate_limit_hits_bucket_key_created_idx").on(table.bucket, table.keyHash, table.createdAt),
    index("rate_limit_hits_created_idx").on(table.createdAt),
  ],
);

// Sealed on the device; the host stores the blob only (drizzle/0008_friends.sql).
export const friendBooks = pgTable(
  "friend_books",
  {
    accountId: uuid("account_id")
      .primaryKey()
      .references(() => accounts.id, { onDelete: "cascade" }),
    ciphertext: text("ciphertext").notNull(),
    nonce: text("nonce").notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("friend_books_ciphertext_check", sql`length(${table.ciphertext}) <= 43712`)],
);

// No account column and no write time, on purpose: see drizzle/0008_friends.sql.
export const friendBoxes = pgTable(
  "friend_boxes",
  {
    boxHash: text("box_hash").primaryKey(),
    writeHash: text("write_hash").notNull(),
    ciphertext: text("ciphertext").notNull(),
    nonce: text("nonce").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    check("friend_boxes_ciphertext_check", sql`length(${table.ciphertext}) = 2752`),
    check("friend_boxes_nonce_check", sql`length(${table.nonce}) = 16`),
    index("friend_boxes_expires_idx").on(table.expiresAt),
  ],
);

export const recoveryTokens = pgTable("recovery_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailLookup: text("email_lookup").notNull(),
  tokenHash: text("token_hash").notNull().unique("recovery_tokens_token_hash_key"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Feedback from Settings (0009). Anonymous: no account, no pubkey, no IP.
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    kind: text("kind").notNull(),
    body: text("body").notNull(),
    contactEmail: text("contact_email"),
    platform: text("platform").notNull(),
    appVersion: text("app_version"),
    locale: text("locale"),
  },
  (table) => [
    check("feedback_kind_check", sql`${table.kind} IN ('problem', 'idea', 'other')`),
    check("feedback_body_check", sql`char_length(${table.body}) BETWEEN 1 AND 2000`),
    check("feedback_contact_email_check", sql`${table.contactEmail} IS NULL OR char_length(${table.contactEmail}) <= 254`),
    check("feedback_platform_check", sql`${table.platform} IN ('web', 'android')`),
    check("feedback_app_version_check", sql`${table.appVersion} IS NULL OR char_length(${table.appVersion}) <= 40`),
    check("feedback_locale_check", sql`${table.locale} IS NULL OR char_length(${table.locale}) <= 16`),
    index("feedback_created_idx").on(table.createdAt),
  ],
);
