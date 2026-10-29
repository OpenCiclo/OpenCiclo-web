// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { LearnIndex } from "@/components/learn/learn-index";
import { LEARN_ARTICLES } from "@/lib/learn/content";

/**
 * The Learn tab as a ghost (see TabGhosts), with the articles shipped in
 * code. On the web the real page also merges operator edits, which a ghost
 * on the client cannot load; the real page replaces it when the drag lands.
 */
export default function LearnGhost() {
  return <LearnIndex articles={LEARN_ARTICLES} />;
}
