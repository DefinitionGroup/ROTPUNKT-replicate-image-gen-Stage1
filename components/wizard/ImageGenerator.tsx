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

const isDev = process.env.NODE_ENV === "development";

type ApiResponse = string[];

interface GenerationParams {
  prompt: string;
  signal: AbortSignal;
}

async function generateImageApi({ prompt, signal }: GenerationParams): Promise<ApiResponse> {
  const res = await fetch("/api/replicate", {
    body: JSON.stringify({ prompt }),
    method: "POST",
    signal,
  });

  if (!res.ok) {
    // Try to extract error message from response
    const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
    throw new Error(errorData.error || `Generierung fehlgeschlagen: ${res.status}`);
  }

  return res.json();
}

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const prompt = useStore($prompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);

  // Refs for cleanup and double-call prevention
  const hasTriggered = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    mutate: generateImage,
    isPending,
    isError,
    error,
    reset: resetMutation,
  } = useMutation<ApiResponse, Error, string>({
    mutationFn: async (p) => {
      if (isDev) console.log("[ImageGenerator] Starting generation...");

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const data = await generateImageApi({
          prompt: p,
          signal: abortControllerRef.current.signal,
        });

        if (isDev) console.log("[ImageGenerator] Received data:", data);
        return data;
      } catch (err) {
        // Provide user-friendly error messages
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            if (isDev) console.log("[ImageGenerator] Request aborted");
            throw new Error("Die Anfrage wurde abgebrochen.");
          }
        }
        if (isDev) console.error("[ImageGenerator] Error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (isDev) console.log("[ImageGenerator] ✅ Success:", data);
      if (Array.isArray(data) && data.length > 0) {
        setGeneratedImages(data);
        setSelectedImage(data[0]);
      }
    },
    onError: (err) => {
      if (isDev) console.error("[ImageGenerator] ❌ Error:", err);
    },
    // Retry configuration for transient failures
    retry: 1,
    retryDelay: 3000,
  });

  // Stable retry handler
  const handleRetry = useCallback(() => {
    resetMutation();
    hasTriggered.current = null;
    if (prompt) {
      generateImage(prompt);
    }
  }, [resetMutation, prompt, generateImage]);

  // Trigger generation on prompt change
  useEffect(() => {
    if (prompt && hasTriggered.current !== prompt) {
      hasTriggered.current = prompt;
      if (isDev) console.log("[ImageGenerator] Triggering generation");
      generateImage(prompt);
    }
  }, [prompt, generateImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasImages = Array.isArray(generatedImages) && generatedImages.length > 0;

  if (isDev) {
    console.log("[ImageGenerator] State:", { isPending, isError, hasImages });
  }

  return (
    <div className="w-full mx-autoflex flex-col justify-center items-center">
      {onBack && hasImages && !isPending && <BackButton onClick={onBack} />}

      <AnimatePresence mode="wait">
        {isPending && !hasImages && <LoadingState key="loading" />}

        {!isPending && isError && !hasImages && (
          <ErrorState
            key="error"
            message={error?.message || "Ein unbekannter Fehler ist aufgetreten."}
            onRetry={handleRetry}
          />
        )}

        {!isPending && hasImages && (
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
    if (elapsed < 420) return "Fast da – dein Design wird finalisiert! ✨";
    return "Noch einen kleinen Moment – wir geben nicht auf! 💪";
  };

  const getSubMessage = () => {
    if (elapsed < 30) return "Die Bilder werden in aller Regel innerhalb von 30\u00A0s generiert.";
    if (elapsed < 60) return "Bei hoher Auslastung kann es bis zu 1-2 Minuten dauern.";
    if (elapsed < 120) return "Manchmal muss das KI-Modell erst aufgewärmt werden.";
    if (elapsed < 180) return "Ein Kaltstart kann bis zu 3 Minuten dauern – aber es lohnt sich!";
    if (elapsed < 300) return "Bei hoher Nachfrage wird dein Bild in die Warteschlange gestellt.";
    if (elapsed < 420) return "Maximale Wartezeit: ca. 5-7 Minuten. Dein Bild kommt garantiert!";
    return "Ungewöhnlich lange Wartezeit – bitte nicht die Seite verlassen!";
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
        <div className="flex items-center justify-center w-48 h-48 mb-4">
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
                transition={{ duration: 300, ease: "linear" }}
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
      <h3 className="text-lg font-medium text-brand-secondary-1 mb-2">
        Etwas ist schiefgelaufen
      </h3>
      <p className="text-red-400 text-center text-sm mb-6 max-w-md">
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
            className="rounded-xl shadow-2xl w-full cursor-pointer hover:scale-[1.02] transition-transform"
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
