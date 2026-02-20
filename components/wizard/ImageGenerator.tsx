/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $prompt } from "@/store/prompt";
import { $pageStep } from "@/store/step";
import { wizardActions } from "@/store/wizardStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import ImageModal from "@/components/ImageModal";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";

const isDev = process.env.NODE_ENV === "development";

interface StartGenerationResponse {
  predictionId: string;
  status: string;
}

interface StatusGenerationResponse {
  status: string;
  urls?: string[];
  error?: string | null;
}

interface StartGenerationParams {
  prompt: string;
  signal: AbortSignal;
}

interface PollGenerationParams {
  prompt: string;
  predictionId: string;
  signal: AbortSignal;
}

async function startGenerationApi({
  prompt,
  signal,
}: StartGenerationParams): Promise<StartGenerationResponse> {
  const res = await fetch("/api/replicate", {
    body: JSON.stringify({ prompt }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
    throw new Error(errorData.error || `Generierung fehlgeschlagen: ${res.status}`);
  }

  return res.json();
}

async function pollGenerationApi({
  prompt,
  predictionId,
  signal,
}: PollGenerationParams): Promise<StatusGenerationResponse> {
  const res = await fetch("/api/replicate/status", {
    body: JSON.stringify({ prompt, predictionId }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
    throw new Error(errorData.error || `Statusabfrage fehlgeschlagen: ${res.status}`);
  }

  return res.json();
}

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const prompt = useStore($prompt);
  const t = useTranslations('imageGenerator');
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);

  // Ref to prevent duplicate starts for identical prompt strings.
  const hasTriggered = useRef<string | null>(null);

  const {
    mutate: startGeneration,
    isPending: isStarting,
    isError: isStartError,
    error: startError,
    reset: resetMutation,
  } = useMutation<StartGenerationResponse, Error, string>({
    mutationFn: async (p) => {
      if (isDev) console.log("[ImageGenerator] Starting generation...");
      const controller = new AbortController();
      const data = await startGenerationApi({
        prompt: p,
        signal: controller.signal,
      });
      if (isDev) console.log("[ImageGenerator] Prediction started:", data);
      return data;
    },
    onSuccess: (data) => {
      setPredictionId(data.predictionId);
    },
    retry: 1,
    retryDelay: 3000,
  });

  const {
    data: statusData,
    error: statusError,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useQuery<StatusGenerationResponse, Error>({
    queryKey: ["replicate-status", predictionId, prompt],
    enabled: Boolean(predictionId && prompt),
    queryFn: ({ signal }) =>
      pollGenerationApi({
        prompt: prompt!,
        predictionId: predictionId!,
        signal,
      }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 3000;
      return status === "starting" || status === "processing" ? 3000 : false;
    },
    retry: 1,
  });

  useEffect(() => {
    if (!statusData) return;
    if (statusData.status !== "succeeded") return;
    if (!Array.isArray(statusData.urls) || statusData.urls.length === 0) return;

    setGeneratedImages(statusData.urls);
    setSelectedImage(statusData.urls[0]);
    setPredictionId(null);
    // Clear the prompt to avoid accidental regeneration on remount.
    $prompt.set(null);
  }, [statusData]);

  const handleRetry = useCallback(() => {
    resetMutation();
    setPredictionId(null);

    if (!prompt) return;
    hasTriggered.current = prompt;
    startGeneration(prompt);
  }, [prompt, resetMutation, startGeneration]);

  useEffect(() => {
    if (statusData?.status === "failed" || statusData?.status === "canceled") {
      setPredictionId(null);
    }
  }, [statusData]);

  useEffect(() => {
    if (prompt && hasTriggered.current !== prompt) {
      hasTriggered.current = prompt;
      if (isDev) console.log("[ImageGenerator] Triggering generation");
      startGeneration(prompt);
    }
  }, [prompt, startGeneration]);

  // When the image modal is closed after generation, reset and go to my-images
  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
    // Reset the entire app state
    $prompt.set(null);
    $pageStep.set("intro");
    wizardActions.reset();
    // Navigate to my-images gallery
    router.push("/my-images");
  }, [router]);

  const hasImages = Array.isArray(generatedImages) && generatedImages.length > 0;
  const status = statusData?.status;
  const isTerminalFailure = status === "failed" || status === "canceled";
  const isPending =
    !hasImages &&
    (isStarting ||
      (!!predictionId && (status === undefined || status === "starting" || status === "processing")));
  const errorMessage =
    isTerminalFailure
      ? statusData?.error || t("error.unknown")
      : startError?.message || statusError?.message || t("error.unknown");
  const isError = !hasImages && (isStartError || isStatusError || isTerminalFailure);

  if (isDev) {
    console.log("[ImageGenerator] State:", {
      isPending,
      isError,
      hasImages,
      predictionId,
      status,
    });
  }

  return (
    <div className="w-full mx-autoflex flex-col justify-center items-center">
      {onBack && hasImages && !isPending && <BackButton onClick={onBack} backLabel={t('backToWizard')} />}

      <AnimatePresence mode="wait">
        {isPending && !hasImages && <LoadingState key="loading" />}

        {!isPending && isError && !hasImages && (
          <ErrorState
            key="error"
            message={errorMessage}
            onRetry={() => {
              if (predictionId && prompt) {
                void refetchStatus();
                return;
              }
              handleRetry();
            }}
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
            onClose={handleModalClose}
            prompt={prompt ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick, backLabel }: { onClick: () => void; backLabel: string }) {
  return (
    <Button
      onClick={onClick}
      className="mb-10 px-4 py-2 rounded-full bg-accent text-foreground text-xs hover:bg-accent/80 transition-all"
    >
      ⇦ {backLabel}
    </Button>
  );
}

function LoadingState() {
  const t = useTranslations('imageGenerator.loading');
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
    if (elapsed < 15) return t('messages.generating');
    if (elapsed < 30) return t('messages.aiWorking');
    if (elapsed < 60) return t('messages.takingLonger');
    if (elapsed < 90) return t('messages.serverWakingUp');
    if (elapsed < 120) return t('messages.extraLove');
    if (elapsed < 180) return t('messages.goodThingsTakeTime');
    if (elapsed < 240) return t('messages.modelRestarting');
    if (elapsed < 300) return t('messages.inQueue');
    if (elapsed < 420) return t('messages.almostThere');
    return t('messages.neverGiveUp');
  };

  const getSubMessage = () => {
    if (elapsed < 30) return t('subMessages.usually30s');
    if (elapsed < 60) return t('subMessages.highLoad');
    if (elapsed < 120) return t('subMessages.warmingUp');
    if (elapsed < 180) return t('subMessages.coldStart');
    if (elapsed < 300) return t('subMessages.queued');
    if (elapsed < 420) return t('subMessages.maxWait');
    return t('subMessages.unusualWait');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[45rem]">
      <motion.div
        key="loading"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="flex flex-col items-center justify-center w-full max-w-3xl min-h-[600px] bg-card/95 border border-border shadow-2xl rounded-2xl p-8"
      >
        <div className="flex items-center justify-center w-48 h-48 mb-4">
          <DotLottieReact
            src="/UI/LoadingImageAnimation.lottie"
            loop
            autoplay
          />
        </div>

        {/* Timer */}
        <div className="mb-3 px-4 py-1.5 rounded-full bg-muted/60 border border-border">
          <span className="text-sm font-mono text-muted-foreground">⏱️ {formatTime(elapsed)}</span>
        </div>

        {/* Main message - animated on change */}
        <motion.span
          key={getMessage()}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-lg text-foreground font-medium text-center"
        >
          {getMessage()}
        </motion.span>

        {/* Sub message */}
        <motion.div
          key={getSubMessage()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mt-2 text-center max-w-md"
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
          <div className="h-1 bg-muted rounded-full overflow-hidden">
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
  const t = useTranslations('imageGenerator.error');
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center p-8 bg-card/95 border border-border shadow-2xl rounded-2xl"
    >
      <div className="text-4xl mb-4">😕</div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t('title')}
      </h3>
      <p className="text-destructive text-center text-sm mb-6 max-w-md">
        {message}
      </p>
      <Button
        onClick={onRetry}
        className="px-6 py-3 text-sm font-medium shadow-lg rounded-full bg-brand-primary-2 hover:bg-red-600"
      >
        🔄 {t('retry')}
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
  const t = useTranslations('imageGenerator');
  return (
    <Link
      href="/my-images"
      className="mt-6 inline-block px-6 py-3 bg-brand-primary-2 text-white rounded-full font-semibold shadow hover:bg-red-600 transition hover:scale-105"
    >
      📁 {t('goToMyImages')}
    </Link>
  );
}
