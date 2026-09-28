import "server-only";
import type { Locale } from "@/i18n/config";
import { loadDevContent } from "./loader";
import { loadLocaleFromSanity, loadPageFromSanity } from "./fromSanity";
import type { LocaleContent, PageContent } from "./types";

export type { LocaleContent, PageContent } from "./types";

/**
 * DEV_CONTENT=true serves the demo content from content/content.md instead of
 * Sanity. The CMS stays wired; flipping the flag back needs no code change.
 */
export function isDevContent(): boolean {
  const raw = (process.env.DEV_CONTENT ?? "").trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "on" || raw === "yes";
}

const STUDIO_LABEL: Record<Locale, string> = {
  de: "Küche visualisieren",
  en: "Visualise your kitchen",
};

export async function getSiteContent(locale: Locale): Promise<LocaleContent> {
  if (isDevContent()) {
    const content = await loadDevContent();
    return content[locale];
  }
  return loadLocaleFromSanity(locale, STUDIO_LABEL[locale]);
}

export async function getPageContent(locale: Locale, slug: string): Promise<PageContent | null> {
  if (isDevContent()) {
    const content = await loadDevContent();
    return content[locale].pages[slug] ?? null;
  }
  return loadPageFromSanity(locale, slug);
}
