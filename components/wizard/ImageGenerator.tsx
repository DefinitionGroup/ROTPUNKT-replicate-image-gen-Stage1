/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
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
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasTriggered = useRef<string | null>(null);

  const {
    mutate: generateImage,
    isError,
    error,
    reset: resetMutation,
  } = useMutation<ApiResponse, Error, string>({
    mutationFn: async (p) => {
      console.log("[ImageGenerator] Starting fetch...");
      setIsGenerating(true);
      // 10 minute timeout for extreme cold starts + queue time
      // Replicate can queue for 2-3 min + generate for 30-60s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("[ImageGenerator] ⏰ Request timeout after 10 minutes");
        controller.abort();
      }, 600_000);

      try {
        const res = await fetch("/api/replicate", {
          body: JSON.stringify({ prompt: p }),
          method: "POST",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[ImageGenerator] Response not OK:", res.status, errorText);
          throw new Error(`Generation failed: ${res.status}`);
        }
        const data = await res.json();
        console.log("[ImageGenerator] Received data:", data);
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        // Provide better error messages
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.error("[ImageGenerator] Request aborted (timeout)");
            throw new Error("Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.");
          }
        }
        console.error("[ImageGenerator] Fetch error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("[ImageGenerator] ✅ onSuccess called with:", data);
      if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages(data);
        setSelectedImage(data[0]);
      }
      setIsGenerating(false);
    },
    onError: (err) => {
      console.error("[ImageGenerator] ❌ onError called:", err);
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    // Guard: only trigger once per unique prompt
    if (prompt && hasTriggered.current !== prompt) {
      hasTriggered.current = prompt;
      console.log("[ImageGenerator] Triggering generation for prompt");
      generateImage(prompt);
    }
  }, [prompt, generateImage]);

  const hasImages = Array.isArray(generatedImages) && generatedImages.length > 0;

  console.log("[ImageGenerator] Render state:", { isGenerating, isError, hasImages, generatedImages, selectedImage });

  return (
    <div className="w-full mx-auto h-full flex flex-col justify-center items-center">
      {onBack && hasImages && !isGenerating && <BackButton onClick={onBack} />}

      <AnimatePresence mode="wait">
        {isGenerating && !hasImages && <LoadingState key="loading" />}

        {!isGenerating && isError && !hasImages && (
          <ErrorState
            key="error"
            message={error?.message || "Unbekannter Fehler"}
            onRetry={() => {
              resetMutation();
              hasTriggered.current = null;
              if (prompt) {
                generateImage(prompt);
              }
            }}
          />
        )}

        {!isGenerating && hasImages && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <ImagesGrid images={generatedImages!} onImageClick={setSelectedImage} />
            <QuickLink />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
            prompt={prompt ?? undefined}
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
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  const getMessage = () => {
    if (elapsed < 15) return "Ich generiere gerade dein Bild...";
    if (elapsed < 30) return "Die KI arbeitet an deinem Design...";
    if (elapsed < 60) return "Das dauert heute etwas länger – bitte hab noch einen Moment Geduld...";
    if (elapsed < 90) return "Die Server wachen gerade erst auf ☕ – fast geschafft!";
    if (elapsed < 120) return "Dein Bild wird mit extra viel Liebe generiert... 💫";
    if (elapsed < 180) return "Noch ein kleines bisschen – gute Dinge brauchen Zeit! 🎨";
    if (elapsed < 240) return "Das KI-Modell startet gerade neu – danke für deine Geduld! 🚀";
    if (elapsed < 300) return "Dein Bild ist in der Warteschlange – gleich geht's los! ⏳";
    return "Fast da – dein Design wird finalisiert! ✨";
  };

  const getSubMessage = () => {
    if (elapsed < 30) return "Die Bilder werden in aller Regel innerhalb von 30\u00A0s generiert.";
    if (elapsed < 60) return "Bei hoher Auslastung kann es bis zu 1-2 Minuten dauern.";
    if (elapsed < 120) return "Manchmal muss das KI-Modell erst aufgewärmt werden.";
    if (elapsed < 180) return "Ein Kaltstart kann bis zu 3 Minuten dauern – aber es lohnt sich!";
    if (elapsed < 300) return "Bei hoher Nachfrage wird dein Bild in die Warteschlange gestellt.";
    return "Maximale Wartezeit: ca. 5 Minuten. Dein Bild kommt garantiert!";
  };

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

        {/* Timer */}
        <div className="mb-3 px-4 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
          <span className="text-sm font-mono text-gray-300">⏱️ {formatTime(elapsed)}</span>
        </div>

        {/* Main message - animated on change */}
        <motion.span
          key={getMessage()}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-lg text-brand-secondary-1 font-medium text-center"
        >
          {getMessage()}
        </motion.span>

        {/* Sub message */}
        <motion.div
          key={getSubMessage()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-400 mt-2 text-center max-w-md"
        >
          {getSubMessage()}
        </motion.div>

        {/* Progress bar for visual feedback */}
        {elapsed >= 30 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mt-6 w-full max-w-xs"
          >
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary-2 to-red-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 120, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-black/90 via-gray-900 to-gray-950 border border-gray-800 shadow-2xl rounded-2xl"
    >
      <div className="text-4xl mb-4">😕</div>
      <p className="text-red-400 text-center text-base mb-6 max-w-md">
        {message}
      </p>
      <Button
        onClick={onRetry}
        className="px-6 py-3 text-sm font-medium shadow-lg rounded-full bg-brand-primary-2 hover:bg-red-600"
      >
        🔄 Erneut versuchen
      </Button>
    </motion.div>
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
      📁 Zu &quot;Meine Bilder&quot;
    </motion.a>
  );
}
