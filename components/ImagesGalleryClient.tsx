"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

type Img = {
  id: string;
  url: string;
  created_at: string;
  imageprompt?: string;
  is_upscaled?: boolean;
};

export default function ImagesGalleryClient({ images }: { images: Img[] }) {
  const [selected, setSelected] = useState<Img | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelected(img)}
            className="group relative block text-left rounded-xl overflow-hidden border border-gray-800 bg-gray-950 hover:border-brand-primary-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2"
          >
            {img.is_upscaled && (
              <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-[10px] font-medium text-white">
                ✨ High-Res
              </div>
            )}
            <Image
              src={img.url}
              alt="Generated"
              width={800}
              height={800}
              className="w-full h-auto object-cover"
            />
            <div
              className="px-4 py-3 text-xs text-gray-400 group-hover:text-gray-200 transition"
              suppressHydrationWarning
            >
              {new Date(img.created_at).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <ImageModal
          src={selected.url}
          onClose={() => setSelected(null)}
          prompt={selected.imageprompt}
        />
      )}
    </>
  );
}
