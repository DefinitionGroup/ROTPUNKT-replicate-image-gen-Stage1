// v4: sink and cooktop topology come from structured wizard choices and the
// contract carries cookingZone, islandCount and camera.
export const PROMPT_VERSION = "flux1-v4" as const;
// FLUX.1-dev's T5 encoder reads up to 512 tokens; 240 words leaves room for the
// required topology, handle and camera sections plus layout, lighting, floor and
// the camera priority line.
export const MODEL_PROMPT_WORD_BUDGET = 240;
export const LORA_TRIGGER_WORD = "RDTDOT";
export const LORA_COMPARISON_SCALES = [0.65, 0.75, 0.85] as const;
export const LORA_GENERATION_SCALE = 0.85 as const;
export const ACTIVE_LORA_SCALES = [LORA_GENERATION_SCALE] as const;
// Keep the same baseline reproducible in local development and production.
// A new seed may be supplied explicitly for development experiments.
export const DEFAULT_GENERATION_SEED = 260805 as const;
export const MAX_GENERATION_SEED = 2 ** 32 - 1;
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
export type CookingZoneLocation = "wall_run" | "island";

export type GenerationQualityExpectations = {
  sceneType: "kitchen" | "interior";
  wetZone: {
    required: boolean;
    location: WetZoneLocation | null;
    sinkCount: 1 | null;
    faucetCount: 1 | null;
  };
  cookingZone: {
    required: boolean;
    location: CookingZoneLocation | null;
    cooktopCount: 1 | null;
  };
  // null when the scene is not a kitchen or the framing is a detail view.
  islandCount: 0 | 1 | null;
  camera: {
    viewpoint: string | null;
  };
  handle: {
    kind: HandleGeometryKind | null;
    mountingPoints: 0 | 1 | 2 | null;
    requiresPanelContainment: boolean;
  };
};

// Prompt and quality contract are derived from the same wizard state exactly
// once and travel together; the generator must never rebuild one of them.
export type GenerationRequestSpec = {
  prompt: string;
  promptVersion: PromptVersion;
  qualityExpectations: GenerationQualityExpectations;
  isKitchenRoom: boolean;
  modelSections: string[];
  missingKeys: string[];
};

// Shared sentence openers let the server verify that the prompt it receives
// actually encodes the wet zone the contract claims.
export const WET_ZONE_TOPOLOGY_LEAD: Record<WetZoneLocation, string> = {
  island: "Topology: the island holds the kitchen's only wet zone:",
  peninsula: "Topology: the peninsula holds the kitchen's only wet zone:",
  wall_run: "Topology: the wall run holds the kitchen's only wet zone:",
};
export const COOKING_ZONE_TOPOLOGY_LEAD: Record<CookingZoneLocation, string> = {
  island: "Cooking zone: the island holds the kitchen's only cooktop:",
  wall_run: "Cooking zone: the wall run holds the kitchen's only cooktop:",
};
export const LEGACY_KITCHEN_WET_ZONE_MARKER =
  "One clearly visible sink with a single faucet";

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

export function normalizeGenerationSeed(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_GENERATION_SEED;
  }

  return Math.min(MAX_GENERATION_SEED, Math.max(0, Math.trunc(value)));
}

export function isGenerationQualityExpectations(
  value: unknown
): value is GenerationQualityExpectations {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GenerationQualityExpectations>;
  const wetZone = candidate.wetZone;
  const cookingZone = candidate.cookingZone;
  const camera = candidate.camera;
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
      cookingZone &&
      typeof cookingZone.required === "boolean" &&
      (cookingZone.location === null ||
        cookingZone.location === "wall_run" ||
        cookingZone.location === "island") &&
      (cookingZone.cooktopCount === null || cookingZone.cooktopCount === 1) &&
      (candidate.islandCount === null ||
        candidate.islandCount === 0 ||
        candidate.islandCount === 1) &&
      camera &&
      (camera.viewpoint === null || typeof camera.viewpoint === "string") &&
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

/**
 * Returns a human-readable reason when the prompt and the quality contract
 * disagree about the scene, or null when they are consistent.
 */
export function findPromptContractMismatch({
  prompt,
  promptVersion,
  qualityExpectations,
}: {
  prompt: string;
  promptVersion: PromptVersion;
  qualityExpectations: GenerationQualityExpectations;
}): string | null {
  const { sceneType, wetZone, cookingZone, islandCount } = qualityExpectations;

  if (wetZone.required) {
    if (sceneType !== "kitchen") {
      return `wet zone required for sceneType "${sceneType}"`;
    }
    if (
      wetZone.location === null ||
      wetZone.sinkCount !== 1 ||
      wetZone.faucetCount !== 1
    ) {
      return "required wet zone is missing location, sinkCount or faucetCount";
    }
  } else if (
    wetZone.location !== null ||
    wetZone.sinkCount !== null ||
    wetZone.faucetCount !== null
  ) {
    return "wet zone details present although wetZone.required is false";
  }

  if (cookingZone.required !== wetZone.required) {
    return "cookingZone.required must match wetZone.required";
  }
  if (cookingZone.required) {
    if (cookingZone.location === null || cookingZone.cooktopCount !== 1) {
      return "required cooking zone is missing location or cooktopCount";
    }
    const usesIsland =
      wetZone.location === "island" || cookingZone.location === "island";
    if (usesIsland && islandCount !== 1) {
      return "a zone sits on the island but islandCount is not 1";
    }
  } else if (
    cookingZone.location !== null ||
    cookingZone.cooktopCount !== null ||
    islandCount !== null
  ) {
    return "cooking zone or island details present although the scene needs none";
  }

  if (promptVersion === "legacy-debug") {
    const promptIsKitchen = prompt.includes(LEGACY_KITCHEN_WET_ZONE_MARKER);
    if (promptIsKitchen !== (sceneType === "kitchen")) {
      return promptIsKitchen
        ? `prompt describes a kitchen but contract sceneType is "${sceneType}"`
        : "contract sceneType is kitchen but prompt lacks the kitchen fixture rule";
    }
    return null;
  }

  const promptLocation = (
    Object.keys(WET_ZONE_TOPOLOGY_LEAD) as WetZoneLocation[]
  ).find((location) => prompt.includes(WET_ZONE_TOPOLOGY_LEAD[location]));

  if (promptLocation && !wetZone.required) {
    return `prompt demands a ${promptLocation} wet zone but contract has wetZone.required=false`;
  }
  if (!promptLocation && wetZone.required) {
    return "contract requires a wet zone but prompt has no wet-zone topology";
  }
  if (promptLocation && wetZone.location !== promptLocation) {
    return `prompt places the wet zone at ${promptLocation} but contract says ${wetZone.location}`;
  }

  const promptCooktopLocation = (
    Object.keys(COOKING_ZONE_TOPOLOGY_LEAD) as CookingZoneLocation[]
  ).find((location) =>
    prompt.includes(COOKING_ZONE_TOPOLOGY_LEAD[location])
  );

  if (promptCooktopLocation && !cookingZone.required) {
    return `prompt demands a ${promptCooktopLocation} cooktop but contract has cookingZone.required=false`;
  }
  if (!promptCooktopLocation && cookingZone.required) {
    return "contract requires a cooking zone but prompt has no cooktop topology";
  }
  if (promptCooktopLocation && cookingZone.location !== promptCooktopLocation) {
    return `prompt places the cooktop at ${promptCooktopLocation} but contract says ${cookingZone.location}`;
  }

  return null;
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
  if (!Array.isArray(value)) return false;

  const isActiveSingleImageManifest =
    value.length === ACTIVE_LORA_SCALES.length &&
    value.every(
      (variant, index) =>
        isGenerationVariantContext(variant) &&
        variant.candidateIndex === index &&
        variant.loraScale === ACTIVE_LORA_SCALES[index]
    );
  const isLegacyComparisonManifest =
    value.length === LORA_COMPARISON_SCALES.length &&
    value.every(
      (variant, index) =>
        isGenerationVariantContext(variant) &&
        variant.candidateIndex === index &&
        variant.loraScale === LORA_COMPARISON_SCALES[index]
    );

  return isActiveSingleImageManifest || isLegacyComparisonManifest;
}
