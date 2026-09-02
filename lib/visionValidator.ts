import Replicate from "replicate";
import type {
  CookingZoneLocation,
  GenerationQualityExpectations,
  HandleGeometryKind,
  WetZoneLocation,
} from "./imageGenerationContract";

export const VALIDATOR_PROMPT_VERSION = "validator-v1" as const;
export const DEFAULT_VALIDATOR_MODEL = "google/gemini-2.5-flash";
const VALIDATOR_TIMEOUT_MS = 90_000;
const RAW_TEXT_LIMIT = 4_000;

export type ValidatorVerdict = "pass" | "fail" | "uncertain";

export type ValidatorCheck = {
  passed: boolean | null;
  observed: string | number | null;
  expected: string | number | null;
  note: string | null;
};

export type ValidatorReport = {
  verdict: ValidatorVerdict;
  modelVerdict: ValidatorVerdict | null;
  confidence: number;
  checks: Record<string, ValidatorCheck>;
  hardChecks: string[];
  reasons: string[];
  rawText: string;
};

export type ValidatorCheckSpec = {
  id: string;
  expected: string | number;
  hard: boolean;
  description: string;
};

// Input field names differ per Replicate model; every one of them streams
// plain text back, which we concatenate and parse as JSON.
type ValidatorModelSpec = {
  buildInput: (params: {
    imageUrl: string;
    instruction: string;
    system: string;
  }) => Record<string, unknown>;
};

const VALIDATOR_MODELS: Record<string, ValidatorModelSpec> = {
  "google/gemini-2.5-flash": {
    // thinking_budget: 0 makes this model stop after ~100 output tokens on
    // Replicate (verified 2026-09-03), so thinking is left at its default.
    buildInput: ({ imageUrl, instruction, system }) => ({
      images: [imageUrl],
      prompt: instruction,
      system_instruction: system,
      temperature: 0,
      max_output_tokens: 4096,
    }),
  },
  "anthropic/claude-4-sonnet": {
    buildInput: ({ imageUrl, instruction, system }) => ({
      image: imageUrl,
      prompt: instruction,
      system_prompt: system,
      max_tokens: 4096,
    }),
  },
  "openai/gpt-4.1-mini": {
    buildInput: ({ imageUrl, instruction, system }) => ({
      image_input: [imageUrl],
      prompt: instruction,
      system_prompt: system,
      temperature: 0,
      max_completion_tokens: 4096,
    }),
  },
};

export const SUPPORTED_VALIDATOR_MODELS = Object.keys(VALIDATOR_MODELS);

export function resolveValidatorModel(): string {
  const configured = process.env.QUALITY_GATE_VALIDATOR_MODEL?.trim();
  return configured || DEFAULT_VALIDATOR_MODEL;
}

const WET_ZONE_LABEL: Record<WetZoneLocation, string> = {
  wall_run: "wall run",
  island: "kitchen island",
  peninsula: "peninsula",
};

const COOKING_ZONE_LABEL: Record<CookingZoneLocation, string> = {
  wall_run: "wall run",
  island: "kitchen island",
};

const HANDLE_EXPECTATION: Record<HandleGeometryKind, string> = {
  handleless:
    "no visible handles at all; fronts open via recessed grooves or push-to-open",
  tokyo_grip:
    "one integrated continuous grip profile along the top edge of each front, no separate handles",
  t_bar: "T-bar handles, each with one central pedestal",
  bar_pull: "bar pull handles, each with two feet on the same front",
  knob: "round knobs with a single mounting point each",
  generic: "the same handle type on every front",
};

const CAMERA_EXPECTATION: Record<string, string> = {
  "eye level shot": "camera at standing eye level, horizon around mid-frame",
  "low angle shot, worm's eye view":
    "low camera near worktop height, tilted slightly upward",
  "high angle shot, bird's eye view":
    "elevated oblique view looking down about 45-60 degrees; fronts and handles stay visible; NOT a vertical top-down plan view",
  "dutch angle, tilted frame": "deliberately rolled, tilted horizon",
  "wide shot, long shot, establishing shot":
    "wide establishing shot showing most of the room",
  "medium shot, mid shot": "medium framing of the main cabinetry run",
  "close-up shot": "close-up of cabinet fronts and details",
  "full room view, interior panorama": "full panoramic room view",
  "extreme close-up, detail shot, macro":
    "extreme close-up or macro detail of fronts and hardware",
};

export function buildValidatorChecks(
  expectations: GenerationQualityExpectations
): ValidatorCheckSpec[] {
  const checks: ValidatorCheckSpec[] = [
    {
      id: "scene_type",
      expected: expectations.sceneType,
      hard: true,
      description:
        expectations.sceneType === "kitchen"
          ? "a kitchen with worktops and cabinetry"
          : "living-room or hallway furniture, not a kitchen",
    },
  ];

  if (expectations.wetZone.required && expectations.wetZone.location) {
    checks.push(
      {
        id: "sink_count",
        expected: 1,
        hard: true,
        description: "number of clearly visible sink basins anywhere in the image",
      },
      {
        id: "faucet_count",
        expected: 1,
        hard: true,
        description:
          "number of faucets, taps or spouts anywhere in the image, including near the cooktop or on dry worktops",
      },
      {
        id: "sink_location",
        expected: WET_ZONE_LABEL[expectations.wetZone.location],
        hard: true,
        description: "which worktop the sink sits on",
      },
      {
        id: "faucet_orientation",
        expected: "rear edge of the sink, spout over the basin",
        hard: false,
        description:
          "the faucet stands at the rear edge of the sink and its spout points over the basin",
      }
    );
  }

  if (expectations.cookingZone.required && expectations.cookingZone.location) {
    checks.push(
      {
        id: "cooktop_count",
        expected: 1,
        hard: true,
        description: "number of cooktops or hobs anywhere in the image",
      },
      {
        id: "cooktop_location",
        expected: COOKING_ZONE_LABEL[expectations.cookingZone.location],
        hard: true,
        description: "which worktop the cooktop sits on",
      }
    );
  }

  if (expectations.islandCount !== null) {
    checks.push({
      id: "island_count",
      expected: expectations.islandCount,
      hard: true,
      description: "number of freestanding kitchen islands",
    });
  }

  if (expectations.camera.viewpoint) {
    checks.push({
      id: "camera_mode",
      expected: expectations.camera.viewpoint,
      hard: false,
      description:
        CAMERA_EXPECTATION[expectations.camera.viewpoint] ??
        expectations.camera.viewpoint,
    });
  }

  if (expectations.handle.kind) {
    checks.push({
      id: "handle_kind",
      expected: expectations.handle.kind,
      hard: false,
      description: HANDLE_EXPECTATION[expectations.handle.kind],
    });
    if (expectations.handle.requiresPanelContainment) {
      checks.push({
        id: "handle_containment",
        expected: "each handle fully on one front",
        hard: false,
        description:
          "every handle sits fully on a single door or drawer front, none straddles a joint between two fronts",
      });
    }
  }

  return checks;
}

export const VALIDATOR_SYSTEM_PROMPT =
  "You are a strict visual QA inspector for AI-generated kitchen renderings. You report only what is clearly visible, you never guess, and you answer with a single JSON object and nothing else.";

export function buildValidatorInstruction(
  expectations: GenerationQualityExpectations
): string {
  const checks = buildValidatorChecks(expectations);
  const specLines = checks.map(
    (check) =>
      `- ${check.id}${check.hard ? "" : " (soft)"}: expected ${JSON.stringify(check.expected)} — ${check.description}`
  );

  return [
    "Inspect the attached rendering against this specification.",
    "",
    "Specification:",
    ...specLines,
    "",
    "Rules:",
    "- Count only fixtures that are clearly visible. If a fixture is cut off or occluded so that you cannot decide, set passed to null and say why in note.",
    "- Any additional tap, spout or basin anywhere in the image counts against faucet_count or sink_count, even when it sits near the cooktop or on a dry worktop.",
    "- Report observed values as numbers for counts and as short strings for locations and modes.",
    `- The "checks" object must contain exactly these ids: ${checks.map((c) => c.id).join(", ")}.`,
    "",
    "Respond with exactly this JSON shape and no other text:",
    '{"verdict":"pass"|"fail"|"uncertain","confidence":<0.0-1.0>,"checks":{"<id>":{"passed":true|false|null,"observed":<number|string|null>,"expected":<number|string>,"note":"<short reason>"}},"reasons":["<why the verdict>"]}',
  ].join("\n");
}

function normalizeVerdict(value: unknown): ValidatorVerdict | null {
  if (value === "pass" || value === "fail" || value === "uncertain") return value;
  return null;
}

function normalizeScalar(value: unknown): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value.slice(0, 200);
  if (typeof value === "boolean") return value ? "true" : "false";
  return null;
}

function extractJsonObject(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(unfenced.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * The verdict is derived from the hard checks here rather than trusted from
 * the model: any failed hard check fails the image, any undecided or missing
 * hard check makes it uncertain.
 */
export function deriveVerdict(
  checks: Record<string, ValidatorCheck>,
  hardChecks: string[]
): ValidatorVerdict {
  let uncertain = false;
  for (const id of hardChecks) {
    const check = checks[id];
    if (!check || check.passed === null) {
      uncertain = true;
      continue;
    }
    if (check.passed === false) return "fail";
  }
  return uncertain ? "uncertain" : "pass";
}

export function parseValidatorOutput(
  rawText: string,
  expectations: GenerationQualityExpectations
): ValidatorReport {
  const specs = buildValidatorChecks(expectations);
  const hardChecks = specs.filter((s) => s.hard).map((s) => s.id);
  const truncated = rawText.slice(0, RAW_TEXT_LIMIT);
  const parsed = extractJsonObject(rawText);

  if (!parsed || typeof parsed !== "object") {
    return {
      verdict: "uncertain",
      modelVerdict: null,
      confidence: 0,
      checks: {},
      hardChecks,
      reasons: ["Validator returned no parseable JSON object"],
      rawText: truncated,
    };
  }

  const candidate = parsed as Record<string, unknown>;
  const rawChecks =
    candidate.checks && typeof candidate.checks === "object"
      ? (candidate.checks as Record<string, unknown>)
      : {};

  const checks: Record<string, ValidatorCheck> = {};
  for (const spec of specs) {
    const raw = rawChecks[spec.id];
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as Record<string, unknown>;
    checks[spec.id] = {
      passed:
        entry.passed === true ? true : entry.passed === false ? false : null,
      observed: normalizeScalar(entry.observed),
      expected: normalizeScalar(entry.expected) ?? spec.expected,
      note: typeof entry.note === "string" ? entry.note.slice(0, 300) : null,
    };
  }

  const reasons = Array.isArray(candidate.reasons)
    ? candidate.reasons
        .filter((r): r is string => typeof r === "string")
        .map((r) => r.slice(0, 300))
        .slice(0, 10)
    : [];
  const confidenceRaw =
    typeof candidate.confidence === "number" ? candidate.confidence : 0;
  const confidence = Math.min(1, Math.max(0, confidenceRaw));
  const verdict = deriveVerdict(checks, hardChecks);
  const missing = hardChecks.filter((id) => !checks[id]);
  if (missing.length > 0) {
    reasons.push(`Validator omitted hard checks: ${missing.join(", ")}`);
  }

  return {
    verdict,
    modelVerdict: normalizeVerdict(candidate.verdict),
    confidence,
    checks,
    hardChecks,
    reasons,
    rawText: truncated,
  };
}

function outputToText(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    return output.map((chunk) => (typeof chunk === "string" ? chunk : "")).join("");
  }
  return JSON.stringify(output ?? "");
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

export async function runVisionValidator(params: {
  imageUrl: string;
  expectations: GenerationQualityExpectations;
  model?: string;
}): Promise<{ report: ValidatorReport; model: string; durationMs: number }> {
  const model = params.model ?? resolveValidatorModel();
  const spec = VALIDATOR_MODELS[model];
  if (!spec) {
    throw new Error(
      `Unsupported validator model "${model}". Supported: ${SUPPORTED_VALIDATOR_MODELS.join(", ")}`
    );
  }
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured");

  const replicate = new Replicate({ auth: token });
  const input = spec.buildInput({
    imageUrl: params.imageUrl,
    instruction: buildValidatorInstruction(params.expectations),
    system: VALIDATOR_SYSTEM_PROMPT,
  });

  const startedAt = Date.now();
  const output = await withTimeout(
    replicate.run(model as `${string}/${string}`, { input }),
    VALIDATOR_TIMEOUT_MS,
    `Vision validator ${model}`
  );
  const durationMs = Date.now() - startedAt;

  return {
    report: parseValidatorOutput(outputToText(output), params.expectations),
    model,
    durationMs,
  };
}
