import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
export default async function MyImagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/my-images");
  }

  const supabase = createSupabaseServerClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <Link
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-gray-800 bg-gray-950 hover:border-red-500 transition"
            >
              <Image
                src={img.url}
                alt="Generated"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                unoptimized
              />
              <div className="px-4 py-3 text-xs text-gray-400">
                {new Date(img.created_at).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
