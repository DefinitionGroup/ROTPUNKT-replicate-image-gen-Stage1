/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $prompt } from "@/store/prompt";
import { useQuery } from "@tanstack/react-query";

type ApiResponse = string[];

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const prompt = useStore($prompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    data: images,
    isError,
    isLoading,
  } = useQuery<ApiResponse>({
    queryKey: ["/api/replicate", prompt],
    queryFn: () =>
      fetch("/api/replicate", {
        body: JSON.stringify({ prompt }),
        method: "POST",
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (images?.length) setSelectedImage(images[0]);
  }, [images]);
  const hasImages = Array.isArray(images) && images.length > 0;
  return (
    <div className="w-full mx-auto h-full flex flex-col justify-center items-center">
      {onBack && images && !isLoading && <BackButton onClick={onBack} />}

      <AnimatePresence>{isLoading && <LoadingState />}</AnimatePresence>

      <AnimatePresence>
        {isError && (
          <ErrorState message="Fehler beim Erstellen des Bildes. Bitte erneut versuchen." />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && hasImages && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ImagesGrid images={images!} onImageClick={setSelectedImage} />
            <QuickLink />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-10 px-4 py-2 rounded-full bg-gray-800 text-white text-xs hover:bg-red-500 transition-all"
    >
      ⇦ Zurück zum Küchen-Wizard
    </button>
  );
}

function LoadingState() {
  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[45rem]">
      <motion.div
        key="loading"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="flex flex-col items-center justify-center w-full max-w-3xl min-h-[600px] bg-gradient-to-br from-black/90 via-gray-900 to-gray-950 border border-gray-800 shadow-2xl rounded-2xl p-8"
      >
        <div className="flex items-center justify-center w-48 h-48 mb-4 ">
          <DotLottieReact
            src="/UI/LoadingImageAnimation.lottie"
            loop
            autoplay
          />
        </div>
        <span className="mt-2 text-lg text-white font-medium text-center">
          Ich generiere gerade dein Bild...
        </span>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Die Bilder werden in aller Regel innerhalb von 30&nbsp;s generiert.
        </div>
      </motion.div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <motion.p
      key="error"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-red-400 text-center text-base my-4"
    >
      {message}
    </motion.p>
  );
}

function ImagesGrid({
  images = [],
  onImageClick,
}: {
  images?: string[];
  onImageClick: (src: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {images.map((img) => (
        <div key={img} className="flex items-center justify-center">
          <img
            src={img}
            alt="Generated image"
            crossOrigin="anonymous"
            className="rounded-xl shadow-2xl w-full cursor-pointer"
            onClick={() => onImageClick(img)}
          />
        </div>
      ))}
    </div>
  );
}

function QuickLink() {
  return (
    <motion.a
      href="/my-images"
      className="mt-6 inline-block px-6 py-3 bg-red-500 text-white rounded-full font-semibold shadow hover:bg-red-600 transition"
      whileHover={{ scale: 1.05 }}
    >
      📁 Zu "Meine Bilder"
    </motion.a>
  );
}

function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          className="absolute top-2 right-2 z-10 p-2 bg-gray-700/10 hover:bg-gray-600/20 cursor-pointer rounded-full text-white backdrop-blur-sm transition-colors"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
        >
          ✕
        </motion.button>

        <motion.img
          src={src}
          alt="Generated image - full size"
          className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
        />

        <div className="mt-4 flex gap-3">
          <motion.button
            className="px-6 py-3 bg-gray-900 hover:bg-blue-700 text-gray-500 hover:text-white rounded-full text-xs font-medium shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigator.clipboard.writeText(src)}
          >
            Copy Link
          </motion.button>
          <motion.a
            href={src}
            target="_blank"
            download={`generated-image-${Date.now()}.png`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
