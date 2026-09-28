"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useStore } from "@nanostores/react";
import { $generationSpec } from "@/store/prompt";
import { useMutation, useQuery } from "@tanstack/react-query";
import ImageModal from "@/components/ImageModal";
import AiGeneratedLabel from "@/components/AiGeneratedLabel";
import { useTranslations } from "next-intl";
import { PromptDebugPopover } from "./PromptDebugPopover";
import { Emphasis } from "@/components/design-system/emphasis";
import { GlassBadge } from "@/components/design-system/glass";
import { Label } from "@/components/design-system/label";
import { Pill } from "@/components/design-system/pill";
import { DURATION, REVEAL_RISE, SIGNATURE_EASE } from "@/lib/motion";
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
  const tStudio = useTranslations('studio');
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

  // Another image for the same brief: the server continues this set's seed
  // sequence, so the variant is new rather than a repeat.
  const handleNewVariant = useCallback(() => {
    const specToVary = completedSpec ?? spec;
    if (!specToVary) return;
    const previousGenerationSetId = generationSetId;
    resetMutation();
    setGenerationSetId(null);
    setGeneratedImage(null);
    hasTriggered.current = specToVary.prompt;
    startGeneration({ spec: specToVary, seed: generationSeed, previousGenerationSetId });
  }, [completedSpec, generationSeed, generationSetId, spec, resetMutation, startGeneration]);

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
    <div className="flex w-full flex-col">
      <PromptDebugPopover
        enabled={showPromptDebugPopover}
        stepLabel="image generation"
        missingKeys={debugSpec?.missingKeys ?? []}
        sections={debugSpec?.modelSections ?? []}
        prompt={debugSpec?.prompt ?? "Prompt is currently empty."}
      />

      <AnimatePresence mode="wait">
        {isPending && !hasImage && (
          <LoadingState key="loading" phase={statusData?.phase} />
        )}

        {!isPending && isError && !hasImage && (
          <ErrorState
            key="error"
            message={errorMessage}
            onBack={onBack}
            onRetry={handleRetry}
          />
        )}

        {!isPending && hasImage && generatedImage && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: REVEAL_RISE }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE }}
            className="w-full"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <Label>{tStudio("eyebrow")}</Label>
                <h2 className="mt-3 text-heading text-ink">
                  <Emphasis text={tStudio("stage.result")} />
                </h2>
                <p className="mt-3 text-body text-graphite">{tStudio("stage.resultLead")}</p>
              </div>
              {generatedImage.quality.status === "accepted" && (
                <GlassBadge className="self-start md:self-auto">{tStudio("stage.checked")}</GlassBadge>
              )}
            </div>

            <GeneratedImage candidate={generatedImage} onImageClick={setSelectedImage} />

            <div className="mt-6 flex flex-wrap gap-3">
              <Pill onClick={handleNewVariant} type="button">
                {tStudio("stage.variant")}
              </Pill>
              <Pill href="/my-images" variant="secondary">
                {tStudio("stage.gallery")}
              </Pill>
              {onBack && (
                <Pill onClick={onBack} type="button" variant="ghost">
                  {tStudio("rail.edit")}
                </Pill>
              )}
            </div>

            {isDev && (
              <DevSeedControls
                seed={generationSeed}
                lastGenerationSeed={lastGenerationSeed}
                onSeedChange={setGenerationSeed}
                onRegenerate={handleDevRegenerate}
              />
            )}
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
    <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-card border border-dashed border-hairline px-4 py-3 text-left">
      <div>
        <p className="text-caption text-ink">Development seed</p>
        <p className="tnum mt-1 text-caption text-graphite">
          Last generated seed: {lastGenerationSeed ?? "not started"}
        </p>
        <label className="mt-3 flex flex-col gap-1 text-caption text-graphite" htmlFor="generation-seed">
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
            className="tnum h-10 w-48 border-0 border-b border-hairline bg-transparent px-0 text-body text-ink outline-none focus:border-ink"
          />
        </label>
      </div>
      <Pill onClick={onRegenerate} type="button" variant="secondary">
        Regenerate with this seed
      </Pill>
    </div>
  );
}

function LoadingState({ phase }: { phase?: "generating" | "validating" }) {
  const t = useTranslations('imageGenerator.loading');
  const tStudio = useTranslations('studio.stage');
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

  // The line fills over the usual wait; a check that follows the render fills it.
  const progress = isValidating ? 100 : Math.min(92, (elapsed / 120) * 100);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: REVEAL_RISE }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE }}
      className="flex min-h-[60vh] w-full flex-col items-center justify-center text-center"
      role="status"
    >
      <div className="size-40">
        <DotLottieReact src="/UI/LoadingImageAnimation.lottie" loop autoplay />
      </div>

      <GlassBadge className="mt-2">
        {isValidating ? tStudio("validating") : tStudio("generating")}
        <span className="tnum ml-2 text-porcelain/70">{formatTime(elapsed)}</span>
      </GlassBadge>

      <motion.p
        key={getMessage()}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 max-w-lg text-lead text-ink"
      >
        {getMessage()}
      </motion.p>

      <motion.p
        key={getSubMessage()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 max-w-md text-body text-graphite"
      >
        {getSubMessage()}
      </motion.p>

      <div className="mt-8 h-px w-64 overflow-hidden bg-hairline">
        <motion.div
          className="h-px bg-signature"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack?: () => void;
}) {
  const t = useTranslations('imageGenerator.error');
  const tStudio = useTranslations('studio.rail');
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: REVEAL_RISE }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE }}
      className="max-w-xl rounded-card border border-hairline bg-charcoal p-6 md:p-8"
      role="alert"
    >
      <span aria-hidden="true" className="block size-2.5 rounded-pill bg-signature" />
      <h3 className="mt-5 text-title text-ink">{t('title')}</h3>
      <p className="mt-3 text-body text-graphite">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Pill onClick={onRetry} type="button">
          {t('retry')}
        </Pill>
        {onBack && (
          <Pill onClick={onBack} type="button" variant="ghost">
            {tStudio('edit')}
          </Pill>
        )}
      </div>
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
    <div className="mt-8 overflow-hidden rounded-card border border-hairline bg-charcoal">
      <button
        type="button"
        onClick={() => onImageClick(candidate.url)}
        aria-label={t("generatedImageAlt")}
        className="group relative block w-full overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ink"
      >
        <motion.img
          src={candidate.url}
          alt={t("generatedImageAlt")}
          crossOrigin="anonymous"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE }}
          className="aspect-video w-full object-cover transition-transform duration-reveal ease-signature group-hover:scale-[1.01]"
        />
        <AiGeneratedLabel className="pointer-events-none absolute bottom-3 left-3" />
      </button>
    </div>
  );
}
