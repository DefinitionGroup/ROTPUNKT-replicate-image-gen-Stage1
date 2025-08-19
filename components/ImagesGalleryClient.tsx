"use client";
import { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

type Img = { id: string; url: string; created_at: string };
export default function ImagesGalleryClient({ images }: { images: Img[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelected(img.url)}
            className="group block text-left rounded-xl overflow-hidden border border-gray-800 bg-gray-950 hover:border-red-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Image
              src={img.url}
              alt="Generated"
              width={800}
              height={800}
              className="w-full h-auto object-cover"
            />
            <div className="px-4 py-3 text-xs text-gray-400 group-hover:text-gray-200 transition">
              {new Date(img.created_at).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <ImageModal src={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
