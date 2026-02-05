import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import NotFound from "@/components/ui/not-found";
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

import { TranslationSetter } from "@/components/TranslationSetter";

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug, locale }
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
      {page?.content ? <PageBuilder content={page.content} /> : <NotFound />}
    </main>
  );
}
