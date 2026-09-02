import assert from "node:assert/strict";
import type { WizardState } from "../app/store/wizardStore";
import {
  ACTIVE_LORA_SCALES,
  DEFAULT_GENERATION_SEED,
  LORA_GENERATION_SCALE,
  MODEL_PROMPT_WORD_BUDGET,
  PROMPT_VERSION,
  findPromptContractMismatch,
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
import {
  buildPrompt,
  toGenerationRequestSpec,
} from "../components/wizard/promptBuilder";
import { wizardSteps } from "../components/wizard/wizardSteps";
import {
  BIRD_EYE_VIEWPOINT,
  LEGACY_TOP_DOWN_VIEWPOINT,
  normalizeViewpoint,
} from "../components/wizard/viewpointConfig";

assert.equal(LORA_GENERATION_SCALE, 0.85);
assert.deepEqual(ACTIVE_LORA_SCALES, [0.85]);
assert.equal(normalizeGenerationSeed(undefined), DEFAULT_GENERATION_SEED);
assert.equal(normalizeGenerationSeed(42.9), 42);
assert.equal(normalizeGenerationSeed(-4), 0);
assert.equal(normalizeViewpoint(LEGACY_TOP_DOWN_VIEWPOINT), BIRD_EYE_VIEWPOINT);
const viewpointOptions = wizardSteps.find((step) => step.key === "atmosphere")
  ?.subSteps?.viewpoint.options;
assert(viewpointOptions, "Missing wizard viewpoint options");
assert(viewpointOptions.some((option) => option.value === BIRD_EYE_VIEWPOINT));
assert.equal(
  viewpointOptions.some(
    (option) => option.value === LEGACY_TOP_DOWN_VIEWPOINT
  ),
  false,
  "The legacy 90-degree top-down option must not be selectable"
);
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
  kitchenLook: "kuecheninsel",
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
  // Island layout without an explicit choice: sink at the wall, cooktop on the island.
  assert.equal(result.qualityExpectations.wetZone.location, "wall_run");
  assert.equal(result.qualityExpectations.cookingZone.location, "island");
  assert.equal(result.qualityExpectations.cookingZone.cooktopCount, 1);
  assert.equal(result.qualityExpectations.islandCount, 1);
  assert.equal(result.qualityExpectations.camera.viewpoint, baseSelections.viewpoint);
  assert.equal(result.qualityExpectations.handle.kind, kind);
  assert.equal(findPromptContractMismatch(toGenerationRequestSpec(result)), null);
  assert.equal(result.modelSections[1]?.startsWith("Topology:"), true);
  // The chosen time of day, floor and layout must actually reach the model.
  for (const sectionId of ["layout", "lighting", "floor"]) {
    assert.equal(
      result.omittedModelSections.includes(sectionId),
      false,
      `${kind}: section "${sectionId}" was dropped by the word budget`
    );
  }
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
  "low angle shot, worm's eye view": /70cm above the floor/i,
  "high angle shot, bird's eye view": /50 degrees downward/i,
  "dutch angle, tilted frame": /rolled 12 degrees/i,
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
  assert.equal(
    findPromptContractMismatch(toGenerationRequestSpec(result)),
    null,
    `${viewpoint} prompt and contract must agree (detail views drop the wet zone)`
  );
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

const legacyTopDownResult = buildPrompt({
  selections: {
    ...baseSelections,
    viewpoint: "top-down shot, overhead view",
    handle: encodeHandleSelectionValue("grifflos"),
  },
  pipelineV2Enabled: true,
});
assert.match(legacyTopDownResult.modelPrompt, /50 degrees downward/i);
assert.equal(/90-degree overhead plan|vertically aligned to the floor plane/i.test(legacyTopDownResult.modelPrompt), false);

assert.equal(getFenixColorByValue("fenix:Black")?.name, "Nero Ingo");
assert.equal(getFenixColorByValue("fenix:Orio Cortez")?.name, "Oro Cortez");

const islandEntry = handleCatalog.find(
  (entry) => getHandleGeometry(entry).kind === "bar_pull"
);
assert(islandEntry);
// Sink placement is a structured choice; free-text wishes about it are compiled away.
const islandResult = buildPrompt({
  selections: {
    ...baseSelections,
    handle: encodeHandleSelectionValue(islandEntry.id),
    sinkLocation: "island",
    cooktopLocation: "island",
  },
  extraWishes: "Place the sink and faucet on the kitchen island. Add a brass pendant lamp.",
  pipelineV2Enabled: true,
});
assert.equal(islandResult.qualityExpectations.wetZone.location, "island");
assert.equal(islandResult.qualityExpectations.cookingZone.location, "island");
assert.match(
  islandResult.modelSections[1] ?? "",
  /the island holds the kitchen's only wet zone/
);
assert.match(
  islandResult.modelSections[1] ?? "",
  /the island holds the kitchen's only cooktop/
);
assert.equal((islandResult.prompt.match(/\bsink\b/gi) ?? []).length, 1);
assert.equal((islandResult.prompt.match(/\bfaucet\b/gi) ?? []).length, 1);
assert.equal((islandResult.prompt.match(/\bcooktop\b/gi) ?? []).length, 1);
assert.match(islandResult.prompt, /brass pendant lamp/);
const islandSpec = toGenerationRequestSpec(islandResult);
assert.equal(findPromptContractMismatch(islandSpec), null);
assert.match(
  findPromptContractMismatch({
    ...islandSpec,
    qualityExpectations: {
      ...islandSpec.qualityExpectations,
      cookingZone: { ...islandSpec.qualityExpectations.cookingZone, location: "wall_run" },
    },
  }) ?? "",
  /places the cooktop at island/
);
assert.match(
  findPromptContractMismatch({
    ...islandSpec,
    qualityExpectations: { ...islandSpec.qualityExpectations, islandCount: 0 },
  }) ?? "",
  /islandCount is not 1/
);

// Free-text can no longer move the sink: the selection wins.
const wishOnlyResult = buildPrompt({
  selections: {
    ...baseSelections,
    kitchenLook: "kuechenzeile",
    handle: encodeHandleSelectionValue("grifflos"),
  },
  extraWishes: "Place the sink on the kitchen island.",
  pipelineV2Enabled: true,
});
assert.equal(wishOnlyResult.qualityExpectations.wetZone.location, "wall_run");
assert.equal(wishOnlyResult.qualityExpectations.cookingZone.location, "wall_run");
assert.equal(wishOnlyResult.qualityExpectations.islandCount, 0);
assert.match(wishOnlyResult.modelSections[1] ?? "", /There is no island/);
assert.equal(findPromptContractMismatch(toGenerationRequestSpec(wishOnlyResult)), null);

// Skipped layout: both zones default to the wall run, but no island claim is made.
const noLayoutResult = buildPrompt({
  selections: {
    ...baseSelections,
    kitchenLook: undefined,
    handle: encodeHandleSelectionValue("grifflos"),
  },
  pipelineV2Enabled: true,
});
assert.equal(noLayoutResult.qualityExpectations.islandCount, null);
assert.equal(/There is no island/.test(noLayoutResult.modelSections[1] ?? ""), false);
assert.equal(findPromptContractMismatch(toGenerationRequestSpec(noLayoutResult)), null);
assert.match(
  findPromptContractMismatch({
    ...islandSpec,
    qualityExpectations: {
      ...islandSpec.qualityExpectations,
      wetZone: { ...islandSpec.qualityExpectations.wetZone, location: "wall_run" },
    },
  }) ?? "",
  /places the wet zone at island/
);

// Regression: the generator used to rebuild the contract after the wizard
// store had been reset, so every kitchen prompt shipped with an empty
// "interior" contract. The API boundary must reject that combination.
const resetStateResult = buildPrompt({
  selections: {},
  extraWishes: "",
  pipelineV2Enabled: true,
});
assert.equal(resetStateResult.qualityExpectations.sceneType, "interior");
assert.equal(resetStateResult.qualityExpectations.wetZone.required, false);
assert.match(
  findPromptContractMismatch({
    ...islandSpec,
    qualityExpectations: resetStateResult.qualityExpectations,
  }) ?? "",
  /wetZone\.required=false/
);
assert.match(
  findPromptContractMismatch({
    ...toGenerationRequestSpec(resetStateResult),
    qualityExpectations: islandSpec.qualityExpectations,
  }) ?? "",
  /no wet-zone topology/
);

const legacyKitchenResult = buildPrompt({
  selections: { ...baseSelections, handle: encodeHandleSelectionValue("grifflos") },
  pipelineV2Enabled: false,
});
assert.equal(legacyKitchenResult.promptVersion, "legacy-debug");
assert.equal(
  findPromptContractMismatch(toGenerationRequestSpec(legacyKitchenResult)),
  null
);
assert.match(
  findPromptContractMismatch({
    ...toGenerationRequestSpec(legacyKitchenResult),
    qualityExpectations: resetStateResult.qualityExpectations,
  }) ?? "",
  /describes a kitchen/
);

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
