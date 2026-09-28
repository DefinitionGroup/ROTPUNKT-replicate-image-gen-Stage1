import { auth } from "@clerk/nextjs/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Emphasis } from "@/components/design-system/emphasis";
import { Label } from "@/components/design-system/label";
import ImagesGalleryClient from "@/components/ImagesGalleryClient";
import { redirect } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MyImagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) {
    redirect({ href: "/sign-in?redirect_url=/my-images", locale });
  }

  const t = await getTranslations("imageGallery");

  return (
    <main className="signature-container min-h-screen pb-24 pt-28 md:pt-36">
      <header className="max-w-2xl">
        <Label>{t("title")}</Label>
        <h1 className="mt-4 text-heading-lg text-ink">
          <Emphasis text={t("headline")} />
        </h1>
        <p className="mt-4 text-lead text-graphite">{t("lead")}</p>
      </header>
      <div className="mt-12 md:mt-16">
        <ImagesGalleryClient />
      </div>
    </main>
  );
}
