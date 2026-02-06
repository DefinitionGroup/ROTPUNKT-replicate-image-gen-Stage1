import { auth } from "@clerk/nextjs/server";
import { redirect } from "@/i18n/routing";
import ImagesGalleryClient from "@/components/ImagesGalleryClient";
import { setRequestLocale, getTranslations } from 'next-intl/server';

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

  const t = await getTranslations('imageGallery');

  return (
    <main className="max-w-5xl mx-auto px-6 pt-30 pb-10">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        {t('title')}
      </h1>
      <ImagesGalleryClient />
    </main>
  );
}
