import type { WizardState } from "@/app/store/wizardStore";
import { wizardSteps } from "./wizardSteps";
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

const viewpointDescriptions: Record<string, string> = {
  // Legacy descriptions kept for reference if needed, but we use direct values now
  aussenansicht: "Exterior view",
  innenansicht: "Interior view",
};

function getLabel(
  key: keyof WizardState["selectedOptions"],
  value?: string
): string | undefined {
  if (!value) return undefined;
  const step = wizardSteps.find((item) => item.key === key);
  // Returns German label by default which is fine, but for the prompt we might want to check the value itself in future
  return step?.options.find((opt) => opt.value === value)?.germanLabel ?? value;
}

export function buildPrompt({
  selections,
  extraWishes,
}: {
  selections: WizardState["selectedOptions"];
  extraWishes?: string;
}): PromptBuildResult {
  const missingKeys = wizardSteps
    .map((step) => step.key as keyof WizardState["selectedOptions"])
    .filter((key) => !selections[key]);

  const sections: string[] = [];

  const kind = getLabel("kind", selections.kind);
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
  const time = selections.time; // Raw English value
  const handleSelection = getHandlePromptDescriptor(selections.handle);
  const viewpoint = selections.viewpoint || "Eye level shot"; // Raw English value with safe default
  const floor = selections.floor; // Raw English value
  const accessories = selections.accessories;

  // 1. Subject & Style (High Priority)
  let subjectDescription = "";
  if (kind) subjectDescription += kind;
  if (style) subjectDescription += ` in ${style} style`;

  if (subjectDescription) {
    sections.push(`Subject: ${subjectDescription}.`);
  }

  // 2. Camera View / Perspective (High Priority - Moved Up)
  if (viewpoint) {
    sections.push(`Camera View: ${viewpoint}.`);
  }

  // 3. Lighting & Atmosphere (High Priority - Moved Up)
  if (time) {
    sections.push(`Lighting & Atmosphere: ${time}.`);
  }

  // 4. Environment / Context
  if (environment) {
    sections.push(`Architecture Context: ${environment}.`);
  }

  // 5. Colors & Materials
  let colorDescriptor: string | undefined;
  if (isFenix) {
    colorDescriptor = fenixColor
      ? `Main Surface: FENIX "${fenixColor.name}" (${fenixColor.hex}) - ${fenixColor.description}`
      : undefined;
  } else if (isFrontfarbe) {
    colorDescriptor = frontfarbe
      ? `Main Surface: Front color "${frontfarbe.labelDe}" (Catalog ${frontfarbe.id}, ${frontfarbe.materialTypeDe})`
      : undefined;
  } else {
    colorDescriptor = colorLabel
      ? `Color Palette: ${colorLabel}`
      : undefined;
  }
  if (colorDescriptor) sections.push(`${colorDescriptor}.`);

  // 6. Flooring
  if (floor) {
    sections.push(`Flooring: ${floor}.`);
  }

  // 7. Handles
  if (handleSelection) {
    sections.push(
      `Hardware: ${handleSelection.categoryDe}, Model ${handleSelection.model}, Type ${handleSelection.typeDe}, Color ${handleSelection.colorNameDe} (${handleSelection.colorCode}, ${handleSelection.colorHex}).`
    );
  }

  // 8. Front Reference (Technical)
  if (frontfarbe) {
    sections.push(
      `Exact Front Reference (Use training caption unchanged): ${frontfarbe.trainingCaption}.`
    );
  }

  // 9. Accessories / Decor
  if (accessories) {
    const accessoriesArray = Array.isArray(accessories)
      ? accessories
      : Object.keys(accessories).filter(key => (accessories as Record<string, boolean>)[key]);

    if (accessoriesArray.length > 0) {
      sections.push(`Decor & Accessories: ${accessoriesArray.join(", ")}.`);
    }
  }

  // 10. Technical Requirements & Negative Prompts
  sections.push(
    "Technical Requirements: exactly one sink with a single faucet, all lights must be physically anchored (no floating lamps), no duplicate fixtures, clean lines, consistent materials, high-end Rotpunkt kitchen design language."
  );

  // 11. User Wishes
  const wishes = extraWishes?.trim();
  if (wishes) {
    sections.push(`Additional User Wishes: ${wishes}.`);
  }

  // Emphasis Lines (Prepend for absolute highest priority)
  const emphasisLine =
    isFenix && fenixColor
      ? `IMPORTANT: Furniture in ${fenixColor.description} (FENIX ${fenixColor.name}, ${fenixColor.hex}).`
      : frontfarbe
        ? `IMPORTANT: Use front color reference exactly as "${frontfarbe.trainingCaption}" (Catalog ${frontfarbe.id}).`
        : undefined;

  const handleEmphasisLine = handleSelection
    ? `IMPORTANT: Use selected handle exactly as ${handleSelection.categoryDe} ${handleSelection.model} in ${handleSelection.colorNameDe} (${handleSelection.colorCode}).`
    : undefined;

  const prompt = [
    emphasisLine,
    handleEmphasisLine,
    "Photorealistic Rotpunkt kitchen visualization, designed by an award-winning interior architect.",
    ...sections,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return {
    prompt,
    sections,
    missingKeys,
  };
}
