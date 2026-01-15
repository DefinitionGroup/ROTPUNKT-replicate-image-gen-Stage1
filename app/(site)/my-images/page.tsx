import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ImagesGalleryClient from "@/components/ImagesGalleryClient";

export default async function MyImagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/my-images");
  }

  return (
    <main className="max-w-5xl mx-auto px-6 pt-30 pb-10">
      <h1 className="text-2xl font-bold mb-6 text-brand-secondary-1">
        Meine Bilder
      </h1>
      <ImagesGalleryClient />
    </main>
  );
}
