/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $prompt } from "@/store/prompt";
import { useMutation } from "@tanstack/react-query";
import ImageModal from "@/components/ImageModal";

type ApiResponse = string[];

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const prompt = useStore($prompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const hasTriggered = useRef<string | null>(null);

  const {
    mutate: generateImage,
    data: images,
    isError,
    isPending: isLoading,
  } = useMutation<ApiResponse, Error, string>({
    mutationFn: (p) =>
      fetch("/api/replicate", {
        body: JSON.stringify({ prompt: p }),
        method: "POST",
      }).then((res) => res.json()),
  });

  useEffect(() => {
    // Guard: only trigger once per unique prompt
    if (prompt && hasTriggered.current !== prompt) {
      hasTriggered.current = prompt;
      console.log("[ImageGenerator] Triggering generation for prompt");
      generateImage(prompt);
    }
  }, [prompt, generateImage]);

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
    <Button
      onClick={onClick}
      className="mb-10 px-4 py-2 rounded-full bg-gray-800 text-brand-secondary-1 text-xs hover:bg-brand-primary-2 transition-all"
    >
      ⇦ Zurück zum Küchen-Wizard
    </Button>
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
        <span className="mt-2 text-lg text-brand-secondary-1 font-medium text-center">
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
      className="mt-6 inline-block px-6 py-3 bg-brand-primary-2 text-brand-secondary-1 rounded-full font-semibold shadow hover:bg-red-600 transition"
      whileHover={{ scale: 1.05 }}
    >
      📁 Zu "Meine Bilder"
    </motion.a>
  );
}
