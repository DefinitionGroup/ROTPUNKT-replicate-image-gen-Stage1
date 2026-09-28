import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppHeader } from "@/components/site/app-header";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** The application frame: a solid header, no footer, the page is the stage. */
export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <>
      <AppHeader action={{ href: "/", label: t("toHomepage") }} />
      {children}
    </>
  );
}
