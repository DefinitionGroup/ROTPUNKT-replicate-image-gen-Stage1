import type { WizardState } from "@/app/store/wizardStore";
import { wizardSteps, kitchenLayoutOptions } from "./wizardSteps";
import {
  getFenixColorByValue,
  isFenixColorValue,
  type FenixColor,
} from "./fenixColors";
import {
  encodeFrontfarbenColorValue,
  getFrontfarbenColorByValue,
  isFrontfarbenColorValue,
  type FrontfarbenCatalogEntry,
} from "./frontfarbenCatalog";
import {
  getHandlePromptDescriptor,
  getHandleSelectionByValue,
  type HandleCatalogEntry,
  type HandleGeometrySpec,
} from "./handleCatalog";
import {
  COOKING_ZONE_TOPOLOGY_LEAD,
  LEGACY_KITCHEN_WET_ZONE_MARKER,
  MODEL_PROMPT_WORD_BUDGET,
  PROMPT_VERSION,
  WET_ZONE_TOPOLOGY_LEAD,
  countPromptWords,
  type GenerationQualityExpectations,
  type GenerationRequestSpec,
} from "@/lib/imageGenerationContract";
import {
  DEFAULT_VIEWPOINT,
  normalizeViewpoint,
} from "./viewpointConfig";
import {
  kitchenZoneOptions,
  resolveKitchenZones,
  type ResolvedKitchenZones,
} from "./kitchenZones";

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
  promptVersion: typeof PROMPT_VERSION | "legacy-debug";
  wordCount: number;
  budgetExceeded: boolean;
  omittedModelSections: string[];
  qualityExpectations: GenerationQualityExpectations;
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
    "Architectural camera at natural standing eye height, 150cm above the floor, with a level horizon and straight-on composition.",
  "low angle shot, worm's eye view":
    "Low-angle architectural camera 70cm above the floor and tilted 12 degrees upward, emphasizing cabinet height and vertical proportions.",
  "high angle shot, bird's eye view":
    "Elevated oblique bird's-eye camera, aimed 50 degrees downward (range 45-60). Never vertical or 90-degree overhead; retain readable worktops, fronts, handles, and layout.",
  "dutch angle, tilted frame":
    "Creative Dutch angle: camera rolled 12 degrees, with a deliberate diagonal horizon, cabinet lines, and wall lines.",
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

const TIME_OF_DAY_EXTERIOR_LOCKS: Record<string, string> = {
  "early morning, dawn light, first light of day":
    "Exterior view push: the outdoor environment through windows must be clearly visible and strongly time-matched to early morning, with cool dawn sky brightness and a subtle warm sunrise tint near the horizon.",
  "late morning, mid-morning sunlight":
    "Exterior view push: the outdoor environment through windows must be strongly visible with clear bright late-morning daylight and unmistakable daytime sky cues.",
  "noon, midday, high sun, harsh shadows":
    "Exterior view push: the outdoor environment through windows must be strongly visible with intense bright midday sky and high daylight contrast.",
  "afternoon, warm afternoon light":
    "Exterior view push: the outdoor environment through windows must be strongly visible with warm afternoon daylight and clear sunlit exterior cues.",
  "golden hour, magic hour, warm orange sunlight":
    "Exterior view push: the outdoor environment through windows must be strongly visible with pronounced red-orange sunset hues and low-angle golden light.",
  "dusk, twilight, blue hour":
    "Exterior view push: the outdoor environment must clearly read as dim blue twilight, visibly darker than daytime while still legible through windows.",
  "evening, interior lighting, ambient lamps":
    "Exterior view push: the outdoor environment must read as dark evening; outside should be noticeably dark, with a remaining reddish sunset glow only where sky is visible.",
  "night, nighttime, dark exterior, interior lights glowing":
    "Exterior view push: the outdoor environment must read as near-black night with only minimal distant ambient light points.",
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

function getExteriorTimeLock(time?: string): string | undefined {
  if (!time) return undefined;
  return (
    TIME_OF_DAY_EXTERIOR_LOCKS[time] ??
    `Exterior view push: keep the outside environment clearly visible through windows and tightly matched to "${time}".`
  );
}

const VIEWPOINT_SCENE_INTROS: Record<string, string> = {
  "eye level shot":
    "Photorealistic architectural interior photo of Rotpunkt {room} cabinetry and built-in furniture",
  "low angle shot, worm's eye view":
    "Photorealistic low-angle architectural interior photo of Rotpunkt {room} cabinetry",
  "high angle shot, bird's eye view":
    "Photorealistic elevated oblique bird's-eye architectural interior photo of Rotpunkt {room} cabinetry",
  "dutch angle, tilted frame":
    "Photorealistic tilted architectural interior photo of Rotpunkt {room} cabinetry",
  "wide shot, long shot, establishing shot":
    "Photorealistic wide architectural interior view of a Rotpunkt {room}",
  "medium shot, mid shot":
    "Photorealistic architectural interior shot of the main Rotpunkt {room} cabinet composition",
  "close-up shot":
    "Photorealistic architectural detail shot of Rotpunkt {room} cabinetry, focused on cabinet fronts, materials, and handle hardware",
  "full room view, interior panorama":
    "Photorealistic full-room architectural interior view of a Rotpunkt {room}",
  "extreme close-up, detail shot, macro":
    "Photorealistic macro architectural detail shot of Rotpunkt {room} cabinetry, focused on surface texture, finish, and handle detail",
};

const VIEWPOINT_PRIORITY_LINES: Record<string, string> = {
  "eye level shot":
    "Framing priority: a natural eye-height view with a level horizon and true-to-life room proportions.",
  "low angle shot, worm's eye view":
    "Framing priority: a clearly low viewing position with the cabinet fronts and vertical room proportions emphasized.",
  "high angle shot, bird's eye view":
    "Framing priority: an elevated, oblique 45-to-60-degree bird's-eye view that clearly reveals the worktops, cabinet fronts, handles, and room layout without becoming a plan view.",
  "dutch angle, tilted frame":
    "Framing priority: a deliberately diagonal creative composition; preserve the selected tilt rather than correcting the verticals.",
  "wide shot, long shot, establishing shot":
    "Framing priority: wide room coverage with the full cabinet composition clearly visible.",
  "medium shot, mid shot":
    "Framing priority: mid-distance composition centered on the primary cabinet grouping.",
  "close-up shot":
    "Framing priority: tight detail composition centered on cabinet fronts, materials, and handle hardware.",
  "full room view, interior panorama":
    "Framing priority: full-room panorama with the cabinetry readable within the whole interior.",
  "extreme close-up, detail shot, macro":
    "Framing priority: macro detail composition centered on surface texture, finish, and handle geometry.",
};

const VIEWPOINT_CAMERA_TREATMENTS: Record<string, string> = {
  "eye level shot":
    "32mm tilt-shift lens at f/8, corrected verticals, realistic proportions.",
  "low angle shot, worm's eye view":
    "24mm architectural lens at f/8, low position, controlled vertical convergence.",
  "high angle shot, bird's eye view":
    "32mm tilt-shift lens at f/8, obliquely aimed 50 degrees downward, never vertically aligned to the floor.",
  "dutch angle, tilted frame":
    "28mm lens at f/8, deliberate 12-degree roll; retain the diagonal composition.",
  "wide shot, long shot, establishing shot":
    "20mm tilt-shift lens at f/8, wide coverage, corrected verticals, no fisheye.",
  "medium shot, mid shot":
    "40mm lens at f/8, balanced mid-distance framing and natural cabinet geometry.",
  "close-up shot":
    "65mm detail lens, selected material and hardware in controlled shallow depth of field.",
  "full room view, interior panorama":
    "18mm ultra-wide lens at f/8, full-room coverage, corrected verticals, no fisheye.",
  "extreme close-up, detail shot, macro":
    "100mm macro lens, precise focus on the selected detail, shallow depth, true-to-scale hardware.",
};

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

function getModelSceneIntro({
  viewpoint,
  roomLabel,
  style,
  environment,
  timeBrief,
}: {
  viewpoint: string;
  roomLabel: string;
  style?: string;
  environment?: string;
  timeBrief?: string;
}) {
  const template =
    VIEWPOINT_SCENE_INTROS[viewpoint] ??
    "Photorealistic architectural interior photo of Rotpunkt {room} cabinetry and built-in furniture";
  const introParts = [template.replace("{room}", roomLabel)];
  if (style) introParts.push(`${style} style`);
  if (environment) introParts.push(`in a ${environment}`);
  if (timeBrief) introParts.push(timeBrief);
  return `${introParts.join(", ")}.`;
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
    .replace(/\ba detail photograph showing\s*/gi, "")
    .replace(/\bmultiple\s+/gi, "")
    .replace(
      /\bfour handles visible in diagonal perspective on stacked white drawers with black stone countertop\b/gi,
      ""
    )
    .replace(
      /\bon white Rotpunkt kitchen drawer fronts?\b/gi,
      ""
    )
    .replace(
      /\bon (?:a )?white Rotpunkt kitchen cabinet fronts?\b/gi,
      ""
    )
    .replace(
      /\bdark teal-green Rotpunkt kitchen cabinet fronts?\b/gi,
      ""
    )
    .replace(/\bdark charcoal-black cabinet front\b/gi, "")
    .replace(/\bdark blue-black cabinet front\b/gi, "")
    .replace(/\bwhite countertop edge visible above\b/gi, "")
    .replace(/\bwhite countertop above dark cabinets\b/gi, "")
    .replace(
      /\bon Rotpunkt kitchen cabinet fronts?\b/gi,
      ""
    )
    .replace(
      /\bon Rotpunkt cabinet fronts?\b/gi,
      ""
    )
    .replace(/\bwith warm lighting\b/gi, "")
    .replace(/\ba (?:close-up|macro|detail|product|lifestyle) photograph of\b/gi, "")
    .replace(/\b(?:professional|studio|close-up) product photography\b/gi, "")
    .replace(/\bisolated on (?:a )?white background\b/gi, "")
    .replace(/\bagainst (?:a )?white background\b/gi, "")
    .replace(/\b(?:industrial-luxury|industrial-modern) (?:kitchen )?design aesthetic\b/gi, "")
    .replace(/\bmodern minimalist kitchen design\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/,\s*,/g, ",")
    .trim()
    .replace(/^[,.\s]+|[,.\s]+$/g, "");
}

function compactDescriptor(value: string, maxWords = 24): string {
  const clauses = value
    .split(",")
    .map((clause) => clause.trim())
    .filter(Boolean);
  const selected: string[] = [];

  for (const clause of clauses) {
    const candidate = [...selected, clause].join(", ");
    if (countPromptWords(candidate) > maxWords) break;
    selected.push(clause);
  }

  if (selected.length > 0) return selected.join(", ");
  return value.trim().split(/\s+/).slice(0, maxWords).join(" ");
}

function buildHandleModelSections({
  entry,
  geometry,
  promptCaption,
  isKitchen,
}: {
  entry: HandleCatalogEntry;
  geometry: HandleGeometrySpec;
  promptCaption: string;
  isKitchen: boolean;
}): string[] {
  const contextualCaption = contextualizeHandleCaption(
    promptCaption,
    isKitchen
  );
  const sanitizedCaption = sanitizeHandlePromptCaption(contextualCaption);
  const visualTraits = compactDescriptor(
    sanitizedCaption || entry.labelEn || "selected cabinet handle",
    15
  );
  const kind = geometry.kind;

  if (kind === "handleless") {
    return [
      "Opening system: Rotpunkt handleless fronts with a recessed finger-pull channel below the worktop as the only opening detail. Every door and drawer remains an independent panel separated by crisp seams. Cabinet front color and material remain governed by the selected front.",
    ];
  }

  if (kind === "tokyo_grip") {
    return [
      `Opening system: Rotpunkt Tokyo grip milled into each front's top edge as a projecting lip with a curved finger recess. Selected grip reference: ${entry.labelEn}; ${visualTraits}. Each panel has its own contained profile; crisp free seams separate operable fronts. The selected front still governs all broad cabinet-surface color and material.`,
    ];
  }

  const commonMountingRule =
    "Each handle stays entirely within one operable front; crisp free seams separate adjacent doors and drawers. Cabinet color and material come only from the selected front.";
  const hardwareIdentity = `Selected hardware reference: ${entry.labelEn}; visual traits: ${visualTraits}.`;

  if (kind === "t_bar") {
    return [
      `Handle: ${hardwareIdentity} Preserve the T-bar silhouette, profile, backplate, and finish. One central pedestal is fully inside its own front. ${commonMountingRule}`,
    ];
  }

  if (kind === "bar_pull") {
    return [
      `Handle: ${hardwareIdentity} Preserve the bar-pull silhouette, brackets, and finish. Both feet attach to the same front and both ends stop before its edges. ${commonMountingRule}`,
    ];
  }

  if (kind === "knob") {
    return [
      `Handle: ${hardwareIdentity} Preserve the knob silhouette, base, texture, and finish. Its single mounting point is fully inside its own front. ${commonMountingRule}`,
    ];
  }

  return [
    `Handle: ${hardwareIdentity} Preserve its silhouette, mounting style, and finish. ${commonMountingRule}`,
  ];
}

function buildFrontIdentitySection(front: FrontfarbenCatalogEntry): string {
  const visualAnchor = compactDescriptor(front.trainingCaption, 16);
  return `Cabinet fronts: Rotpunkt ${front.labelEn}, catalog ${front.id}, ${front.materialTypeEn}; training visual anchor: ${visualAnchor}. The selected catalog identity governs hue, material, and finish.`;
}

function buildFenixFrontIdentitySection(
  color: FenixColor,
  linkedFront?: FrontfarbenCatalogEntry
): string {
  const materialIdentity = color.isMetallic
    ? "FENIX NTA super-matte real-metal surface with low light reflectivity and delicate diffuse metallic depth"
    : "FENIX super-matte soft-touch surface with low light reflectivity and diffuse, controlled highlights";
  const visualAnchor = linkedFront
    ? ` Training visual anchor: ${compactDescriptor(linkedFront.trainingCaption, 16)}.`
    : "";

  return `Cabinet fronts: FENIX ${color.name} (${color.code}; Rotpunkt catalog ${color.fxId}), ${color.englishDescription}; ${materialIdentity}.${visualAnchor} The selected FENIX identity governs hue, material, and finish across all visible fronts.`;
}

// Sink and cooktop placement come from the structured wizard choice; free-text
// mentions would only compete with it, so those sentences stay out of the model prompt.
function removeCompiledZoneWishes(value: string): string {
  return value
    .split(/(?<=[.!?])\s+/)
    .filter(
      (sentence) =>
        !/\b(sink|basin|faucet|tap|wet zone|spüle|spuelbecken|spülbecken|armatur|wasserhahn|cooktop|hob|stove|kochfeld|herd)\b/i.test(
          sentence
        )
    )
    .join(" ")
    .trim();
}

function getKitchenZoneLabel(value: string): string {
  const opt = kitchenZoneOptions.find((o) => o.value === value);
  if (!opt) return value;
  if (PROMPT_LANGUAGE === "en" && opt.englishLabel) return opt.englishLabel;
  return opt.germanLabel;
}

function buildKitchenFixtureTopology(zones: ResolvedKitchenZones): string {
  const wetZone = `${WET_ZONE_TOPOLOGY_LEAD[zones.sinkLocation]} one undermount sink with a single mixer faucet at its rear edge, spout over the basin.`;
  const cooktopDetail =
    zones.cooktopLocation === "island" && zones.sinkLocation === "island"
      ? "one flush induction hob at the island's far end, amid dry worktop."
      : "one flush induction hob amid dry worktop.";
  const cookingZone = `${COOKING_ZONE_TOPOLOGY_LEAD[zones.cooktopLocation]} ${cooktopDetail}`;
  const closing =
    zones.islandCount === 0
      ? "There is no island; all other worktops stay dry."
      : "All other worktops stay dry.";
  return `${wetZone} ${cookingZone} ${closing}`;
}

type ModelPromptSection = {
  id: string;
  text: string;
  required: boolean;
  priority: number;
};

function buildBudgetedModelPrompt(sections: ModelPromptSection[]) {
  const selectedIds = new Set(
    sections.filter((section) => section.required).map((section) => section.id)
  );
  let selectedWordCount = countPromptWords(
    sections
      .filter((section) => selectedIds.has(section.id))
      .map((section) => section.text)
      .join(" ")
  );

  const optionalSections = sections
    .filter((section) => !section.required)
    .sort((a, b) => b.priority - a.priority);

  for (const section of optionalSections) {
    const sectionWords = countPromptWords(section.text);
    if (selectedWordCount + sectionWords > MODEL_PROMPT_WORD_BUDGET) continue;
    selectedIds.add(section.id);
    selectedWordCount += sectionWords;
  }

  const selectedSections = sections
    .filter((section) => selectedIds.has(section.id))
    .map((section) => section.text);
  const omittedSections = sections
    .filter((section) => !selectedIds.has(section.id))
    .map((section) => section.id);
  const prompt = selectedSections.join(" ");

  return {
    sections: selectedSections,
    prompt,
    wordCount: countPromptWords(prompt),
    budgetExceeded: selectedWordCount > MODEL_PROMPT_WORD_BUDGET,
    omittedSections,
  };
}

function buildReferenceTag(
  prefix: string,
  value: string | undefined
): string {
  return `${prefix}=${value ?? "n/a"}`;
}

/**
 * Replace "kitchen" references in handle promptCaptions for non-kitchen rooms.
 * Catalog captions can contain "kitchen", which contradicts the non-kitchen
 * opening text and can pull kitchen elements into other room types.
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
  pipelineV2Enabled = PROMPT_PIPELINE_V2_ENABLED,
}: {
  selections: WizardState["selectedOptions"];
  extraWishes?: string;
  pipelineV2Enabled?: boolean;
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
  const linkedFenixFront = fenixColor
    ? getFrontfarbenColorByValue(
        encodeFrontfarbenColorValue(fenixColor.fxId)
      )
    : undefined;
  const frontfarbe = isFrontfarbe
    ? getFrontfarbenColorByValue(colorSelection)
    : undefined;
  const colorLabel =
    !isFenix && !isFrontfarbe ? getLabel("color", colorSelection) : undefined;
  const environment = getLabel("environment", selections.environment);
  const time = selections.time;
  const timeSpec = getTimeOfDaySpec(time);
  const exteriorTimeLock = getExteriorTimeLock(time);
  const handleSelection = getHandlePromptDescriptor(selections.handle);
  const handleEntry = getHandleSelectionByValue(selections.handle);
  const viewpoint = normalizeViewpoint(selections.viewpoint) || DEFAULT_VIEWPOINT;
  const floor = selections.floor;
  const accessoriesArray = normalizeAccessories(selections.accessories);
  const normalizedAccessories = accessoriesArray.map(normalizeAccessoryDescriptor);
  const isDetailView =
    viewpoint === "close-up shot" ||
    viewpoint === "extreme close-up, detail shot, macro";
  const isWideView =
    viewpoint === "wide shot, long shot, establishing shot" ||
    viewpoint === "full room view, interior panorama" ||
    viewpoint === "high angle shot, bird's eye view";

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
  const kitchenZones = resolveKitchenZones(selections);
  if (isKitchenRoom) {
    selectionLock.push(
      `Sink: ${getKitchenZoneLabel(kitchenZones.sinkLocation)}`,
      `Cooktop: ${getKitchenZoneLabel(kitchenZones.cooktopLocation)}`
    );
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
  if (exteriorTimeLock) {
    sections.push(exteriorTimeLock);
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
    colorSelectionSummary = `FENIX ${fenixColor.name} (${fenixColor.code})`;
    sections.push(
      `Furniture surfaces in ${fenixDesc}, FENIX ${fenixColor.name} (${fenixColor.code}).`
    );
    sections.push(
      `Color code lock: FENIX code ${fenixColor.code} named "${fenixColor.name}" with the color identity "${fenixDesc}". Keep this exact hue and depth clearly dominant across visible fronts.`
    );
    sections.push(
      fenixColor.isMetallic
        ? "Material lock: FENIX NTA super-matte real-metal surface, low light reflectivity, soft-touch character, and subtle diffuse metallic depth."
        : "Material lock: FENIX super-matte soft-touch surface, very low light reflectivity, anti-fingerprint appearance, and soft diffuse highlights."
    );
    if (fenixColor.isMetallic) {
      sections.push(
        "Metallic decor lock: preserve the subdued real-metal character with restrained, diffuse metallic variation across cabinet fronts."
      );
    }
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
      `All pull handles and bar handles mounted horizontally parallel to the countertop edge. Each handle centered on its own individual door panel near the opening edge. ${LEGACY_KITCHEN_WET_ZONE_MARKER}, physically anchored lighting fixtures, clean lines, consistent materials, and high-end Rotpunkt kitchen design language.`
    );
  } else if (isLivingRoom) {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the floor. Each handle centered on its own individual door panel near the opening edge. Rotpunkt living-room cabinetry and storage furniture design language, with clear living-room cabinet proportions, lounge context, physically anchored lighting fixtures, clean lines, consistent materials, and high-end Rotpunkt furniture styling."
    );
  } else {
    sections.push(
      "All pull handles and bar handles mounted horizontally parallel to the floor. Each handle centered on its own individual door panel near the opening edge. Rotpunkt storage furniture and cabinetry in a residential hallway setting with circulation space, wardrobes, benches, mirrors, physically anchored lighting fixtures, clean lines, consistent materials, and high-end Rotpunkt furniture design language."
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

  // V3 model-facing prompt: relationship-first, bounded, and priority-ordered.
  const modelSectionCandidates: ModelPromptSection[] = [];
  const addModelSection = (
    id: string,
    text: string | undefined,
    options: { required?: boolean; priority?: number } = {}
  ) => {
    if (!text?.trim()) return;
    modelSectionCandidates.push({
      id,
      text: text.trim(),
      required: options.required ?? false,
      priority: options.priority ?? 0,
    });
  };

  const roomLabel =
    effectiveKind ??
    (isKitchenRoom ? "kitchen" : isLivingRoom ? "living room" : "interior");
  const timeBrief = time ? TIME_OF_DAY_BRIEF[time] : undefined;
  addModelSection(
    "subject",
    getModelSceneIntro({
      viewpoint,
      roomLabel,
    }),
    { required: true }
  );

  if (isKitchenRoom && !isDetailView) {
    addModelSection(
      "wet-zone",
      buildKitchenFixtureTopology(kitchenZones),
      { required: true }
    );
  }

  if (handleEntry && handleSelection) {
    const handleSections = buildHandleModelSections({
      entry: handleEntry,
      geometry: handleSelection.geometry,
      promptCaption: handleSelection.promptCaption,
      isKitchen: isKitchenRoom,
    });
    handleSections.forEach((section, index) => {
      addModelSection(`handle-${index + 1}`, section, { required: true });
    });
  }

  if (isFenix && fenixColor) {
    addModelSection(
      "front",
      buildFenixFrontIdentitySection(fenixColor, linkedFenixFront),
      { required: true }
    );
    if (fenixColor.isMetallic) {
      addModelSection(
        "front-metallic",
        "Finish: restrained diffuse real-metal character with low light reflectivity.",
        { priority: 60 }
      );
    }
  } else if (isFrontfarbe && frontfarbe) {
    addModelSection(
      "front",
      buildFrontIdentitySection(frontfarbe),
      { required: true }
    );
    if (frontfarbe.subcategory === "HL" || frontfarbe.subcategory === "LX") {
      addModelSection(
        "front-gloss",
        "Surface finish: ultra high-gloss lacquer with clean mirror-like reflections.",
        { priority: 65 }
      );
    }
  } else if (colorLabel) {
    addModelSection(
      "front",
      `Cabinet fronts: ${colorLabel}, clearly dominant across all visible fronts.`,
      { required: true }
    );
  }

  if (isKitchenRoom) {
    if (kitchenLayoutLabel) {
      addModelSection(
        "layout",
        isDetailView
          ? `Kitchen layout reference: ${kitchenLayoutLabel}, expressed through cabinetry details, materials, and surrounding kitchen context.`
          : `Kitchen layout: ${kitchenLayoutLabel} with Rotpunkt cabinetry as the hero furniture.`,
        { priority: 110 }
      );
    } else {
      addModelSection(
        "layout",
        isDetailView
          ? "Kitchen context expressed through cabinetry details, worktop relationships, and believable surrounding kitchen elements."
          : "Kitchen scene with Rotpunkt kitchen cabinetry as the hero furniture.",
        { priority: 110 }
      );
    }
  } else if (isLivingRoom) {
    addModelSection(
      "layout",
      "Living-room furniture focus: built-in storage wall, sideboards, shelving, and lounge context.",
      { priority: 110 }
    );
  } else {
    addModelSection(
      "layout",
      "Residential hallway furniture focus: built-in wardrobes, storage benches, mirrors, and clear circulation space.",
      { priority: 110 }
    );
  }

  if (style || environment) {
    addModelSection(
      "style-setting",
      `Style and setting: ${[style, environment].filter(Boolean).join(", ")}.`,
      { priority: 90 }
    );
  }

  const compactCameraTreatment =
    VIEWPOINT_CAMERA_TREATMENTS[viewpoint] ??
    "32mm tilt-shift architectural lens at f/8, corrected verticals, and realistic room proportions.";
  addModelSection(
    "camera",
    `Camera and composition: ${expandedViewpoint} ${compactCameraTreatment}`,
    { required: true }
  );

  const viewpointPriority = VIEWPOINT_PRIORITY_LINES[viewpoint];
  if (viewpointPriority) {
    addModelSection("framing-priority", viewpointPriority, { priority: 50 });
  }

  if (timeBrief) {
    addModelSection(
      "lighting",
      `Lighting: ${timeBrief}; the selected time of day reads immediately.`,
      { priority: 88 }
    );
  } else if (timeSpec) {
    addModelSection("lighting", `Lighting: ${timeSpec.description}`, {
      priority: 88,
    });
  }
  if (exteriorTimeLock) {
    addModelSection("exterior-light", exteriorTimeLock, { priority: 45 });
  }
  if (floor) {
    addModelSection("floor", `Flooring: ${floor}.`, { priority: 55 });
  }

  if (normalizedAccessories.length > 0) {
    addModelSection(
      "accessories",
      `Visible accessories: ${normalizedAccessories.join(", ")}.`,
      { priority: 25 }
    );
  }

  const modelWishes =
    isKitchenRoom && !isDetailView
      ? removeCompiledZoneWishes(extraWishes?.trim() ?? "")
      : extraWishes?.trim();
  if (modelWishes) {
    addModelSection(
      "user-wishes",
      `User wishes: ${compactDescriptor(modelWishes, 36)}.`,
      { priority: 70 }
    );
  }

  const detailHardwareFocus =
    handleEntry?.category === "handleless"
      ? "integrated recessed opening channel"
      : handleEntry?.category === "tokyo_grip"
        ? "integrated Tokyo grip profile"
        : "selected handle geometry";

  addModelSection(
    "framing-rule",
    isDetailView
      ? `Framing rule: prioritize detail fidelity above completeness. The selected front, finish, material, and ${detailHardwareFocus} must dominate the frame; broader room cues only need to appear as supporting context.`
      : isWideView
        ? "Framing rule: all major selected choices should be visible together in one coherent scene with consistent materials and physically plausible lighting."
        : "Framing rule: keep the primary selected choices legible in one coherent scene with consistent materials and plausible lighting.",
    { required: isDetailView, priority: 40 }
  );

  const budgetedModelPrompt = buildBudgetedModelPrompt(modelSectionCandidates);
  const modelSections = budgetedModelPrompt.sections;
  const modelPrompt = budgetedModelPrompt.prompt;
  const prompt = pipelineV2Enabled ? modelPrompt : debugPrompt;
  const uiSections = pipelineV2Enabled ? modelSections : debugSections;
  const handleGeometry = handleSelection?.geometry;
  const wetZoneRequired = isKitchenRoom && !isDetailView;
  const qualityExpectations: GenerationQualityExpectations = {
    sceneType: isKitchenRoom ? "kitchen" : "interior",
    wetZone: {
      required: wetZoneRequired,
      location: wetZoneRequired ? kitchenZones.sinkLocation : null,
      sinkCount: wetZoneRequired ? 1 : null,
      faucetCount: wetZoneRequired ? 1 : null,
    },
    cookingZone: {
      required: wetZoneRequired,
      location: wetZoneRequired ? kitchenZones.cooktopLocation : null,
      cooktopCount: wetZoneRequired ? 1 : null,
    },
    islandCount: wetZoneRequired ? kitchenZones.islandCount : null,
    camera: {
      viewpoint,
    },
    handle: {
      kind: handleGeometry?.kind ?? null,
      mountingPoints: handleGeometry?.mountingPoints ?? null,
      requiresPanelContainment:
        handleGeometry?.requiresPanelContainment ?? false,
    },
  };

  return {
    prompt,
    modelPrompt,
    modelSections,
    debugPrompt,
    debugSections,
    sections: uiSections,
    missingKeys,
    isKitchenRoom,
    promptVersion: pipelineV2Enabled ? PROMPT_VERSION : "legacy-debug",
    wordCount: countPromptWords(prompt),
    budgetExceeded:
      pipelineV2Enabled && budgetedModelPrompt.budgetExceeded,
    omittedModelSections: budgetedModelPrompt.omittedSections,
    qualityExpectations,
  };
}

export function toGenerationRequestSpec(
  result: PromptBuildResult
): GenerationRequestSpec {
  return {
    prompt: result.prompt,
    promptVersion: result.promptVersion,
    qualityExpectations: result.qualityExpectations,
    isKitchenRoom: result.isKitchenRoom,
    modelSections: result.modelSections,
    missingKeys: result.missingKeys,
  };
}
