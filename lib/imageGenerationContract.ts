export const PROMPT_VERSION = "flux1-v3" as const;
export const MODEL_PROMPT_WORD_BUDGET = 180;
export const LORA_TRIGGER_WORD = "RDTDOT";
export const LORA_COMPARISON_SCALES = [0.65, 0.75, 0.85] as const;
export type PromptVersion = typeof PROMPT_VERSION | "legacy-debug";
export type LoraComparisonScale = (typeof LORA_COMPARISON_SCALES)[number];
export type GenerationSetStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "partial_failed";

export type HandleGeometryKind =
  | "handleless"
  | "tokyo_grip"
  | "t_bar"
  | "bar_pull"
  | "knob"
  | "generic";

export type WetZoneLocation = "wall_run" | "island" | "peninsula";

export type GenerationQualityExpectations = {
  sceneType: "kitchen" | "interior";
  wetZone: {
    required: boolean;
    location: WetZoneLocation | null;
    sinkCount: 1 | null;
    faucetCount: 1 | null;
  };
  handle: {
    kind: HandleGeometryKind | null;
    mountingPoints: 0 | 1 | 2 | null;
    requiresPanelContainment: boolean;
  };
};

export type GenerationVariantContext = {
  predictionId: string;
  status: string;
  candidateIndex: number;
  loraScale: LoraComparisonScale;
};

export type GenerationSetContext = {
  generationSetId: string;
  status: GenerationSetStatus;
  promptVersion: PromptVersion;
  seed: number;
  modelVersion: string;
  guidanceScale: number;
  numInferenceSteps: number;
  variants: GenerationVariantContext[];
};

export type CandidateQualityStatus =
  | "not_evaluated"
  | "accepted"
  | "rejected";

export type GenerationCandidate = {
  imageId: string;
  generationSetId: string;
  index: number;
  url: string;
  loraScale: LoraComparisonScale;
  isSelectedBest: boolean;
  quality: {
    status: CandidateQualityStatus;
    reasons: string[];
  };
};

export function countPromptWords(value: string): number {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

export function withLoraTrigger(prompt: string): string {
  const withoutLeadingTrigger = prompt
    .trim()
    .replace(new RegExp(`^(?:${LORA_TRIGGER_WORD}\\s+)+`, "i"), "");
  return `${LORA_TRIGGER_WORD} ${withoutLeadingTrigger}`;
}

export function isLoraComparisonScale(
  value: unknown
): value is LoraComparisonScale {
  return (
    typeof value === "number" &&
    LORA_COMPARISON_SCALES.some((scale) => scale === value)
  );
}

export function isGenerationQualityExpectations(
  value: unknown
): value is GenerationQualityExpectations {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GenerationQualityExpectations>;
  const wetZone = candidate.wetZone;
  const handle = candidate.handle;
  return Boolean(
    (candidate.sceneType === "kitchen" ||
      candidate.sceneType === "interior") &&
      wetZone &&
      typeof wetZone.required === "boolean" &&
      (wetZone.location === null ||
        wetZone.location === "wall_run" ||
        wetZone.location === "island" ||
        wetZone.location === "peninsula") &&
      (wetZone.sinkCount === null || wetZone.sinkCount === 1) &&
      (wetZone.faucetCount === null || wetZone.faucetCount === 1) &&
      handle &&
      (handle.kind === null ||
        handle.kind === "handleless" ||
        handle.kind === "tokyo_grip" ||
        handle.kind === "t_bar" ||
        handle.kind === "bar_pull" ||
        handle.kind === "knob" ||
        handle.kind === "generic") &&
      (handle.mountingPoints === null ||
        handle.mountingPoints === 0 ||
        handle.mountingPoints === 1 ||
        handle.mountingPoints === 2) &&
      typeof handle.requiresPanelContainment === "boolean"
  );
}

export function isGenerationVariantContext(
  value: unknown
): value is GenerationVariantContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GenerationVariantContext>;
  return Boolean(
    typeof candidate.predictionId === "string" &&
      candidate.predictionId.length > 0 &&
      typeof candidate.status === "string" &&
      Number.isInteger(candidate.candidateIndex) &&
      typeof candidate.candidateIndex === "number" &&
      candidate.candidateIndex >= 0 &&
      candidate.candidateIndex < LORA_COMPARISON_SCALES.length &&
      isLoraComparisonScale(candidate.loraScale)
  );
}

export function isGenerationVariantManifest(
  value: unknown
): value is GenerationVariantContext[] {
  return (
    Array.isArray(value) &&
    value.length === LORA_COMPARISON_SCALES.length &&
    value.every(
      (variant, index) =>
        isGenerationVariantContext(variant) &&
        variant.candidateIndex === index &&
        variant.loraScale === LORA_COMPARISON_SCALES[index]
    )
  );
}
