import assert from "node:assert/strict";
import type { WizardState } from "../app/store/wizardStore";
import {
  ACTIVE_LORA_SCALES,
  DEFAULT_GENERATION_SEED,
  LORA_GENERATION_SCALE,
  MODEL_PROMPT_WORD_BUDGET,
  PROMPT_VERSION,
  isGenerationVariantManifest,
  normalizeGenerationSeed,
  withLoraTrigger,
  type HandleGeometryKind,
} from "../lib/imageGenerationContract";
import {
  encodeHandleSelectionValue,
  getHandleGeometry,
  handleCatalog,
} from "../components/wizard/handleCatalog";
import { encodeFrontfarbenColorValue } from "../components/wizard/frontfarbenCatalog";
import { getFenixColorByValue } from "../components/wizard/fenixColors";
import { buildPrompt } from "../components/wizard/promptBuilder";

assert.equal(LORA_GENERATION_SCALE, 0.85);
assert.deepEqual(ACTIVE_LORA_SCALES, [0.85]);
assert.equal(normalizeGenerationSeed(undefined), DEFAULT_GENERATION_SEED);
assert.equal(normalizeGenerationSeed(42.9), 42);
assert.equal(normalizeGenerationSeed(-4), 0);
assert.equal(
  isGenerationVariantManifest([
    {
      predictionId: "active-prediction",
      status: "starting",
      candidateIndex: 0,
      loraScale: 0.85,
    },
  ]),
  true
);
assert.equal(
  isGenerationVariantManifest(
    [0.65, 0.75, 0.85].map((loraScale, candidateIndex) => ({
      predictionId: `legacy-prediction-${candidateIndex}`,
      status: "starting",
      candidateIndex,
      loraScale,
    }))
  ),
  true
);

const baseSelections: WizardState["selectedOptions"] = {
  environment: "stadtwohnung",
  kind: "kueche",
  color: "schwarz",
  style: "modern",
  time: "afternoon, warm afternoon light",
  viewpoint: "wide shot, long shot, establishing shot",
  floor: "light oak wood flooring",
  kitchenLook: "kitchen island",
  accessories: [],
};

const requiredKinds: HandleGeometryKind[] = [
  "handleless",
  "tokyo_grip",
  "t_bar",
  "bar_pull",
  "knob",
];

const rows = requiredKinds.map((kind) => {
  const entry = handleCatalog.find(
    (candidate) => getHandleGeometry(candidate).kind === kind
  );
  assert(entry, `Missing handle catalog fixture for ${kind}`);

  const result = buildPrompt({
    selections: {
      ...baseSelections,
      handle: encodeHandleSelectionValue(entry.id),
    },
    pipelineV2Enabled: true,
  });

  assert.equal(result.promptVersion, PROMPT_VERSION);
  assert.equal(result.budgetExceeded, false);
  assert(
    result.wordCount <= MODEL_PROMPT_WORD_BUDGET,
    `${kind} prompt has ${result.wordCount} words`
  );
  assert.equal(result.qualityExpectations.wetZone.sinkCount, 1);
  assert.equal(result.qualityExpectations.wetZone.faucetCount, 1);
  assert.equal(result.qualityExpectations.handle.kind, kind);
  assert.equal(result.modelSections[1]?.startsWith("Topology:"), true);
  assert.equal(
    result.modelSections[2]?.startsWith(
      kind === "handleless" || kind === "tokyo_grip"
        ? "Opening system:"
        : "Handle:"
    ),
    true
  );
  assert.equal(/multiple handles|four handles visible/i.test(result.prompt), false);
  assert.equal(/product photography|white background/i.test(result.prompt), false);

  const triggered = withLoraTrigger(`RDTDOT RDTDOT ${result.prompt}`);
  assert.equal((triggered.match(/\bRDTDOT\b/g) ?? []).length, 1);

  if (kind === "tokyo_grip") {
    assert.match(result.prompt, /Each panel has its own contained profile/);
  }
  if (kind === "t_bar") {
    assert.match(result.prompt, /One central pedestal is fully inside/);
  }
  if (kind === "bar_pull") {
    assert.match(result.prompt, /Both feet attach to the same front/);
  }
  if (kind === "knob") {
    assert.match(result.prompt, /single mounting point is fully inside/);
  }

  return {
    kind,
    handleId: entry.id,
    words: result.wordCount,
    omitted: result.omittedModelSections.join(",") || "none",
  };
});

const cameraCoverage: Record<string, RegExp> = {
  "eye level shot": /150cm above the floor/i,
  "low angle shot, worm's eye view": /below waist height looking upward/i,
  "high angle shot, bird's eye view": /bird's-eye view from above/i,
  "top-down shot, overhead view": /true top-down architectural overhead camera/i,
  "dutch angle, tilted frame": /camera intentionally tilted 20 degrees/i,
  "wide shot, long shot, establishing shot": /wide establishing shot/i,
  "medium shot, mid shot": /medium shot framing/i,
  "close-up shot": /close-up shot of cabinet details/i,
  "full room view, interior panorama": /full panoramic room view/i,
  "extreme close-up, detail shot, macro": /extreme close-up macro detail shot/i,
};

for (const [viewpoint, expectedCameraDescription] of Object.entries(
  cameraCoverage
)) {
  const result = buildPrompt({
    selections: {
      ...baseSelections,
      color: "fenix:Black",
      viewpoint,
      handle: encodeHandleSelectionValue("grifflos"),
    },
    pipelineV2Enabled: true,
  });

  assert.equal(result.budgetExceeded, false);
  assert(
    result.modelSections.some((section) =>
      section.startsWith("Camera and composition:")
    ),
    `${viewpoint} must remain a high-priority model camera section`
  );
  assert.match(result.modelPrompt, expectedCameraDescription);
  assert.match(result.modelPrompt, /FENIX Nero Ingo \(0720; Rotpunkt catalog 212FX\)/);
  assert.match(result.modelPrompt, /super-matte/i);
  assert.equal(/highly polished|glossy plastic|specular highlights/i.test(result.modelPrompt), false);
  if (viewpoint === "dutch angle, tilted frame") {
    assert.equal(/straight verticals/i.test(result.modelPrompt), false);
  }
}

assert.equal(getFenixColorByValue("fenix:Black")?.name, "Nero Ingo");
assert.equal(getFenixColorByValue("fenix:Orio Cortez")?.name, "Oro Cortez");

const islandEntry = handleCatalog.find(
  (entry) => getHandleGeometry(entry).kind === "bar_pull"
);
assert(islandEntry);
const islandResult = buildPrompt({
  selections: {
    ...baseSelections,
    handle: encodeHandleSelectionValue(islandEntry.id),
  },
  extraWishes: "Place the sink and faucet on the kitchen island.",
  pipelineV2Enabled: true,
});
assert.equal(islandResult.qualityExpectations.wetZone.location, "island");
assert.match(
  islandResult.modelSections[1] ?? "",
  /the island contains the kitchen's only wet zone/
);
assert.equal((islandResult.prompt.match(/\bsink\b/gi) ?? []).length, 1);
assert.equal((islandResult.prompt.match(/\bfaucet\b/gi) ?? []).length, 1);

const blackTBar = handleCatalog.find(
  (entry) => entry.id === "bp-230821-rp-mk11-griff-th-01322"
);
assert(blackTBar, "Missing black Buster & Punch T-bar fixture");
const frontIdentityResult = buildPrompt({
  selections: {
    ...baseSelections,
    color: encodeFrontfarbenColorValue("844HL"),
    handle: encodeHandleSelectionValue(blackTBar.id),
  },
  pipelineV2Enabled: true,
});
assert.match(frontIdentityResult.prompt, /Rotpunkt MOSS \(HL\), catalog 844HL/);
assert.match(frontIdentityResult.prompt, /dark green high gloss smooth kitchen door surface/);
assert.match(frontIdentityResult.prompt, /Selected hardware reference: Matte Black Knurled/);
assert.doesNotMatch(
  frontIdentityResult.prompt,
  /white Rotpunkt kitchen cabinet front|dark countertop|product photography/i
);

console.table(rows);
console.log(
  `FLUX.1 V3 prompt audit passed (${rows.length} handle geometries, budget ${MODEL_PROMPT_WORD_BUDGET} words).`
);
