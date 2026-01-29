"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface UpscaleModalProps {
  src: string;
  prompt?: string;
  onClose: () => void;
}

type ApiResponse = string[];

export default function UpscaleModal({ src, prompt, onClose }: UpscaleModalProps) {
  const t = useTranslations('upscale');
  const tCommon = useTranslations('common');
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const hasTriggered = useRef(false);

  const {
    mutate: upscaleImage,
    isPending: isUpscaling,
    isError,
    error,
  } = useMutation<ApiResponse, Error, { imageUrl: string; prompt?: string }>({
    mutationFn: async ({ imageUrl, prompt }) => {
      console.log("[UpscaleModal] Starting upscale...");
      // 5 minute timeout for extreme cold starts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300_000);

      try {
        const res = await fetch("/api/replicate/upscale", {
          body: JSON.stringify({ imageUrl, prompt }),
          method: "POST",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[UpscaleModal] Response not OK:", res.status, errorText);
          throw new Error(`Upscale failed: ${res.status}`);
        }
        const data = await res.json();
        console.log("[UpscaleModal] Received data:", data);
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("[UpscaleModal] Fetch error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[UpscaleModal] ✅ onSuccess called with:", data);
      if (Array.isArray(data) && data.length > 0) {
        setUpscaledImage(data[0]);
      }
    },
    onError: (err) => {
      console.error("[UpscaleModal] ❌ onError called:", err);
    },
  });

  // Auto-trigger upscale on mount (with guard to prevent double execution)
  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    upscaleImage({ imageUrl: src, prompt });
  }, [src, prompt, upscaleImage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative rounded-2xl p-6 max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800/60 bg-gradient-to-br from-black/95 via-gray-900/95 to-gray-950/95"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <motion.button
          type="button"
          aria-label={tCommon('close')}
          className="absolute top-3 right-3 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 hover:bg-brand-primary-2 border border-white/20 text-brand-secondary-1 shadow-md backdrop-blur-sm transition-colors leading-none"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
        >
          <span className="text-lg">×</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {isUpscaling && !upscaledImage && (
            <UpscaleLoadingState key="loading" />
          )}

          {!isUpscaling && isError && !upscaledImage && (
            <ErrorState
              key="error"
              message={`${t('error.title')}: ${error?.message || t('error.unknown')}`}
              onRetry={() => upscaleImage({ imageUrl: src, prompt })}
              onClose={onClose}
            />
          )}

          {upscaledImage && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center"
            >
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold text-brand-secondary-1">
                  ✨ {t('success.title')}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {t('success.description')}
                </p>
              </div>

              <Image
                src={upscaledImage}
                width={1200}
                height={800}
                alt="Upscaled high-res image"
                unoptimized
                className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
              />

              <div className="mt-4 flex justify-center gap-3">
                <Button
                  asChild
                  className="px-6 py-3 text-xs font-medium shadow-lg rounded-full bg-brand-primary-2"
                >
                  <Link
                    href={upscaledImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`high-res-image-${Date.now()}.png`}
                  >
                    📥 {t('download')}
                  </Link>
                </Button>
                <Button
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-medium shadow-lg rounded-full"
                  variant="secondary"
                >
                  {tCommon('close')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function UpscaleLoadingState() {
  const t = useTranslations('upscale.loading');
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
    if (elapsed < 10) return t('messages.starting');
    if (elapsed < 30) return t('messages.improving');
    if (elapsed < 60) return t('messages.details');
    if (elapsed < 90) return t('messages.almostDone');
    if (elapsed < 120) return t('messages.fullPower');
    return t('messages.perfection');
  };

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="flex flex-col items-center justify-center w-full min-w-[400px] min-h-[400px] p-8"
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

      {/* Badge */}
      <div className="mb-3 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
        <span className="text-xs text-purple-300">🔬 2x Upscaling</span>
      </div>

      {/* Main message */}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-gray-400 mt-2 text-center max-w-md"
      >
        {t('subMessage')}
      </motion.div>

      {/* Progress bar */}
      {elapsed >= 15 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mt-6 w-full max-w-xs"
        >
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 90, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
  onClose,
}: {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('upscale.error');
  const tCommon = useTranslations('common');
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center min-w-[400px] min-h-[300px] p-8"
    >
      <div className="text-4xl mb-4">😕</div>
      <p className="text-red-400 text-center text-base mb-6">{message}</p>
      <div className="flex gap-3">
        <Button
          onClick={onRetry}
          className="px-6 py-3 text-xs font-medium shadow-lg rounded-full bg-brand-primary-2"
        >
          {t('retry')}
        </Button>
        <Button
          onClick={onClose}
          className="px-6 py-3 text-xs font-medium shadow-lg rounded-full"
          variant="secondary"
        >
          {tCommon('close')}
        </Button>
      </div>
    </motion.div>
  );
}
