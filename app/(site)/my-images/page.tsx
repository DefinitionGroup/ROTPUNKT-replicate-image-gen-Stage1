import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ImagesGalleryClient from "@/components/ImagesGalleryClient";

export default async function MyImagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/my-images");
  }
  const supabase = createSupabaseServerClient();
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error.message);
    return (
      <main className="max-w-5xl mx-auto px-6 pt-30 pb-10">
        <h1 className="text-2xl font-bold mb-6 text-white">Meine Bilder</h1>
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 text-red-400">
          Fehler beim Laden deiner Bilder.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 pt-30 pb-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Meine Bilder</h1>
      {!images || images.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 text-gray-300">
          Du hast noch keine Bilder. Erstelle dein erstes Bild im Wizard!
        </div>
      ) : (
        <ImagesGalleryClient images={images as any} />
      )}
    </main>
  );
}
