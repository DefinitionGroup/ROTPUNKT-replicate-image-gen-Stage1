import Replicate from "replicate";
import type {
  CookingZoneLocation,
  GenerationQualityExpectations,
  HandleGeometryKind,
  WetZoneLocation,
} from "./imageGenerationContract";

export const VALIDATOR_PROMPT_VERSION = "validator-v2" as const;
// On the first real two-sink image (2026-09-03) Gemini 2.5 Flash and Claude 4
// Sonnet missed the second sink; GPT-5.6 Luna, Gemini 3 Flash, GPT-5.2, Claude
// Sonnet 5 and GPT-4.1 mini caught it. Luna gave the most complete report
// (positions, handles, island) at ~12 s; Gemini 3 Flash is the fastest alternative.
export const DEFAULT_VALIDATOR_MODEL = "openai/gpt-5.6-luna";
const VALIDATOR_TIMEOUT_MS = 90_000;
const RAW_TEXT_LIMIT = 4_000;

export type ValidatorVerdict = "pass" | "fail" | "uncertain";

export type ValidatorCheck = {
  passed: boolean | null;
  observed: string | number | null;
  expected: string | number | null;
  note: string | null;
};

export type FixtureType = "sink" | "faucet" | "cooktop" | "island";

export type ValidatorFixture = {
  type: FixtureType;
  position: string;
};

export type ValidatorReport = {
  verdict: ValidatorVerdict;
  modelVerdict: ValidatorVerdict | null;
  confidence: number;
  // Every fixture the model enumerated; count checks are derived from this list.
  fixtures: ValidatorFixture[];
  checks: Record<string, ValidatorCheck>;
  hardChecks: string[];
  reasons: string[];
  rawText: string;
};

const COUNT_CHECK_FIXTURE: Record<string, FixtureType> = {
  sink_count: "sink",
  faucet_count: "faucet",
  cooktop_count: "cooktop",
  island_count: "island",
};

export type ValidatorCheckSpec = {
  id: string;
  expected: string | number;
  hard: boolean;
  description: string;
};

/**
 * Which checks decide the verdict. A preset name or an explicit list of check ids.
 * Phase 1 default "counts+camera": scene type, the fixture counts and the camera
 * perspective block an image; placement and handle type stay advisory because
 * FLUX misplaces island zones far too often to block on them yet.
 */
export const HARD_CHECK_PRESETS = {
  counts: ["scene_type", "sink_count", "faucet_count", "cooktop_count"],
  "counts+camera": [
    "scene_type",
    "sink_count",
    "faucet_count",
    "cooktop_count",
    "camera_mode",
  ],
  full: [
    "scene_type",
    "sink_count",
    "faucet_count",
    "cooktop_count",
    "camera_mode",
    "sink_location",
    "cooktop_location",
    "island_count",
    "handle_kind",
  ],
} as const satisfies Record<string, readonly string[]>;

export type ValidatorStrictnessPreset = keyof typeof HARD_CHECK_PRESETS;
export type ValidatorStrictness = ValidatorStrictnessPreset | readonly string[];
export const DEFAULT_VALIDATOR_STRICTNESS: ValidatorStrictness = "counts+camera";
export const KNOWN_CHECK_IDS = [
  "scene_type",
  "sink_count",
  "faucet_count",
  "sink_location",
  "faucet_orientation",
  "cooktop_count",
  "cooktop_location",
  "island_count",
  "camera_mode",
  "handle_kind",
  "handle_containment",
] as const;

export function isValidatorStrictnessPreset(
  value: unknown
): value is ValidatorStrictnessPreset {
  return typeof value === "string" && value in HARD_CHECK_PRESETS;
}

export function resolveHardCheckIds(strictness: ValidatorStrictness): Set<string> {
  return new Set(
    typeof strictness === "string" ? HARD_CHECK_PRESETS[strictness] : strictness
  );
}

export function describeStrictness(strictness: ValidatorStrictness): string {
  return typeof strictness === "string" ? strictness : [...strictness].join(",");
}

// Input field names differ per Replicate model; every one of them streams
// plain text back, which we concatenate and parse as JSON.
type ValidatorModelSpec = {
  buildInput: (params: {
    imageUrl: string;
    instruction: string;
    system: string;
  }) => Record<string, unknown>;
};

// Input schemas verified against the Replicate API on 2026-09-03.
const geminiInput: ValidatorModelSpec["buildInput"] = ({ imageUrl, instruction, system }) => ({
  images: [imageUrl],
  prompt: instruction,
  system_instruction: system,
  temperature: 0,
  max_output_tokens: 4096,
});

// Gemini 3 thinks by default and its thinking tokens count against
// max_output_tokens; 4096 left a truncated JSON (verified 2026-09-03).
const gemini3Input: ValidatorModelSpec["buildInput"] = ({ imageUrl, instruction, system }) => ({
  images: [imageUrl],
  prompt: instruction,
  system_instruction: system,
  temperature: 0,
  max_output_tokens: 16384,
});

// Replicate downscales the image before sending it to Claude; keep the full
// 1 MP render so small fixtures at the frame edge stay countable.
const claudeInput: ValidatorModelSpec["buildInput"] = ({ imageUrl, instruction, system }) => ({
  image: imageUrl,
  prompt: instruction,
  system_prompt: system,
  max_tokens: 4096,
  max_image_resolution: 2,
});

const gpt41Input: ValidatorModelSpec["buildInput"] = ({ imageUrl, instruction, system }) => ({
  image_input: [imageUrl],
  prompt: instruction,
  system_prompt: system,
  temperature: 0,
  max_completion_tokens: 4096,
});

// GPT-5 family: no temperature; reasoning effort replaces it.
const gpt5Input: ValidatorModelSpec["buildInput"] = ({ imageUrl, instruction, system }) => ({
  image_input: [imageUrl],
  prompt: instruction,
  system_prompt: system,
  reasoning_effort: "low",
  verbosity: "low",
  max_completion_tokens: 4096,
});

const VALIDATOR_MODELS: Record<string, ValidatorModelSpec> = {
  // thinking_budget: 0 makes Gemini 2.5 stop after ~100 output tokens on
  // Replicate (verified 2026-09-03), so thinking is left at its default.
  "google/gemini-2.5-flash": { buildInput: geminiInput },
  "google/gemini-3-flash": { buildInput: gemini3Input },
  "google/gemini-3.1-pro": { buildInput: gemini3Input },
  "anthropic/claude-4-sonnet": { buildInput: claudeInput },
  "anthropic/claude-sonnet-4.6": { buildInput: claudeInput },
  "anthropic/claude-sonnet-5": { buildInput: claudeInput },
  "openai/gpt-4.1-mini": { buildInput: gpt41Input },
  "openai/gpt-5-mini": { buildInput: gpt5Input },
  "openai/gpt-5.2": { buildInput: gpt5Input },
  "openai/gpt-5.6-luna": { buildInput: gpt5Input },
};

export const SUPPORTED_VALIDATOR_MODELS = Object.keys(VALIDATOR_MODELS);

export function resolveValidatorModel(): string {
  const configured = process.env.QUALITY_GATE_VALIDATOR_MODEL?.trim();
  return configured || DEFAULT_VALIDATOR_MODEL;
}

/**
 * Shadow mode may run several models per image so the calibration set
 * compares them on identical inputs. QUALITY_GATE_VALIDATOR_MODELS (comma
 * separated) wins; otherwise the single configured model is used.
 */
export function resolveValidatorModels(): string[] {
  const list = (process.env.QUALITY_GATE_VALIDATOR_MODELS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(list.length > 0 ? list : [resolveValidatorModel()]));
  return unique;
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
  expectations: GenerationQualityExpectations,
  strictness: ValidatorStrictness = DEFAULT_VALIDATOR_STRICTNESS
): ValidatorCheckSpec[] {
  const hardIds = resolveHardCheckIds(strictness);
  return buildAllChecks(expectations).map((check) => ({
    ...check,
    hard: hardIds.has(check.id),
  }));
}

function buildAllChecks(
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
  expectations: GenerationQualityExpectations,
  strictness: ValidatorStrictness = DEFAULT_VALIDATOR_STRICTNESS
): string {
  const checks = buildValidatorChecks(expectations, strictness);
  const specLines = checks.map(
    (check) =>
      `- ${check.id}${check.hard ? "" : " (soft)"}: expected ${JSON.stringify(check.expected)} — ${check.description}`
  );

  return [
    "Inspect the attached rendering against this specification.",
    "",
    "Step 1 - inventory. Scan the whole image systematically from left to right, including the far edges, and list EVERY sink basin, EVERY faucet/tap/spout, EVERY cooktop/hob and EVERY freestanding island you can see, one entry each, with a short position (for example \"left wall run, near window\"). Two basins side by side are two entries. A tap standing on a dry worktop or next to the cooktop is still a faucet entry. Never add an entry for something that is absent: if there is no cooktop, the list simply contains no cooktop entry.",
    "",
    "Step 2 - checks. Judge each item of the specification. Counts must equal the number of matching inventory entries.",
    "",
    "Specification:",
    ...specLines,
    "",
    "Rules:",
    "- Report only what is clearly visible. If a fixture is cut off or occluded so that you cannot decide, set passed to null and say why in note.",
    "- Report observed values as numbers for counts and as short strings for locations and modes.",
    `- The "checks" object must contain exactly these ids: ${checks.map((c) => c.id).join(", ")}.`,
    "",
    "Respond with exactly this JSON shape and no other text:",
    '{"fixtures":[{"type":"sink"|"faucet"|"cooktop"|"island","position":"<short>"}],"verdict":"pass"|"fail"|"uncertain","confidence":<0.0-1.0>,"checks":{"<id>":{"passed":true|false|null,"observed":<number|string|null>,"expected":<number|string>,"note":"<short reason>"}},"reasons":["<why the verdict>"]}',
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
  expectations: GenerationQualityExpectations,
  strictness: ValidatorStrictness = DEFAULT_VALIDATOR_STRICTNESS
): ValidatorReport {
  const specs = buildValidatorChecks(expectations, strictness);
  const hardChecks = specs.filter((s) => s.hard).map((s) => s.id);
  const truncated = rawText.slice(0, RAW_TEXT_LIMIT);
  const parsed = extractJsonObject(rawText);

  if (!parsed || typeof parsed !== "object") {
    return {
      verdict: "uncertain",
      modelVerdict: null,
      confidence: 0,
      fixtures: [],
      checks: {},
      hardChecks,
      reasons: ["Validator returned no parseable JSON object"],
      rawText: truncated,
    };
  }

  const candidate = parsed as Record<string, unknown>;
  const fixtures: ValidatorFixture[] = Array.isArray(candidate.fixtures)
    ? candidate.fixtures
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const raw = entry as Record<string, unknown>;
          const type = raw.type;
          if (
            type !== "sink" &&
            type !== "faucet" &&
            type !== "cooktop" &&
            type !== "island"
          ) {
            return null;
          }
          const position =
            typeof raw.position === "string" ? raw.position.slice(0, 120) : "";
          // Some models enumerate an absence ("no cooktop visible"); that is not a fixture.
          if (/\b(none|no\b|not (?:clearly )?visible|absent|missing|cannot confirm|nicht)/i.test(position)) {
            return null;
          }
          return { type, position };
        })
        .filter((entry): entry is ValidatorFixture => entry !== null)
        .slice(0, 40)
    : [];
  const hasInventory = Array.isArray(candidate.fixtures);
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

  // Models enumerate more reliably than they count: when an inventory exists,
  // the enumerated fixtures decide every count check.
  if (hasInventory) {
    for (const spec of specs) {
      const fixtureType = COUNT_CHECK_FIXTURE[spec.id];
      if (!fixtureType) continue;
      const counted = fixtures.filter((f) => f.type === fixtureType).length;
      const existing = checks[spec.id];
      if (existing && existing.passed === null && counted === 0) continue;
      const expected = Number(spec.expected);
      checks[spec.id] = {
        passed: counted === expected,
        observed: counted,
        expected: spec.expected,
        note:
          counted === expected
            ? existing?.note ?? null
            : `inventory lists ${counted}: ${fixtures
                .filter((f) => f.type === fixtureType)
                .map((f) => f.position)
                .filter(Boolean)
                .join("; ")
                .slice(0, 240)}`,
      };
    }
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
    fixtures,
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
  strictness?: ValidatorStrictness;
}): Promise<{ report: ValidatorReport; model: string; durationMs: number }> {
  const model = params.model ?? resolveValidatorModel();
  const strictness = params.strictness ?? DEFAULT_VALIDATOR_STRICTNESS;
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
    instruction: buildValidatorInstruction(params.expectations, strictness),
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
    report: parseValidatorOutput(outputToText(output), params.expectations, strictness),
    model,
    durationMs,
  };
}
