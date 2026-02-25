import type { WizardState } from "@/app/store/wizardStore";
import { wizardSteps, kitchenLayoutOptions } from "./wizardSteps";
import { getFenixColorByValue, isFenixColorValue } from "./fenixColors";
import {
  getFrontfarbenColorByValue,
  isFrontfarbenColorValue,
} from "./frontfarbenCatalog";
import {
  getHandlePromptDescriptor,
  getHandleSelectionByValue,
} from "./handleCatalog";

export type PromptBuildResult = {
  // Prompt actually sent to image generation.
  prompt: string;
  modelPrompt: string;
  modelSections: string[];
  // Full diagnostic prompt with all internal enforcement details.
  debugPrompt: string;
  debugSections: string[];
  // Backward-compatible alias used by UI debug popovers.
  sections: string[];
  missingKeys: string[];
  isKitchenRoom: boolean;
};

/**
 * A/B testing flag for prompt language.
 * - 'en': English labels for FLUX T5 encoder (recommended, English-trained)
 * - 'de': German labels (legacy behavior)
 */
export const PROMPT_LANGUAGE: "en" | "de" = "en";

const PROMPT_PIPELINE_V2_ENABLED = (() => {
  const raw = (process.env.NEXT_PUBLIC_PROMPT_PIPELINE_V2 ?? "true")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
})();

function getLabel(
  key: keyof WizardState["selectedOptions"],
  value?: string
): string | undefined {
  if (!value) return undefined;
  // Check top-level steps first
  const step = wizardSteps.find((item) => item.key === key);
  if (step) {
    const option = step.options.find((opt) => opt.value === value);
    if (!option) return value;
    if (PROMPT_LANGUAGE === "en" && option.englishLabel) {
      return option.englishLabel;
    }
    return option.germanLabel;
  }
  // Check sub-steps (e.g., style/viewpoint/time inside atmosphere)
  for (const wizStep of wizardSteps) {
    if (wizStep.subSteps?.[key]) {
      const option = wizStep.subSteps[key].options.find((opt) => opt.value === value);
      if (!option) return value;
      if (PROMPT_LANGUAGE === "en" && option.englishLabel) {
        return option.englishLabel;
      }
      return option.germanLabel;
    }
  }
  return value;
}

/**
 * Expand wizard step keys for missing-key validation.
 * Steps with subSteps (like "atmosphere") are expanded to their sub-step keys
 * (e.g., "style", "viewpoint", "time") since those are the actual selection keys.
 */
function getKitchenLayoutLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const opt = kitchenLayoutOptions.find((o) => o.value === value);
  if (!opt) return value;
  if (PROMPT_LANGUAGE === "en" && opt.englishLabel) return opt.englishLabel;
  return opt.germanLabel;
}

function getSelectionKeys(): (keyof WizardState["selectedOptions"])[] {
  const keys: (keyof WizardState["selectedOptions"])[] = [];
  for (const step of wizardSteps) {
    if (step.subSteps) {
      // Expand merged step into its sub-keys
      for (const subKey of Object.keys(step.subSteps)) {
        keys.push(subKey as keyof WizardState["selectedOptions"]);
      }
    } else {
      keys.push(step.key as keyof WizardState["selectedOptions"]);
    }
  }
  return keys;
}

/**
 * Expanded viewpoint descriptions for FLUX T5 encoder.
 * Rich photographic framing language gets significantly more attention from
 * the text encoder than terse 3-6 word phrases buried in the subject line.
 */
const VIEWPOINT_DESCRIPTIONS: Record<string, string> = {
  "eye level shot":
    "Eye level perspective, camera at standing height approximately 150cm, natural horizontal viewing angle with a straight-on composition.",
  "low angle shot, worm's eye view":
    "Low angle perspective, camera positioned below waist height looking upward, emphasizing ceiling height and vertical proportions of the cabinetry.",
  "high angle shot, bird's eye view":
    "High angle overhead perspective, camera elevated above head height angled downward, revealing countertops and room layout from above.",
  "dutch angle, tilted frame":
    "Dutch angle composition with the camera intentionally tilted 20 degrees from the horizontal axis, creating a dramatic diagonal horizon line across the entire frame, the vertical lines of walls and cabinets run diagonally.",
  "wide shot, long shot, establishing shot":
    "Wide establishing shot capturing the full room from wall to wall, camera pulled back with a wide-angle lens to show the complete interior space.",
  "medium shot, mid shot":
    "Medium shot framing the primary furniture grouping at a comfortable distance, balanced composition showing cabinets and their surrounding context.",
  "close-up shot":
    "Close-up shot of cabinet details and surfaces, camera positioned close to highlight material textures and hardware, shallow depth of field.",
  "full room view, interior panorama":
    "Full panoramic room view with ultra-wide framing from corner to corner, comprehensive interior overview showing floor walls and ceiling in a single frame.",
  "extreme close-up, detail shot, macro":
    "Extreme close-up macro detail shot of surface textures and handle hardware, very shallow depth of field with soft background blur.",
};

/**
 * Expanded color descriptions for the 6 basic color options.
 * Keys match the lowercase englishLabel values from wizardSteps.tsx.
 */
const COLOR_DESCRIPTIONS: Record<string, string> = {
  "black":
    "Rich matte black cabinet fronts, deep black cabinetry surfaces with dark monochromatic color scheme.",
  "red":
    "Bold red cabinet fronts, vibrant red lacquer cabinetry surfaces with striking red tones.",
  "burgundy red":
    "Deep burgundy red cabinet fronts, rich wine-red cabinetry surfaces with warm dark undertones.",
  "white":
    "Clean white cabinet fronts, bright white cabinetry surfaces with crisp monochromatic palette.",
  "wood":
    "Natural wood cabinet fronts, warm light wood grain cabinetry surfaces with visible natural grain texture.",
  "dark wood":
    "Dark stained wood cabinet fronts, deep brown wood grain cabinetry surfaces with rich dark timber finish.",
};

const ACCESSORY_CANONICAL_LABELS: Record<string, string> = {
  "indoor plants, houseplants, potted plants":
    "indoor potted plants",
  "dried flowers, dried botanicals":
    "dried flowers in decorative vases",
  "fresh flowers, flower bouquet in vase":
    "fresh flower bouquet in a vase",
  "hanging plants, trailing plants from ceiling":
    "hanging trailing plants from the ceiling",
  "decorative books, coffee table books":
    "decorative coffee-table books",
  "ceramic vases, decorative pottery":
    "ceramic vases and decorative pottery",
  "copper pots and pans, hanging cookware":
    "copper pots and pans as visible decor",
  "candles, decorative candles, candlesticks":
    "decorative candles and candlesticks",
  "decorative mirror, wall mirror":
    "decorative wall mirror",
  "breakfast food on kitchen table, fresh croissants, coffee cups, fruit bowl, morning breakfast setting":
    "styled table setting with croissants, coffee cups, and a fruit bowl",
};

type TimeOfDaySpec = {
  label: string;
  description: string;
  lock: string;
};

const TIME_OF_DAY_SPECS: Record<string, TimeOfDaySpec> = {
  "early morning, dawn light, first light of day": {
    label: "early morning",
    description:
      "Early morning dawn lighting with low sun angle, cool bluish ambient fill, soft warm sunrise rim highlights, and long gentle shadows across the room.",
    lock:
      "The image must read unmistakably as early morning at first glance, never as midday, afternoon, or night.",
  },
  "late morning, mid-morning sunlight": {
    label: "late morning",
    description:
      "Late-morning daylight with clear but still soft sun, neutral-warm brightness, and defined natural shadows from windows without harsh noon contrast.",
    lock:
      "The image must clearly feel like late morning and not afternoon golden hour or evening.",
  },
  "noon, midday, high sun, harsh shadows": {
    label: "noon",
    description:
      "Midday lighting with high sun position, bright high-intensity daylight, crisp hard-edged shadows, and strong contrast on horizontal surfaces.",
    lock:
      "The scene must be unmistakably midday with strong top-down daylight, not soft morning or evening light.",
  },
  "afternoon, warm afternoon light": {
    label: "afternoon",
    description:
      "Warm afternoon light with sun from a medium-low angle, slightly golden highlights, and softer elongated shadows than noon.",
    lock:
      "The final image must read as warm afternoon light, not neutral midday and not evening.",
  },
  "golden hour, magic hour, warm orange sunlight": {
    label: "golden hour",
    description:
      "Golden-hour lighting with strong warm amber-orange sunlight, dramatic long shadows, warm directional glow, and cinematic contrast between lit and shaded areas.",
    lock:
      "Golden hour must dominate the mood immediately and visually, with clearly warm low-angle sunlight.",
  },
  "dusk, twilight, blue hour": {
    label: "dusk / blue hour",
    description:
      "Blue-hour twilight with cool blue ambient exterior light, lowered daylight intensity, and subtle transition toward artificial interior illumination.",
    lock:
      "The scene must clearly read as dusk/blue hour and not daytime; cool twilight ambience is mandatory.",
  },
  "evening, interior lighting, ambient lamps": {
    label: "evening",
    description:
      "Evening ambiance with dim cool exterior light and clearly visible warm practical interior lighting from lamps and fixtures, creating layered pools of light and soft long shadows.",
    lock:
      "Evening mood is highest priority: the result must instantly read as evening with dominant warm interior lighting against darker surroundings.",
  },
  "night, nighttime, dark exterior, interior lights glowing": {
    label: "night",
    description:
      "Night scene with dark exterior, minimal natural light, strong interior glow from artificial light sources, and high contrast between illuminated furniture and dark background zones.",
    lock:
      "The image must be unmistakably nighttime with dark exterior context and visible interior light glow.",
  },
};

const TIME_OF_DAY_BRIEF: Record<string, string> = {
  "early morning, dawn light, first light of day":
    "early morning dawn lighting with low-angle sunlight and long soft shadows",
  "late morning, mid-morning sunlight":
    "late-morning sunlight with clean natural brightness and gentle directional shadows",
  "noon, midday, high sun, harsh shadows":
    "midday high-sun lighting with crisp hard shadows and strong contrast",
  "afternoon, warm afternoon light":
    "warm afternoon light with medium-low sun angle and gently elongated shadows",
  "golden hour, magic hour, warm orange sunlight":
    "golden-hour amber sunlight with dramatic long shadows and warm cinematic contrast",
  "dusk, twilight, blue hour":
    "blue-hour twilight ambiance with cool ambient light and subtle interior illumination",
  "evening, interior lighting, ambient lamps":
    "evening ambiance with warm practical interior lighting and darker surroundings",
  "night, nighttime, dark exterior, interior lights glowing":
    "nighttime scene with dark exterior context and clear warm interior light glow",
};

function capitalize(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

function getTimeOfDaySpec(time?: string): TimeOfDaySpec | undefined {
  if (!time) return undefined;
  return (
    TIME_OF_DAY_SPECS[time] ?? {
      label: time,
      description: `${capitalize(time)}.`,
      lock: `Time-of-day selection "${time}" must be clearly visible in the final image.`,
    }
  );
}

function normalizeAccessories(
  accessories?: WizardState["selectedOptions"]["accessories"]
): string[] {
  if (!accessories) return [];
  if (Array.isArray(accessories)) return accessories;
  return Object.keys(accessories).filter(
    (key) => (accessories as Record<string, boolean>)[key]
  );
}

function normalizeAccessoryDescriptor(accessory: string): string {
  return ACCESSORY_CANONICAL_LABELS[accessory] ?? accessory;
}

function getPrimaryViewpointLabel(viewpoint: string): string {
  const [first] = viewpoint.split(",");
  return (first ?? viewpoint).trim();
}

/**
 * Handle prompt captions from training metadata can contain global scene traits
 * (e.g. front color or lighting) that conflict with explicit user selections.
 * Strip those scene-wide cues and keep hardware-specific descriptors only.
 */
function sanitizeHandlePromptCaption(caption: string): string {
  return caption
    .replace(
      /\ba modern Rotpunkt kitchen featuring Buster and Punch hardware,\s*/gi,
      ""
    )
    .replace(
      /\bcontemporary kitchen interior design with warm lighting and decorative elements\b/gi,
      ""
    )
    .replace(
      /\bdark matte kitchen fronts? with\s*/gi,
      ""
    )
    .replace(
      /\bon Rotpunkt kitchen cabinet fronts?\b/gi,
      ""
    )
    .replace(
      /\bon Rotpunkt cabinet fronts?\b/gi,
      ""
    )
    .replace(/\bwith warm lighting\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/,\s*,/g, ",")
    .trim()
    .replace(/^[,.\s]+|[,.\s]+$/g, "");
}

function buildReferenceTag(
  prefix: string,
  value: string | undefined
): string {
  return `${prefix}=${value ?? "n/a"}`;
}

/**
 * Replace "kitchen" references in handle promptCaptions for non-kitchen rooms.
 * All 97 handle entries contain "kitchen" which contradicts the non-kitchen
 * opening text and confuses the model into generating kitchen elements.
 * Ordered from most-specific to least-specific to prevent double replacement.
 */
function contextualizeHandleCaption(
  caption: string,
  isKitchen: boolean
): string {
  if (isKitchen) return caption;
  return caption
    .replace(/\bkitchen cabinet fronts?\b/gi, "cabinet fronts")
    .replace(/\bkitchen drawer fronts?\b/gi, "drawer fronts")
    .replace(/\bkitchen fronts?\b/gi, "furniture fronts")
    .replace(/\bkitchen design\b/gi, "interior design")
    .replace(/\bkitchen interior design\b/gi, "interior design")
    .replace(/\bkitchen interior\b/gi, "interior")
    .replace(/\bkitchen featuring\b/gi, "interior featuring")
    .replace(/\bkitchen\b/gi, "furniture");
}

export function buildPrompt({
  selections,
  extraWishes,
}: {
  selections: WizardState["selectedOptions"];
  extraWishes?: string;
}): PromptBuildResult {
  const missingKeys = getSelectionKeys()
    .filter((key) => {
      // Multi-select steps (e.g. accessories) are optional — zero selections allowed
      const step = wizardSteps.find((s) => s.key === key);
      if (step?.multiSelect) return false;
      return !selections[key];
    });

  const sections: string[] = [];

  // Resolve all selections
  const kind = getLabel("kind", selections.kind);
  const isKitchenRoom = selections.kind === "kueche";
  const isLivingRoom = selections.kind === "wohnzimmer";
  const style = getLabel("style", selections.style);
  const colorSelection = selections.color;
  const isFenix = isFenixColorValue(colorSelection);
  const isFrontfarbe = isFrontfarbenColorValue(colorSelection);
  const fenixColor = isFenix ? getFenixColorByValue(colorSelection) : undefined;
  const frontfarbe = isFrontfarbe
    ? getFrontfarbenColorByValue(colorSelection)
    : undefined;
  const colorLabel =
    !isFenix && !isFrontfarbe ? getLabel("color", colorSelection) : undefined;
  const environment = getLabel("environment", selections.environment);
  const time = selections.time;
  const timeSpec = getTimeOfDaySpec(time);
  const handleSelection = getHandlePromptDescriptor(selections.handle);
  const handleEntry = getHandleSelectionByValue(selections.handle);
  const viewpoint = selections.viewpoint || "eye level shot";
  const floor = selections.floor;
  const accessoriesArray = normalizeAccessories(selections.accessories);
  const normalizedAccessories = accessoriesArray.map(normalizeAccessoryDescriptor);

  // 1. Opening + Subject & Style as natural language
  let opening = isKitchenRoom
    ? "Photorealistic Rotpunkt kitchen visualization, designed by an award-winning interior architect."
    : isLivingRoom
      ? "Photorealistic Rotpunkt living room visualization, designed by an award-winning interior architect. Showcasing Rotpunkt living-room cabinetry and built-in storage furniture in a residential living space."
      : "Photorealistic Rotpunkt interior visualization, designed by an award-winning interior architect. Showcasing Rotpunkt cabinetry and built-in furniture in a residential setting, not a kitchen.";
  const kitchenLayoutLabel = getKitchenLayoutLabel(selections.kitchenLook);
  // When kind is "kitchen" and a layout is selected, use the layout-specific phrasing
  const effectiveKind = (kind === "kitchen" || selections.kind === "kueche") && kitchenLayoutLabel
    ? kitchenLayoutLabel
    : kind;
  const subjectParts: string[] = [];
  if (effectiveKind && style) {
    subjectParts.push(`A ${style} ${effectiveKind}`);
  } else if (effectiveKind) {
    subjectParts.push(`A ${effectiveKind}`);
  } else if (style) {
    subjectParts.push(`${style} style`);
  }
  if (environment) {
    subjectParts.push(`in a ${environment}`);
  }
  if (subjectParts.length > 0) {
    opening += ` ${subjectParts.join(" ")}.`;
  }
  sections.push(opening);

  const selectionLock: string[] = [];
  if (environment) selectionLock.push(`Environment: ${environment}`);
  if (effectiveKind) selectionLock.push(`Room concept: ${effectiveKind}`);
  if (selections.kitchenLook && kitchenLayoutLabel) {
    selectionLock.push(`Kitchen layout: ${kitchenLayoutLabel}`);
  }
  if (style) selectionLock.push(`Style: ${style}`);
  if (timeSpec) selectionLock.push(`Time of day: ${timeSpec.label}`);
  selectionLock.push(`Camera perspective: ${viewpoint}`);
  if (floor) selectionLock.push(`Flooring: ${floor}`);
  if (handleEntry) selectionLock.push(`Handle selection: ${handleEntry.labelEn}`);
  if (normalizedAccessories.length > 0) {
    selectionLock.push(`Accessories selected: ${normalizedAccessories.length}`);
  }
  if (selectionLock.length > 0) {
    sections.push(
      `Critical adherence requirement: all selected configuration choices must be visible together in one coherent scene. Mandatory selection lock: ${selectionLock.join(
        "; "
      )}.`
    );
    sections.push(
      "Conflict resolution rule: if any auxiliary descriptor conflicts with the mandatory selection lock, always prioritize the selection lock."
    );
  }

  // 2. Time of day & lighting (highest priority)
  if (timeSpec) {
    sections.push(
      `Time of day and lighting (highest priority): ${timeSpec.description}`
    );
    sections.push(`Time-of-day lock: ${timeSpec.lock}`);
  }

  // 3. Camera & Composition (dedicated section for T5 attention priority)
  const expandedViewpoint =
    VIEWPOINT_DESCRIPTIONS[viewpoint] ??
    `${capitalize(viewpoint)}.`;
  sections.push(expandedViewpoint);

  // 4. Colors & Materials (natural language, no labels)
  const fenixDesc = PROMPT_LANGUAGE === "en"
    ? fenixColor?.englishDescription
    : fenixColor?.description;
  let colorSelectionSummary: string | undefined;

  if (isFenix && fenixColor) {
    colorSelectionSummary = `FENIX ${fenixColor.name} (${fenixColor.hex})`;
    sections.push(
      `Furniture surfaces in ${fenixDesc}, FENIX ${fenixColor.name} (${fenixColor.hex}).`
    );
  } else if (isFrontfarbe && frontfarbe) {
    const frontfarbeLabel =
      PROMPT_LANGUAGE === "en" ? frontfarbe.labelEn : frontfarbe.labelDe;
    const frontfarbeMaterial =
      PROMPT_LANGUAGE === "en"
        ? frontfarbe.materialTypeEn
        : frontfarbe.materialTypeDe;
    colorSelectionSummary = `${frontfarbeLabel} (${frontfarbe.id}, ${frontfarbeMaterial})`;
    sections.push(
      `Front color "${frontfarbeLabel}" (Catalog ${frontfarbe.id}, ${frontfarbeMaterial}).`
    );
  } else if (colorLabel) {
    colorSelectionSummary = colorLabel;
    const expandedColor =
      COLOR_DESCRIPTIONS[colorLabel.toLowerCase()] ??
      `${colorLabel} color palette.`;
    sections.push(expandedColor);
  }

  if (colorSelectionSummary) {
    sections.push(`Color lock: keep the selected color direction "${colorSelectionSummary}" clearly dominant.`);
  }

  // 5. Flooring
  if (floor) {
    sections.push(`${floor[0].toUpperCase() + floor.slice(1)}.`);
  }

  // 6. Hardware — inject training-caption-derived description for FLUX grounding
  if (handleSelection) {
    const prefix =
      handleSelection.category === "handleless"
        ? "Handle design"
        : "Handle hardware";
    const caption = contextualizeHandleCaption(
      handleSelection.promptCaption,
      isKitchenRoom
    );
    const sanitizedCaption = sanitizeHandlePromptCaption(caption);
    const fallbackHandleLabel = handleEntry?.labelEn;
    const handleDescriptor = sanitizedCaption || fallbackHandleLabel || caption;
    sections.push(`${prefix}: ${handleDescriptor}.`);
    if (handleEntry) {
      sections.push(
        `Training handle reference lock: ${buildReferenceTag(
          "HANDLE_REF_ID",
          handleEntry.id
        )}; ${buildReferenceTag(
          "HANDLE_REF_CATEGORY",
          handleEntry.category
        )}; ${buildReferenceTag("HANDLE_REF_LABEL", handleEntry.labelEn)}.`
      );
    }
    sections.push(
      "Hardware lock: transfer only handle geometry and metal/finish from the handle reference. Do not transfer conflicting cabinet color, material, or global lighting from handle metadata."
    );
    sections.push(
      "Handle enforcement rule: the selected handle/grip must be clearly identifiable by silhouette, profile, mounting style, and finish family."
    );
  }

  // 7. Front Reference (training caption verbatim — always English as trained)
  if (frontfarbe) {
    sections.push(
      `Training front reference lock: ${buildReferenceTag(
        "FRONT_REF_ID",
        frontfarbe.id
      )}; ${buildReferenceTag(
        "FRONT_REF_MATERIAL",
        frontfarbe.materialTypeEn
      )}; ${buildReferenceTag(
        "FRONT_REF_SUBCATEGORY",
        frontfarbe.subcategory
      )}; ${buildReferenceTag("FRONT_REF_LABEL", frontfarbe.labelEn)}.`
    );
    sections.push(
      `Front caption anchor (verbatim): ${frontfarbe.trainingCaption}.`
    );
    sections.push(
      "Front enforcement rule: keep this exact front reference identity and finish family. Do not substitute another front, material class, or gloss level."
    );
  }

  if (frontfarbe && handleEntry) {
    sections.push(
      `Cross-reference lock: render ${buildReferenceTag(
        "HANDLE_REF_ID",
        handleEntry.id
      )} together with ${buildReferenceTag(
        "FRONT_REF_ID",
        frontfarbe.id
      )} in the same coherent view without changing either identity.`
    );
  }

  // 8. Glossy emphasis for high-gloss lacquer fronts
  if (frontfarbe && (frontfarbe.subcategory === "HL" || frontfarbe.subcategory === "LX")) {
    sections.push(
      "Ultra high-gloss reflective lacquer finish, mirror-like surface with sharp light reflections, polished to a glass-like sheen."
    );
  }

  // 9. Accessories / Decor
  if (normalizedAccessories.length > 0) {
    sections.push(
      `Accessories to include and keep visible: ${normalizedAccessories.join(", ")}.`
    );
  }

  // 10. Technical Requirements (positive phrasing — FLUX ignores negative prompts)
  if (isKitchenRoom) {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the countertop edge. Each handle centered on its own individual door panel near the opening edge, handles never span across the gap between two adjacent doors. Exactly one sink with a single faucet, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt kitchen design language."
    );
  } else if (isLivingRoom) {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the floor. Each handle centered on its own individual door panel near the opening edge, handles never span across the gap between two adjacent doors. Rotpunkt living-room cabinetry and storage furniture design language, with clear living-room cabinet proportions and styling. No kitchen appliances, no faucets, and no ovens visible. Residential living room aesthetic, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt furniture design language."
    );
  } else {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the floor. Each handle centered on its own individual door panel near the opening edge, handles never span across the gap between two adjacent doors. Rotpunkt furniture and cabinetry only, absolutely no kitchen appliances, no sink, no faucet, no oven, no cooktop, no range hood visible. Residential furniture showroom aesthetic, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt furniture design language."
    );
  }

  // 11. User Wishes
  const wishes = extraWishes?.trim();
  if (wishes) {
    sections.push(`${wishes}.`);
  }

  // 12. Final adherence reminder
  sections.push(
    "Final adherence priority: do not average out or ignore selected options. Keep every selected choice explicit, and make the chosen time-of-day lighting immediately recognizable."
  );

  const debugSections = [...sections];
  const debugPrompt = debugSections.join(" ");

  // V2 model-facing prompt: shorter, positive, and priority-ordered.
  const modelSections: string[] = [];

  const roomLabel =
    effectiveKind ??
    (isKitchenRoom ? "kitchen" : isLivingRoom ? "living room" : "interior");
  const timeBrief = time ? TIME_OF_DAY_BRIEF[time] : undefined;
  const sceneIntroParts = [
    `Photorealistic Rotpunkt ${roomLabel} with cabinetry and built-in furniture as the main subject`,
  ];
  if (style) sceneIntroParts.push(`${style} style`);
  if (environment) sceneIntroParts.push(`in a ${environment}`);
  if (timeBrief) sceneIntroParts.push(timeBrief);
  modelSections.push(`${sceneIntroParts.join(", ")}.`);

  if (timeBrief) {
    modelSections.push(
      `Lighting priority: ${timeBrief}; the selected time of day must read immediately.`
    );
  } else if (timeSpec) {
    modelSections.push(
      `Lighting priority: ${timeSpec.description}`
    );
  }

  const primaryViewpoint = getPrimaryViewpointLabel(viewpoint);
  const compositionParts = [`Camera perspective: ${primaryViewpoint}.`];
  if (floor) compositionParts.push(`Flooring: ${floor}.`);
  modelSections.push(compositionParts.join(" "));

  if (isFenix && fenixColor) {
    modelSections.push(
      `Front color direction: FENIX ${fenixColor.name} (${fenixColor.hex}), clearly dominant across visible cabinet fronts.`
    );
  } else if (isFrontfarbe && frontfarbe) {
    const frontfarbeLabel =
      PROMPT_LANGUAGE === "en" ? frontfarbe.labelEn : frontfarbe.labelDe;
    modelSections.push(
      `Cabinet front reference: exact ${frontfarbeLabel} (${frontfarbe.id}, ${frontfarbe.materialTypeEn}, ${frontfarbe.subcategory}); keep this exact front identity dominant.`
    );
    if (frontfarbe.subcategory === "HL" || frontfarbe.subcategory === "LX") {
      modelSections.push(
        "Surface finish: ultra high-gloss lacquer with clean mirror-like reflections."
      );
    }
  } else if (colorLabel) {
    modelSections.push(
      `Front color direction: ${colorLabel}, clearly dominant across visible cabinet fronts.`
    );
  }

  if (handleEntry) {
    modelSections.push(
      `Handle reference: ${handleEntry.labelEn} (${handleEntry.id}); keep handle silhouette, profile, mounting style, and finish family clearly identifiable.`
    );
  } else if (handleSelection) {
    modelSections.push(
      "Selected handle/grip must stay clearly identifiable by shape, mounting style, and finish."
    );
  }

  if (isKitchenRoom) {
    if (kitchenLayoutLabel) {
      modelSections.push(
        `Kitchen layout: ${kitchenLayoutLabel} with Rotpunkt kitchen cabinetry as the hero furniture.`
      );
    } else {
      modelSections.push(
        "Kitchen scene with Rotpunkt kitchen cabinetry as the hero furniture."
      );
    }
    modelSections.push("Exactly one sink with one faucet.");
  } else if (isLivingRoom) {
    modelSections.push(
      "Living-room furniture focus: built-in storage wall, sideboards, and cabinet compositions that read immediately as living-room cabinetry."
    );
    modelSections.push(
      "Keep the scene free of kitchen appliances, faucets, and ovens."
    );
  } else {
    modelSections.push(
      "Residential Rotpunkt furniture focus with cabinetry and storage compositions that read as non-kitchen interior furniture."
    );
    modelSections.push(
      "Keep the scene free of kitchen appliances, sinks, faucets, ovens, cooktops, and range hoods."
    );
  }

  const cappedAccessories = normalizedAccessories.slice(0, 5);
  if (cappedAccessories.length > 0) {
    modelSections.push(
      `Visible accessories: ${cappedAccessories.join(", ")}.`
    );
  }

  const modelWishes = extraWishes?.trim();
  if (modelWishes) {
    modelSections.push(`User wishes: ${modelWishes}.`);
  }

  modelSections.push(
    "All selected choices must be visible together in one coherent scene with consistent materials and physically plausible lighting."
  );

  const modelPrompt = modelSections.join(" ");
  const prompt = PROMPT_PIPELINE_V2_ENABLED ? modelPrompt : debugPrompt;
  const uiSections = PROMPT_PIPELINE_V2_ENABLED ? modelSections : debugSections;

  return {
    prompt,
    modelPrompt,
    modelSections,
    debugPrompt,
    debugSections,
    sections: uiSections,
    missingKeys,
    isKitchenRoom,
  };
}
