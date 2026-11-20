// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

// The landing's links, in their own file so the locale files (lib/locales/<tag>.ts)
// can use them without pulling in the Spanish and English landing copy.
export const MARKETING_LINKS = {
  app: "/app",
  learn: "/learn",
  docs: "/help",
  privacy: "/privacy",
  contact: "/contact",
  github: "https://github.com/OpenCiclo/OpenCiclo-web",
  issues: "https://github.com/OpenCiclo/OpenCiclo-web/issues",
} as const;
