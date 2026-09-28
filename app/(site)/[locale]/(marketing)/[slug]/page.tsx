import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutCards } from "@/components/sections/about-cards";
import { AboutHero } from "@/components/sections/about-hero";
import { LegalPage } from "@/components/sections/legal-page";
import { TranslationSetter } from "@/components/TranslationSetter";
import NotFound from "@/components/ui/not-found";
import type { Locale } from "@/i18n/config";
import { getPageContent } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [page, t] = await Promise.all([getPageContent(locale as Locale, slug), getTranslations("common")]);

  if (!page) {
    return (
      <main className="min-h-screen pt-24">
        <NotFound />
      </main>
    );
  }

  const translations = Object.fromEntries(
    Object.entries(page.translations ?? {}).filter(([, value]) => Boolean(value))
  ) as Record<string, string>;

  return (
    <main className="min-h-screen">
      <TranslationSetter translations={translations} />
      {page.kind === "legal" ? (
        <LegalPage page={page} />
      ) : (
        <>
          {page.hero && <AboutHero hero={page.hero} />}
          {page.cards && page.cards.length > 0 && (
            <AboutCards cards={page.cards} closeLabel={t("close")} headline={page.headline} />
          )}
        </>
      )}
    </main>
  );
}
