"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-200 hover:text-brand-secondary-1 hover:bg-gray-800/50"
          aria-label={t('label')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeFlags[locale]} {localeNames[locale]}</span>
          <span className="sm:hidden">{localeFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gray-950/95 border-gray-800 backdrop-blur-sm"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`cursor-pointer gap-2 ${loc === locale
                ? 'bg-brand-primary-2/20 text-brand-secondary-1'
                : 'text-gray-300 hover:text-brand-secondary-1'
              }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
