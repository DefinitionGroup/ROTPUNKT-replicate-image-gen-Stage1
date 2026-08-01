/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $prompt } from "@/store/prompt";
import { wizardStore } from "@/store/wizardStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import ImageModal from "@/components/ImageModal";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star } from "lucide-react";
import { buildPrompt } from "./promptBuilder";
import { PromptDebugPopover } from "./PromptDebugPopover";
import {
  $promptPipelineV2Enabled,
  loadRuntimeConfig,
} from "@/store/runtimeConfig";
import type {
  GenerationCandidate,
  GenerationSetContext,
  GenerationQualityExpectations,
  PromptVersion,
} from "@/lib/imageGenerationContract";

const isDev = process.env.NODE_ENV === "development";

interface StartGenerationResponse {
  generationSet: GenerationSetContext;
  qualityExpectations: GenerationQualityExpectations | null;
}

interface StatusGenerationResponse {
  status: string;
  candidates?: GenerationCandidate[];
  generationSetId: string;
  selectedImageId?: string | null;
  qualityExpectations?: GenerationQualityExpectations | null;
  error?: string | null;
}

interface StartGenerationParams {
  prompt: string;
  promptVersion: PromptVersion;
  qualityExpectations: GenerationQualityExpectations;
  signal: AbortSignal;
}

interface PollGenerationParams {
  generationSetId: string;
  signal: AbortSignal;
}

interface SelectBestResponse {
  generationSetId: string;
  selectedImageId: string;
  selectedAt: string;
}

async function startGenerationApi({
  prompt,
  promptVersion,
  qualityExpectations,
  signal,
}: StartGenerationParams): Promise<StartGenerationResponse> {
  const res = await fetch("/api/replicate", {
    body: JSON.stringify({
      prompt,
      promptVersion,
      qualityExpectations,
    }),
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
  generationSetId,
  signal,
}: PollGenerationParams): Promise<StatusGenerationResponse> {
  const res = await fetch("/api/replicate/status", {
    body: JSON.stringify({ generationSetId }),
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

async function selectBestImageApi({
  generationSetId,
  imageId,
}: {
  generationSetId: string;
  imageId: string;
}): Promise<SelectBestResponse> {
  const res = await fetch("/api/generation-sets/select-best", {
    body: JSON.stringify({ generationSetId, imageId }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: `Server error: ${res.status}` }));
    throw new Error(errorData.error || "Auswahl konnte nicht gespeichert werden");
  }
  return res.json();
}

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const prompt = useStore($prompt);
  const wizardState = useStore(wizardStore);
  const promptPipelineV2Enabled = useStore($promptPipelineV2Enabled);
  const t = useTranslations('imageGenerator');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [completedPrompt, setCompletedPrompt] = useState<string | null>(null);
  const [generatedCandidates, setGeneratedCandidates] = useState<
    GenerationCandidate[] | null
  >(null);
  const [generationSetId, setGenerationSetId] = useState<string | null>(null);
  const [selectedBestImageId, setSelectedBestImageId] = useState<string | null>(
    null
  );
  const promptDebugEnv = (process.env.NEXT_PUBLIC_WIZARD_PROMPT_DEBUG ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  const showPromptDebugPopover =
    isDev &&
    (promptDebugEnv === "true" ||
      promptDebugEnv === "1" ||
      promptDebugEnv === "yes" ||
      promptDebugEnv === "on");

  const summaryData = useMemo(
    () =>
      buildPrompt({
        selections: wizardState.selectedOptions,
        extraWishes: wizardState.extraWishes,
        pipelineV2Enabled: promptPipelineV2Enabled,
      }),
    [wizardState.selectedOptions, wizardState.extraWishes, promptPipelineV2Enabled]
  );

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
        promptVersion: summaryData.promptVersion,
        qualityExpectations: summaryData.qualityExpectations,
        signal: controller.signal,
      });
      if (isDev) console.log("[ImageGenerator] Prediction started:", data);
      return data;
    },
    onSuccess: (data) => {
      setGenerationSetId(data.generationSet.generationSetId);
    },
    // Starting a set is not retried automatically: a lost response must not
    // create and charge a second three-prediction comparison.
    retry: 0,
  });

  const {
    data: statusData,
    error: statusError,
    isError: isStatusError,
  } = useQuery<StatusGenerationResponse, Error>({
    queryKey: ["replicate-status", generationSetId],
    enabled: Boolean(generationSetId && prompt),
    queryFn: ({ signal }) =>
      pollGenerationApi({
        generationSetId: generationSetId!,
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
    if (!Array.isArray(statusData.candidates) || statusData.candidates.length !== 3) return;

    setGeneratedCandidates(statusData.candidates);
    setSelectedBestImageId(statusData.selectedImageId ?? null);
    setCompletedPrompt(prompt);
    // Clear the prompt to avoid accidental regeneration on remount.
    $prompt.set(null);
  }, [prompt, statusData]);

  const {
    mutate: selectBestImage,
    isPending: isSavingBest,
    isError: isBestSelectionError,
  } = useMutation<
    SelectBestResponse,
    Error,
    { generationSetId: string; imageId: string }
  >({
    mutationFn: selectBestImageApi,
    onSuccess: (data) => {
      setSelectedBestImageId(data.selectedImageId);
      setGeneratedCandidates((current) =>
        current?.map((candidate) => ({
          ...candidate,
          isSelectedBest: candidate.imageId === data.selectedImageId,
        })) ?? null
      );
    },
  });

  const handleRetry = useCallback(() => {
    resetMutation();
    setGenerationSetId(null);
    setGeneratedCandidates(null);
    setSelectedBestImageId(null);

    if (!prompt) return;
    hasTriggered.current = prompt;
    startGeneration(prompt);
  }, [prompt, resetMutation, startGeneration]);

  useEffect(() => {
    void loadRuntimeConfig();
  }, []);

  useEffect(() => {
    if (prompt && hasTriggered.current !== prompt) {
      hasTriggered.current = prompt;
      if (isDev) console.log("[ImageGenerator] Triggering generation");
      startGeneration(prompt);
    }
  }, [prompt, startGeneration]);

  const hasImages =
    Array.isArray(generatedCandidates) && generatedCandidates.length > 0;
  const status = statusData?.status;
  const isTerminalFailure =
    status === "failed" || status === "partial_failed";
  const isPending =
    !hasImages &&
    (isStarting ||
      (!!generationSetId &&
        (status === undefined || status === "starting" || status === "processing")));
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
      generationSetId,
      status,
    });
  }

  return (
    <div className="w-full mx-autoflex flex-col justify-center items-center">
      <PromptDebugPopover
        enabled={showPromptDebugPopover}
        stepLabel="image generation"
        missingKeys={summaryData.missingKeys}
        sections={summaryData.modelSections}
        prompt={summaryData.modelPrompt || prompt || "Prompt is currently empty."}
      />

      {onBack && hasImages && !isPending && <BackButton onClick={onBack} backLabel={t('backToWizard')} />}

      <AnimatePresence mode="wait">
        {isPending && !hasImages && <LoadingState key="loading" />}

        {!isPending && isError && !hasImages && (
          <ErrorState
            key="error"
            message={errorMessage}
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
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {t("comparison.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("comparison.description")}
              </p>
            </div>
            <ImagesGrid
              candidates={generatedCandidates!}
              selectedBestImageId={selectedBestImageId}
              isSavingBest={isSavingBest}
              onImageClick={setSelectedImage}
              onSelectBest={(candidate) =>
                selectBestImage({
                  generationSetId: candidate.generationSetId,
                  imageId: candidate.imageId,
                })
              }
            />
            {selectedBestImageId && (
              <p className="mt-5 text-center text-sm text-emerald-500">
                {t("comparison.saved")}
              </p>
            )}
            {isBestSelectionError && (
              <p className="mt-5 text-center text-sm text-destructive">
                {t("comparison.saveError")}
              </p>
            )}
            {selectedBestImageId && <QuickLink />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
            prompt={completedPrompt ?? undefined}
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
  candidates = [],
  selectedBestImageId,
  isSavingBest,
  onImageClick,
  onSelectBest,
}: {
  candidates?: GenerationCandidate[];
  selectedBestImageId: string | null;
  isSavingBest: boolean;
  onImageClick: (src: string) => void;
  onSelectBest: (candidate: GenerationCandidate) => void;
}) {
  const t = useTranslations("imageGenerator.comparison");

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
      {candidates.map((candidate) => {
        const isBest = selectedBestImageId === candidate.imageId;
        return (
          <div
            key={candidate.imageId}
            className={`relative overflow-hidden rounded-xl border bg-card transition ${
              isBest
                ? "border-emerald-400 ring-2 ring-emerald-400/40"
                : "border-border"
            }`}
          >
            <img
              src={candidate.url}
              alt={t("variantAlt", { number: candidate.index + 1 })}
              crossOrigin="anonymous"
              className="w-full cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => onImageClick(candidate.url)}
            />
            <div className="flex items-center justify-between gap-3 p-3">
              <span className="text-xs text-muted-foreground">
                {t("variant", { number: candidate.index + 1 })}
              </span>
              <button
                type="button"
                aria-pressed={isBest}
                aria-label={
                  isBest
                    ? t("selectedAria", { number: candidate.index + 1 })
                    : t("selectAria", { number: candidate.index + 1 })
                }
                disabled={isSavingBest}
                onClick={() => onSelectBest(candidate)}
                className={`inline-flex size-10 items-center justify-center rounded-full border transition disabled:cursor-wait disabled:opacity-60 ${
                  isBest
                    ? "border-emerald-400 bg-emerald-400 text-black"
                    : "border-border bg-background/80 text-muted-foreground hover:border-emerald-400 hover:text-emerald-400"
                }`}
              >
                <Star
                  className="size-5"
                  fill={isBest ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>
        );
      })}
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
