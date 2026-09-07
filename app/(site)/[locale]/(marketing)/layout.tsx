import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import type { Locale } from "@/i18n/config";
import { getSiteContent } from "@/lib/content";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** The marketing frame: frosted header over the page, footer below. */
export default async function MarketingLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getSiteContent(locale as Locale);

  return (
    <>
      <SiteHeader cta={content.nav.cta} items={content.nav.items} />
      {children}
      <SiteFooter footer={content.footer} />
    </>
  );
}
