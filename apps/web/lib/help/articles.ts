// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { FRIENDS_AVAILABLE, PREGNANCY_AVAILABLE } from "@/lib/features";

export const HELP_SECTIONS = [
  { id: "product", title: "The app" },
  { id: "hosting", title: "Run and host" },
  { id: "privacy", title: "Privacy and accounts" },
] as const;

export type HelpSectionId = (typeof HELP_SECTIONS)[number]["id"];

export type HelpArticleMeta = {
  slug: string;
  title: string;
  summary: string;
  section: HelpSectionId;
};

export const HELP_ARTICLES: HelpArticleMeta[] = [
  {
    slug: "what-ciclo-is",
    title: "What Ciclo is (and is not)",
    summary: "A logging and forecasting app. Not a medical device, not contraception, not a way for the host to read your diary.",
    section: "product",
  },
  {
    slug: "how-the-forecast-works",
    title: "How the forecast works",
    summary: "A probability over upcoming days, mixed with a published typical length. Ovulation is not predicted.",
    section: "product",
  },
  {
    slug: "calendar-phases-estimated",
    title: "Calendar phases and “estimated”",
    summary: "What Follicular · estimated means, and how that differs from the next-period forecast.",
    section: "product",
  },
  // Only once Friends is available (lib/features.ts): until then /help/friends is a 404 and content/help/friends.md waits.
  ...(FRIENDS_AVAILABLE
    ? [
        {
          slug: "friends",
          title: "Friends: sharing your phase",
          summary: "What close friends see on your card, how invites work, and what Ciclo's server can and cannot see.",
          section: "product" as const,
        },
      ]
    : []),
  // Only once pregnancy mode is available: until then /help/pregnancy is a 404 and content/help/pregnancy.md waits.
  ...(PREGNANCY_AVAILABLE
    ? [
        {
          slug: "pregnancy",
          title: "Pregnancy mode",
          summary: "How Ciclo dates a pregnancy, what friends see, and what happens when it ends.",
          section: "product" as const,
        },
      ]
    : []),
  {
    slug: "temperature",
    title: "Temperature",
    summary: "Log a day's temperature and see each cycle as a chart. Ciclo draws it; it does not read it.",
    section: "product",
  },
  {
    slug: "inner-seasons",
    title: "Inner seasons",
    summary: "The season badge on the cycle card, and the full-screen guide behind it.",
    section: "product",
  },
  {
    slug: "host-on-vercel",
    title: "Host on Vercel",
    summary: "Root directory apps/web, Neon Postgres, Resend DNS, the env vars you actually need.",
    section: "hosting",
  },
  {
    slug: "run-it-yourself",
    title: "Run it yourself",
    summary: "Local Next.js for UI work, Docker Compose for app + Postgres on this machine.",
    section: "hosting",
  },
  {
    slug: "how-data-is-stored",
    title: "How data is stored",
    summary: "Encrypted in the browser, ciphertext in Postgres, no password reset by design.",
    section: "privacy",
  },
  {
    slug: "email-vs-phrase",
    title: "Email vs 12-word accounts",
    summary: "Two ways to hold the same kind of device secret. Email cannot decrypt the diary alone.",
    section: "privacy",
  },
  {
    slug: "android-on-device",
    title: "Android: keep the diary on the phone",
    summary: "No account, no server. Encrypted on the phone, phrase in Android Keystore, optional fingerprint lock.",
    section: "privacy",
  },
  {
    slug: "research-pool",
    title: "Optional anonymous research pool",
    summary: "Cycle lengths only, no account map. Off until you opt in. Not a backup.",
    section: "privacy",
  },
];

export function findHelpArticle(slug: string): HelpArticleMeta | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

export function helpArticlesInSection(section: HelpSectionId): HelpArticleMeta[] {
  return HELP_ARTICLES.filter((article) => article.section === section);
}
