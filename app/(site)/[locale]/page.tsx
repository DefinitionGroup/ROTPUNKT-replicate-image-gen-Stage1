import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

import { TranslationSetter } from "@/components/TranslationSetter";

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { locale },
  });

  const translations = page?.translations?.reduce((acc: Record<string, string>, curr: any) => {
    if (curr?.language && curr?.slug) {
      acc[curr.language] = curr.slug;
    }
    return acc;
  }, {});
  
  return (
    <main className="pt-20 md:pt-24 lg:pt-28 min-h-screen">
      <TranslationSetter translations={translations || {}} />
      {page?.content ? <PageBuilder content={page.content} /> : null}
    </main>
  );
}
