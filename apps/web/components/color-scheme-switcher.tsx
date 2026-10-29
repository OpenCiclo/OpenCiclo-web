// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useCiclo } from "@/lib/client/ciclo-context";
import type { ColorScheme } from "@/lib/client/color-scheme";

/** Light, dark or system: three small round buttons, as in the landing header. */
export function ColorSchemeSwitcher() {
  const { colorScheme, setColorScheme, t } = useCiclo();
  const schemes: { id: ColorScheme; label: string; icon: typeof Sun }[] = [
    { id: "light", label: t.colorSchemeLight, icon: Sun },
    { id: "dark", label: t.colorSchemeDark, icon: Moon },
    { id: "system", label: t.colorSchemeSystem, icon: Monitor },
  ];
  return (
    <div className="flex items-center rounded-full border border-border p-0.5" role="group" aria-label={t.colorScheme}>
      {schemes.map((scheme) => {
        const Icon = scheme.icon;
        const selected = colorScheme === scheme.id;
        return (
          <button
            key={scheme.id}
            type="button"
            aria-label={scheme.label}
            aria-pressed={selected}
            onClick={() => setColorScheme(scheme.id)}
            className={
              selected
                ? "inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                : "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
