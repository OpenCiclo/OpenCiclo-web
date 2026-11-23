// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { ConsoleFeedbackList, type ConsoleFeedbackItem } from "@/components/console/console-feedback-list";
import { ConsoleForbidden } from "@/components/console/console-forbidden";
import { getDb } from "@/lib/db";
import { isFeedbackKind } from "@/lib/feedback";
import { requireConsolePage } from "@/lib/server/console";
import { FEEDBACK_PAGE_SIZE, listFeedback } from "@/lib/server/feedback";
import { describeError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

/** Feedback from Settings, newest first, 50 at a time; `?kind=` filters, `?before=` pages. */
export default async function ConsoleFeedbackPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await requireConsolePage("/console/feedback");
  if (!access.ok) return <ConsoleForbidden />;
  const params = await searchParams;
  const kindParam = one(params.kind);
  const kind = isFeedbackKind(kindParam) ? kindParam : null;
  const beforeParam = one(params.before);
  const beforeDate = beforeParam ? new Date(beforeParam) : null;
  const before = beforeDate && !Number.isNaN(beforeDate.getTime()) ? beforeDate : null;

  let items: ConsoleFeedbackItem[] | null;
  try {
    const rows = await listFeedback(getDb(), { kind, before, limit: FEEDBACK_PAGE_SIZE });
    items = rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  } catch (error) {
    // Most likely 0009 is not applied yet: the page says so instead of failing.
    console.error(`CONSOLE_FEEDBACK_FAILED ${describeError(error)}`);
    items = null;
  }
  return (
    <ConsoleFeedbackList
      items={items}
      kind={kind}
      paged={before !== null}
      hasMore={items !== null && items.length === FEEDBACK_PAGE_SIZE}
    />
  );
}
