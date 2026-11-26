// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

import { notFound } from "next/navigation";

import { TemperaturePlaygroundClient } from "./temperature-playground-client";

export const metadata = {
  title: "Temperature · playground",
  robots: { index: false, follow: false },
};

/** The temperature row and card in every state, for checking by hand. 404 in production. */
export default function DevTemperaturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TemperaturePlaygroundClient />;
}
