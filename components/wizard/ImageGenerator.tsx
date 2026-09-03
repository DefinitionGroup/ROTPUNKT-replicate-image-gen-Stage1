"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $generationSpec } from "@/store/prompt";
import { useMutation, useQuery } from "@tanstack/react-query";
import ImageModal from "@/components/ImageModal";
import AiGeneratedLabel from "@/components/AiGeneratedLabel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PromptDebugPopover } from "./PromptDebugPopover";
import {
  DEFAULT_GENERATION_SEED,
  LORA_GENERATION_SCALE,
  MAX_GENERATION_SEED,
} from "@/lib/imageGenerationContract";
import { loadRuntimeConfig } from "@/store/runtimeConfig";
import type {
  GenerationCandidate,
  GenerationRequestSpec,
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
  phase?: "generating" | "validating";
  qualityFailure?: boolean;
  candidates?: GenerationCandidate[];
  generationSetId: string;
  selectedImageId?: string | null;
  qualityExpectations?: GenerationQualityExpectations | null;
  error?: string | null;
}

interface StartGenerationParams {
  prompt: string;
  seed: number;
  promptVersion: PromptVersion;
  qualityExpectations: GenerationQualityExpectations;
  previousGenerationSetId?: string | null;
  signal: AbortSignal;
}

interface PollGenerationParams {
  generationSetId: string;
  signal: AbortSignal;
}

interface StartGenerationMutationParams {
  spec: GenerationRequestSpec;
  seed: number;
  // A retry continues the server-side seed sequence of this set.
  previousGenerationSetId?: string | null;
}

async function startGenerationApi({
  prompt,
  seed,
  promptVersion,
  qualityExpectations,
  previousGenerationSetId,
  signal,
}: StartGenerationParams): Promise<StartGenerationResponse> {
  const res = await fetch("/api/replicate", {
    body: JSON.stringify({
      prompt,
      seed,
      promptVersion,
      qualityExpectations,
      previousGenerationSetId: previousGenerationSetId ?? undefined,
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

export default function ImageGenerator({ onBack }: { onBack?: () => void }) {
  const spec = useStore($generationSpec);
  const t = useTranslations('imageGenerator');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [completedSpec, setCompletedSpec] = useState<GenerationRequestSpec | null>(
    null
  );
  const [generatedImage, setGeneratedImage] = useState<GenerationCandidate | null>(
    null
  );
  const [generationSetId, setGenerationSetId] = useState<string | null>(null);
  const [generationSeed, setGenerationSeed] = useState<number>(
    DEFAULT_GENERATION_SEED
  );
  const [lastGenerationSeed, setLastGenerationSeed] = useState<number | null>(
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

  // Ref to prevent duplicate starts for identical prompt strings.
  const hasTriggered = useRef<string | null>(null);

  const {
    mutate: startGeneration,
    isPending: isStarting,
    isError: isStartError,
    error: startError,
    reset: resetMutation,
  } = useMutation<
    StartGenerationResponse,
    Error,
    StartGenerationMutationParams
  >({
    mutationFn: async ({ spec: generationSpec, seed, previousGenerationSetId }) => {
      if (isDev) console.log("[ImageGenerator] Starting generation...");
      const controller = new AbortController();
      const data = await startGenerationApi({
        prompt: generationSpec.prompt,
        seed,
        promptVersion: generationSpec.promptVersion,
        qualityExpectations: generationSpec.qualityExpectations,
        previousGenerationSetId,
        signal: controller.signal,
      });
      if (isDev) console.log("[ImageGenerator] Prediction started:", data);
      return data;
    },
    onSuccess: (data) => {
      setGenerationSetId(data.generationSet.generationSetId);
      setGenerationSeed(data.generationSet.seed);
      setLastGenerationSeed(data.generationSet.seed);
    },
    // Starting a set is not retried automatically: a lost response must not
    // create and charge a second prediction.
    retry: 0,
  });

  const {
    data: statusData,
    error: statusError,
    isError: isStatusError,
  } = useQuery<StatusGenerationResponse, Error>({
    queryKey: ["replicate-status", generationSetId],
    enabled: Boolean(generationSetId && (spec || completedSpec)),
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
    if (!Array.isArray(statusData.candidates) || statusData.candidates.length === 0) return;

    // Enforce mode delivers validated candidates first.
    const strongestCandidate =
      statusData.candidates.find(
        (candidate) => candidate.quality.status === "accepted"
      ) ??
      statusData.candidates.find(
        (candidate) => candidate.loraScale === LORA_GENERATION_SCALE
      ) ??
      statusData.candidates[0];
    setGeneratedImage(strongestCandidate);
    setCompletedSpec((current) => spec ?? current);
    // Clear the spec to avoid accidental regeneration on remount.
    $generationSpec.set(null);
  }, [spec, statusData]);

  const handleRetry = useCallback(() => {
    const previousGenerationSetId = generationSetId;
    resetMutation();
    setGenerationSetId(null);
    setGeneratedImage(null);

    if (!spec) return;
    hasTriggered.current = spec.prompt;
    startGeneration({ spec, seed: generationSeed, previousGenerationSetId });
  }, [generationSeed, generationSetId, spec, resetMutation, startGeneration]);

  const handleDevRegenerate = useCallback(() => {
    const specToRegenerate = completedSpec ?? spec;
    if (!specToRegenerate) return;

    resetMutation();
    setGenerationSetId(null);
    setGeneratedImage(null);
    hasTriggered.current = specToRegenerate.prompt;
    startGeneration({ spec: specToRegenerate, seed: generationSeed });
  }, [completedSpec, generationSeed, spec, resetMutation, startGeneration]);

  useEffect(() => {
    void loadRuntimeConfig();
  }, []);

  useEffect(() => {
    if (spec && hasTriggered.current !== spec.prompt) {
      hasTriggered.current = spec.prompt;
      if (isDev) console.log("[ImageGenerator] Triggering generation");
      startGeneration({ spec, seed: generationSeed });
    }
  }, [generationSeed, spec, startGeneration]);

  const debugSpec = spec ?? completedSpec;
  const hasImage = Boolean(generatedImage);
  const status = statusData?.status;
  const isTerminalFailure =
    status === "failed" || status === "partial_failed";
  const isPending =
    !hasImage &&
    (isStarting ||
      (!!generationSetId &&
        (status === undefined || status === "starting" || status === "processing")));
  const errorMessage =
    isTerminalFailure
      ? statusData?.qualityFailure
        ? t("error.qualityFailed")
        : statusData?.error || t("error.unknown")
      : startError?.message || statusError?.message || t("error.unknown");
  const isError = !hasImage && (isStartError || isStatusError || isTerminalFailure);

  if (isDev) {
    console.log("[ImageGenerator] State:", {
      isPending,
      isError,
      hasImage,
      generationSetId,
      status,
    });
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center px-4 lg:px-0">
      <PromptDebugPopover
        enabled={showPromptDebugPopover}
        stepLabel="image generation"
        missingKeys={debugSpec?.missingKeys ?? []}
        sections={debugSpec?.modelSections ?? []}
        prompt={debugSpec?.prompt ?? "Prompt is currently empty."}
      />

      {onBack && hasImage && !isPending && <BackButton onClick={onBack} backLabel={t('backToWizard')} />}

      <AnimatePresence mode="wait">
        {isPending && !hasImage && (
          <LoadingState key="loading" phase={statusData?.phase} />
        )}

        {!isPending && isError && !hasImage && (
          <ErrorState
            key="error"
            message={errorMessage}
            onRetry={handleRetry}
          />
        )}

        {!isPending && hasImage && generatedImage && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full"
          >
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {t("result.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("result.description")}
              </p>
            </div>
            <GeneratedImage
              candidate={generatedImage}
              onImageClick={setSelectedImage}
            />
            {isDev && (
              <DevSeedControls
                seed={generationSeed}
                lastGenerationSeed={lastGenerationSeed}
                onSeedChange={setGenerationSeed}
                onRegenerate={handleDevRegenerate}
              />
            )}
            <QuickLink />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
            prompt={completedSpec?.prompt}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DevSeedControls({
  seed,
  lastGenerationSeed,
  onSeedChange,
  onRegenerate,
}: {
  seed: number;
  lastGenerationSeed: number | null;
  onSeedChange: (seed: number) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="mx-auto mt-5 flex w-full max-w-5xl flex-wrap items-end justify-between gap-4 border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-left">
      <div>
        <p className="text-sm font-semibold text-foreground">Development seed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Last generated seed: {lastGenerationSeed ?? "not started"}
        </p>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-foreground" htmlFor="generation-seed">
          Seed
          <input
            id="generation-seed"
            type="number"
            min={0}
            max={MAX_GENERATION_SEED}
            step={1}
            value={seed}
            onChange={(event) => {
              const nextSeed = Number(event.target.value);
              if (!Number.isFinite(nextSeed)) return;
              onSeedChange(
                Math.min(MAX_GENERATION_SEED, Math.max(0, Math.trunc(nextSeed)))
              );
            }}
            className="h-9 w-48 border border-border bg-background px-2 text-sm text-foreground"
          />
        </label>
      </div>
      <Button type="button" onClick={onRegenerate}>
        Regenerate with this seed
      </Button>
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

function LoadingState({ phase }: { phase?: "generating" | "validating" }) {
  const t = useTranslations('imageGenerator.loading');
  const [elapsed, setElapsed] = useState(0);
  const isValidating = phase === "validating";

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
    if (isValidating) return t('messages.validating');
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
    if (isValidating) return t('subMessages.validating');
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

function GeneratedImage({
  candidate,
  onImageClick,
}: {
  candidate: GenerationCandidate;
  onImageClick: (src: string) => void;
}) {
  const t = useTranslations("imageGenerator");

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => onImageClick(candidate.url)}
        aria-label={t("generatedImageAlt")}
        className="group relative block w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary-2"
      >
        <motion.img
          src={candidate.url}
          alt={t("generatedImageAlt")}
          crossOrigin="anonymous"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="aspect-video w-full object-cover transition-transform group-hover:scale-[1.01]"
        />
        <AiGeneratedLabel className="pointer-events-none absolute bottom-2 left-2" />
      </button>
    </div>
  );
}

function QuickLink() {
  const t = useTranslations('imageGenerator');
  return (
    <Link
      href="/my-images"
      className="mx-auto mt-6 flex w-fit px-6 py-3 bg-brand-primary-2 text-white rounded-full font-semibold shadow hover:bg-red-600 transition hover:scale-105"
    >
      📁 {t('goToMyImages')}
    </Link>
  );
}
