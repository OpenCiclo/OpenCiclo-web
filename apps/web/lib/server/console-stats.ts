// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { and, count, gt, gte, lt, ne, notInArray, sql, type SQL } from "drizzle-orm";

import { LEARN_ARTICLES } from "@/lib/learn/content";
import { mergeLearnCatalog } from "@/lib/learn/catalog";
import { loadDbLearnEntries } from "@/lib/learn/load";
import { accountActivityDays, accounts, recoveryMailboxes, researchContributions } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { consoleAdminAccountIds } from "@/lib/server/account-activity";

export type ConsoleDayCount = {
  day: string;
  count: number;
};

export type ConsoleStats = {
  accountsTotal: number;
  accountsNew7d: number;
  accountsNew30d: number;
  signupsToday: number;
  signupsYesterday: number;
  accountsByDay: ConsoleDayCount[];
  activeToday: number;
  active7d: number;
  active30d: number;
  activeByDay: ConsoleDayCount[];
  emailAccounts: number;
  phraseOnlyAccounts: number;
  hostedDiaries: number;
  diariesSaved7d: number;
  diariesSaved30d: number;
  researchRows: number;
  researchNew30d: number;
  learnPublishedDb: number;
  learnDraftsDb: number;
  learnPublic: number;
};

type Db = ReturnType<typeof getDb>;

/** Days in the console's two charts (sign-ups and opens per day). */
const CHART_DAYS = 28;

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBefore(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function fillDayCounts(rows: { day: string; count: number }[], spanDays: number, now: Date): ConsoleDayCount[] {
  const byDay = new Map(rows.map((row) => [row.day, row.count]));
  const result: ConsoleDayCount[] = [];
  for (let offset = spanDays - 1; offset >= 0; offset -= 1) {
    const day = utcDay(daysBefore(now, offset));
    result.push({ day, count: byDay.get(day) ?? 0 });
  }
  return result;
}

function startOfUtcDay(now: Date, offsetDays = 0): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offsetDays));
}

/** Rows matching `condition`, counted inside one aggregate query (Postgres FILTER). */
function countWhere(condition: SQL | undefined): SQL<number> {
  return sql<number>`(count(*) filter (where ${condition ?? sql`true`}))::int`;
}

const toNumber = (value: unknown): number => Number(value ?? 0);

async function loadActivity(
  db: Db,
  spanDays: number,
  now: Date,
  knownAdminIds: string[] | undefined,
): Promise<{
  activeToday: number;
  active7d: number;
  active30d: number;
  activeByDay: ConsoleDayCount[];
}> {
  const empty = {
    activeToday: 0,
    active7d: 0,
    active30d: 0,
    activeByDay: fillDayCounts([], spanDays, now),
  };
  try {
    const adminIds = knownAdminIds ?? (await consoleAdminAccountIds());
    const excludeAdmins =
      adminIds.length > 0 ? notInArray(accountActivityDays.accountId, adminIds) : undefined;
    const today = utcDay(now);
    const day7 = utcDay(daysBefore(now, 6));
    const day30 = utcDay(daysBefore(now, 29));
    const chartStart = utcDay(daysBefore(now, spanDays - 1));
    // One row per account per UTC day, so today's rows are today's distinct accounts.
    const [totals, byDay] = await Promise.all([
      db
        .select({
          today: countWhere(gte(accountActivityDays.day, today)),
          week: sql<number>`(count(distinct ${accountActivityDays.accountId}) filter (where ${gte(accountActivityDays.day, day7)}))::int`,
          month: sql<number>`count(distinct ${accountActivityDays.accountId})::int`,
        })
        .from(accountActivityDays)
        .where(and(gte(accountActivityDays.day, day30), excludeAdmins)),
      db
        .select({
          day: accountActivityDays.day,
          count: sql<number>`count(*)::int`,
        })
        .from(accountActivityDays)
        .where(and(gte(accountActivityDays.day, chartStart), excludeAdmins))
        .groupBy(accountActivityDays.day),
    ]);
    return {
      activeToday: toNumber(totals[0]?.today),
      active7d: toNumber(totals[0]?.week),
      active30d: toNumber(totals[0]?.month),
      activeByDay: fillDayCounts(
        byDay.map((row) => ({ day: String(row.day), count: Number(row.count) })),
        spanDays,
        now,
      ),
    };
  } catch {
    return empty;
  }
}

/**
 * Counts for the operator console. Each table is read with a few aggregate
 * queries (counts and per-day groups computed by Postgres), never by loading
 * its rows. Row counts and dates only: see agents.txt "Operator console".
 */
export async function loadConsoleStats(
  options: { db?: Db; now?: Date; adminIds?: string[] } = {},
): Promise<ConsoleStats> {
  const db = options.db ?? getDb();
  const now = options.now ?? new Date();
  const since7 = daysBefore(now, 7);
  const since30 = daysBefore(now, 30);
  const chartSince = daysBefore(now, CHART_DAYS - 1);
  const todayStart = startOfUtcDay(now, 0);
  const yesterdayStart = startOfUtcDay(now, 1);
  const hosted = ne(accounts.ciphertext, "");
  const signupDay = sql<string>`to_char(${accounts.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

  const [accountRows, signupsByDay, emailRows, researchRows, dbLearn, activity] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        new7: countWhere(gt(accounts.createdAt, since7)),
        new30: countWhere(gt(accounts.createdAt, since30)),
        today: countWhere(gte(accounts.createdAt, todayStart)),
        yesterday: countWhere(and(gte(accounts.createdAt, yesterdayStart), lt(accounts.createdAt, todayStart))),
        hosted: countWhere(hosted),
        saved7: countWhere(and(hosted, gt(accounts.updatedAt, since7))),
        saved30: countWhere(and(hosted, gt(accounts.updatedAt, since30))),
      })
      .from(accounts),
    db
      .select({ day: signupDay, count: sql<number>`count(*)::int` })
      .from(accounts)
      .where(gt(accounts.createdAt, chartSince))
      .groupBy(signupDay),
    db.select({ n: count() }).from(recoveryMailboxes),
    db
      .select({
        total: sql<number>`count(*)::int`,
        new30: countWhere(gt(researchContributions.createdAt, since30)),
      })
      .from(researchContributions),
    loadDbLearnEntries(),
    loadActivity(db, CHART_DAYS, now, options.adminIds),
  ]);

  const totals = accountRows[0];
  const accountsTotal = toNumber(totals?.total);
  const emailAccounts = toNumber(emailRows[0]?.n);
  const learnPublishedDb = dbLearn.filter((row) => row.status === "published").length;
  const learnDraftsDb = dbLearn.filter((row) => row.status === "draft").length;

  return {
    accountsTotal,
    accountsNew7d: toNumber(totals?.new7),
    accountsNew30d: toNumber(totals?.new30),
    signupsToday: toNumber(totals?.today),
    signupsYesterday: toNumber(totals?.yesterday),
    accountsByDay: fillDayCounts(
      signupsByDay.map((row) => ({ day: String(row.day), count: Number(row.count) })),
      CHART_DAYS,
      now,
    ),
    activeToday: activity.activeToday,
    active7d: activity.active7d,
    active30d: activity.active30d,
    activeByDay: activity.activeByDay,
    emailAccounts,
    phraseOnlyAccounts: Math.max(0, accountsTotal - emailAccounts),
    hostedDiaries: toNumber(totals?.hosted),
    diariesSaved7d: toNumber(totals?.saved7),
    diariesSaved30d: toNumber(totals?.saved30),
    researchRows: toNumber(researchRows[0]?.total),
    researchNew30d: toNumber(researchRows[0]?.new30),
    learnPublishedDb,
    learnDraftsDb,
    learnPublic: mergeLearnCatalog(LEARN_ARTICLES, dbLearn).length,
  };
}
