import { getTranslations, setRequestLocale } from "next-intl/server";
import { Closing } from "@/components/sections/closing";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Manifest } from "@/components/sections/manifest";
import { Promises } from "@/components/sections/promises";
import { StudioTeaser } from "@/components/sections/studio-teaser";
import { TranslationSetter } from "@/components/TranslationSetter";
import type { Locale } from "@/i18n/config";
import { getSiteContent } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [content, t] = await Promise.all([getSiteContent(locale as Locale), getTranslations("common")]);
  const { home } = content;

  return (
    <main>
      <TranslationSetter translations={{}} />
      <Hero hero={home.hero} />
      {home.manifest && <Manifest manifest={home.manifest} />}
      {home.promises && <Promises closeLabel={t("close")} promises={home.promises} />}
      {home.gallery && <Gallery gallery={home.gallery} />}
      {home.studio && <StudioTeaser closeLabel={t("close")} studio={home.studio} />}
      {home.closing && <Closing closing={home.closing} />}
    </main>
  );
}
