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
  prompt: string;
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

  // 1. Opening + Subject & Style as natural language
  let opening = isKitchenRoom
    ? "Photorealistic Rotpunkt kitchen visualization, designed by an award-winning interior architect."
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
  if (accessoriesArray.length > 0) {
    selectionLock.push(`Accessories: ${accessoriesArray.join(", ")}`);
  }
  if (selectionLock.length > 0) {
    sections.push(
      `Critical adherence requirement: all selected configuration choices must be visible together in one coherent scene. Mandatory selection lock: ${selectionLock.join(
        "; "
      )}.`
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
    const prefix = handleSelection.category === "handleless" ? "Handle design" : "Handle hardware";
    const caption = contextualizeHandleCaption(handleSelection.promptCaption, isKitchenRoom);
    sections.push(`${prefix}: ${caption}.`);
  }

  // 7. Front Reference (training caption verbatim — always English as trained)
  if (frontfarbe) {
    sections.push(
      `Exact front reference: ${frontfarbe.trainingCaption}.`
    );
  }

  // 8. Glossy emphasis for high-gloss lacquer fronts
  if (frontfarbe && (frontfarbe.subcategory === "HL" || frontfarbe.subcategory === "LX")) {
    sections.push(
      "Ultra high-gloss reflective lacquer finish, mirror-like surface with sharp light reflections, polished to a glass-like sheen."
    );
  }

  // 9. Accessories / Decor
  if (accessoriesArray.length > 0) {
    sections.push(`${accessoriesArray.join(", ")}.`);
  }

  // 10. Technical Requirements (positive phrasing — FLUX ignores negative prompts)
  if (isKitchenRoom) {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the countertop edge. Each handle centered on its own individual door panel near the opening edge, handles never span across the gap between two adjacent doors. Exactly one sink with a single faucet, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt kitchen design language."
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

  const prompt = sections.join(" ");

  return {
    prompt,
    sections,
    missingKeys,
    isKitchenRoom,
  };
}
