// Copyright © 2026 Emma Flora Harbison & Luis Rey Sánchez
// SPDX-License-Identifier: Apache-2.0

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Settings } from "lucide-react";

import { hidesAppChrome } from "@/lib/client/app-chrome";
import { useCiclo } from "@/lib/client/ciclo-context";
import { otherLocale, type Messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { ColorSchemeSwitcher } from "@/components/color-scheme-switcher";

// On the desktop, Calendar holds Patterns too (see CycleDashboard), and the
// notes list opens from there.
const NAV: { href: string; label: keyof Messages; icon: typeof CalendarDays; paths: string[] }[] = [
  { href: "/app", label: "calendar", icon: CalendarDays, paths: ["/app", "/patterns", "/diary"] },
  { href: "/learn", label: "learn", icon: BookOpen, paths: ["/learn"] },
  { href: "/settings", label: "settings", icon: Settings, paths: ["/settings"] },
];

function isActive(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * The desktop web layout's navigation, in place of the phone tab bar: the
 * landing's sticky header, with the tabs as a pill group whose selection is
 * the tab bar's rose bubble. CSS shows it only in the `desktop` layout.
 */
export function DesktopHeader() {
  const { t, locale, setLocale, wallet } = useCiclo();
  const pathname = usePathname();
  if (hidesAppChrome(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 hidden h-16 border-b border-border/70 bg-background/85 backdrop-blur-md desktop:block">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-8">
        <Link href={wallet ? "/app" : "/"} className="flex items-center gap-2 justify-self-start">
          <BrandMark />
          <span className="font-serif text-xl tracking-tight">{t.appName}</span>
        </Link>
        {wallet ? (
          <nav aria-label={t.appName} className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.paths);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {String(t[item.label])}
                </Link>
              );
            })}
          </nav>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 justify-self-end">
          <ColorSchemeSwitcher />
          <button
            type="button"
            onClick={() => setLocale(otherLocale(locale))}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>
      </div>
    </header>
  );
}
