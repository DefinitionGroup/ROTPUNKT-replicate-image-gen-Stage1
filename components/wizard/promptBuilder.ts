import type { WizardState } from "@/app/store/wizardStore";
import { wizardSteps, kitchenLayoutOptions } from "./wizardSteps";
import { getFenixColorByValue, isFenixColorValue } from "./fenixColors";
import {
  getFrontfarbenColorByValue,
  isFrontfarbenColorValue,
} from "./frontfarbenCatalog";
import { getHandlePromptDescriptor } from "./handleCatalog";

export type PromptBuildResult = {
  prompt: string;
  sections: string[];
  missingKeys: string[];
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

export function buildPrompt({
  selections,
  extraWishes,
}: {
  selections: WizardState["selectedOptions"];
  extraWishes?: string;
}): PromptBuildResult {
  const missingKeys = getSelectionKeys()
    .filter((key) => !selections[key]);

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
  const handleSelection = getHandlePromptDescriptor(selections.handle);
  const viewpoint = selections.viewpoint || "eye level shot";
  const floor = selections.floor;
  const accessories = selections.accessories;

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
    opening += ` ${subjectParts.join(" ")}, ${viewpoint}.`;
  } else {
    opening += ` ${viewpoint[0].toUpperCase() + viewpoint.slice(1)}.`;
  }
  sections.push(opening);

  // 2. Lighting & Atmosphere
  if (time) {
    sections.push(`${time[0].toUpperCase() + time.slice(1)}.`);
  }

  // 3. Colors & Materials (natural language, no labels)
  const fenixDesc = PROMPT_LANGUAGE === "en"
    ? fenixColor?.englishDescription
    : fenixColor?.description;

  if (isFenix && fenixColor) {
    sections.push(
      `Furniture surfaces in ${fenixDesc}, FENIX ${fenixColor.name} (${fenixColor.hex}).`
    );
  } else if (isFrontfarbe && frontfarbe) {
    sections.push(
      `Front color "${frontfarbe.labelDe}" (Catalog ${frontfarbe.id}, ${frontfarbe.materialTypeDe}).`
    );
  } else if (colorLabel) {
    sections.push(`${colorLabel} color palette.`);
  }

  // 4. Flooring
  if (floor) {
    sections.push(`${floor[0].toUpperCase() + floor.slice(1)}.`);
  }

  // 5. Hardware (use English or German based on A/B flag)
  if (handleSelection) {
    const category = PROMPT_LANGUAGE === "en" ? handleSelection.categoryEn : handleSelection.categoryDe;
    const type = PROMPT_LANGUAGE === "en" ? handleSelection.typeEn : handleSelection.typeDe;
    const colorName = PROMPT_LANGUAGE === "en" ? handleSelection.colorNameEn : handleSelection.colorNameDe;
    sections.push(
      `${category}, model ${handleSelection.model}, ${type}, ${colorName} (${handleSelection.colorHex}).`
    );
  }

  // 6. Front Reference (training caption verbatim — always English as trained)
  if (frontfarbe) {
    sections.push(
      `Exact front reference: ${frontfarbe.trainingCaption}.`
    );
  }

  // 7. Accessories / Decor
  if (accessories) {
    const accessoriesArray = Array.isArray(accessories)
      ? accessories
      : Object.keys(accessories).filter(key => (accessories as Record<string, boolean>)[key]);

    if (accessoriesArray.length > 0) {
      sections.push(`${accessoriesArray.join(", ")}.`);
    }
  }

  // 8. Technical Requirements (positive phrasing — FLUX ignores negative prompts)
  if (isKitchenRoom) {
    sections.push(
      "Exactly one sink with a single faucet, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt kitchen design language."
    );
  } else {
    sections.push(
      "Rotpunkt furniture and cabinetry only, absolutely no kitchen appliances, no sink, no faucet, no oven, no cooktop, no range hood visible. Residential furniture showroom aesthetic, all lights physically anchored, no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt furniture design language."
    );
  }

  // 9. User Wishes
  const wishes = extraWishes?.trim();
  if (wishes) {
    sections.push(`${wishes}.`);
  }

  const prompt = sections.join(" ");

  return {
    prompt,
    sections,
    missingKeys,
  };
}
