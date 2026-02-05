import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/Footer";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { NAVBAR_QUERY, FOOTER_QUERY } from "@/sanity/lib/queries";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const { isEnabled } = await draftMode();
  const { data: navbar } = await sanityFetch({
    query: NAVBAR_QUERY,
    params: { locale }
  });
  const { data: footer } = await sanityFetch({
    query: FOOTER_QUERY,
    params: { locale }
  });

  // Provide messages for client components
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        {navbar && <Navbar {...navbar} currentLocale={locale} />}
        {children}
        {footer && <Footer data={footer} currentLocale={locale} />}
      </Providers>

      <SanityLive />

      {isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </NextIntlClientProvider>
  );
}
