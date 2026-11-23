// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// Feedback from Settings: what the form, the API and the console share.
// The SQL (drizzle/0009_feedback.sql) holds the same kinds and limit.

export const FEEDBACK_KINDS = ["problem", "idea", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** Characters of text, after trimming. */
export const FEEDBACK_MAX_LENGTH = 2000;

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return typeof value === "string" && (FEEDBACK_KINDS as readonly string[]).includes(value);
}
