// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { LearnIndex } from "@/components/learn/learn-index";
import { LEARN_SUMMARIES } from "@/lib/learn/shipped-index";

/**
 * The Learn tab as a ghost (see TabGhosts), listing the articles shipped in
 * code from their summaries (a ghost never opens one, so it never loads a
 * body). On the web the real page also merges operator edits, which a ghost
 * on the client cannot load; the real page replaces it when the drag lands.
 */
export default function LearnGhost() {
  return <LearnIndex articles={LEARN_SUMMARIES} />;
}
