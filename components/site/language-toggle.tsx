"use client";

import { useLocale } from "next-intl";
import { useStore } from "@nanostores/react";
import { $translations } from "@/store/translations";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, type Locale } from "@/i18n/config";

/** DE / EN as two quiet text buttons; the active one is white. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const translations = useStore($translations);

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    const translatedSlug = translations[next];
    router.replace(translatedSlug ? `/${translatedSlug}` : pathname, { locale: next });
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="group" aria-label="Sprache">
      {locales.map((entry, index) => (
        <span className="inline-flex items-center" key={entry}>
          {index > 0 && <span aria-hidden="true" className="mx-1 h-3 w-px bg-hairline" />}
          <button
            aria-current={entry === locale ? "true" : undefined}
            aria-label={localeNames[entry]}
            className={`inline-flex min-h-11 items-center px-1 font-label text-label uppercase tracking-label transition-colors duration-state ease-signature ${
              entry === locale ? "text-ink" : "text-graphite hover:text-ink"
            }`}
            onClick={() => switchLocale(entry)}
            type="button"
          >
            {entry}
          </button>
        </span>
      ))}
    </div>
  );
}
