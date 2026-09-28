import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { VisualEditing } from "next-sanity/visual-editing";
import Providers from "@/components/Providers";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import type { Locale } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { isDevContent } from "@/lib/content";
import { SanityLive } from "@/sanity/lib/live";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("title"), description: t("description") };
}

/**
 * Providers only. The two surfaces below choose their own frame:
 * `(marketing)` wraps pages in the site header and footer,
 * `(app)` puts the studio, gallery and review on the black stage.
 */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const devContent = isDevContent();
  const { isEnabled } = await draftMode();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>{children}</Providers>

      {!devContent && <SanityLive />}
      {!devContent && isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </NextIntlClientProvider>
  );
}
