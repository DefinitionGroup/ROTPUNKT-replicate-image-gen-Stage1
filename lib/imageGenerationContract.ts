export const PROMPT_VERSION = "flux1-v3" as const;
export const MODEL_PROMPT_WORD_BUDGET = 180;
export const LORA_TRIGGER_WORD = "RDTDOT";
export type PromptVersion = typeof PROMPT_VERSION | "legacy-debug";

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

export type GenerationContext = {
  promptVersion: PromptVersion;
  seed: number;
  numOutputs: number;
  modelVersion: string;
  guidanceScale: number;
  loraScale: number;
  numInferenceSteps: number;
};

export type CandidateQualityStatus =
  | "not_evaluated"
  | "accepted"
  | "rejected";

export type GenerationCandidate = {
  index: number;
  url: string;
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

export function isGenerationContext(value: unknown): value is GenerationContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GenerationContext>;
  return Boolean(
    (candidate.promptVersion === PROMPT_VERSION ||
      candidate.promptVersion === "legacy-debug") &&
      Number.isInteger(candidate.seed) &&
      typeof candidate.seed === "number" &&
      candidate.seed >= 0 &&
      candidate.seed <= 2 ** 32 - 1 &&
      Number.isInteger(candidate.numOutputs) &&
      typeof candidate.numOutputs === "number" &&
      candidate.numOutputs >= 1 &&
      candidate.numOutputs <= 4 &&
      typeof candidate.modelVersion === "string" &&
      candidate.modelVersion.length > 0 &&
      typeof candidate.guidanceScale === "number" &&
      typeof candidate.loraScale === "number" &&
      Number.isInteger(candidate.numInferenceSteps) &&
      typeof candidate.numInferenceSteps === "number"
  );
}
