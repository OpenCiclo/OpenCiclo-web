// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { notFound } from "next/navigation";

import { PregnancyPlaygroundClient } from "./pregnancy-playground-client";

export const metadata = {
  title: "Pregnancy · playground",
  robots: { index: false, follow: false },
};

/** Every pregnancy state, for checking by hand (PLAN 4, phase 3a). 404 in production. */
export default function DevPregnancyPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PregnancyPlaygroundClient />;
}
