import type { WizardState } from "@/app/store/wizardStore";
import { wizardSteps } from "./wizardSteps";
import { getFenixColorByValue, isFenixColorValue } from "./fenixColors";

export type PromptBuildResult = {
  prompt: string;
  sections: string[];
  missingKeys: string[];
};

const viewpointDescriptions: Record<string, string> = {
  aussenansicht:
    "Außenperspektive: Die Szene zeigt die Architektur von außen und ermöglicht einen Blick ins Innere durch Fenster.",
  innenansicht:
    "Innenperspektive: Betrachtung aus dem Raum heraus mit Fokus auf Arbeitsflächen, Schränke und Ausstattung.",
};

function getLabel(
  key: keyof WizardState["selectedOptions"],
  value?: string
): string | undefined {
  if (!value) return undefined;
  const step = wizardSteps.find((item) => item.key === key);
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
  const fenixColor = isFenix ? getFenixColorByValue(colorSelection) : undefined;
  const colorLabel = !isFenix ? getLabel("color", colorSelection) : undefined;
  const environment = getLabel("environment", selections.environment);
  const time = getLabel("time", selections.time);
  const viewpoint = selections.viewpoint ?? "innenansicht";

  const colorDescriptor = isFenix
    ? fenixColor
      ? `mit der FENIX Farbwelt "${fenixColor.name}" (${fenixColor.hex}) - ${fenixColor.description}`
      : undefined
    : colorLabel
      ? `mit einer Farbpalette in ${colorLabel}`
      : undefined;

  if (kind || style || colorDescriptor) {
    const descriptors: string[] = [];
    if (kind) descriptors.push(kind);
    if (style) descriptors.push(`im Stil ${style}`);
    if (colorDescriptor) descriptors.push(colorDescriptor);
    sections.push(`Raumfokus: ${descriptors.join(" ")}.`.trim());
  }

  if (environment) {
    sections.push(`Kategorie & Architekturkontext: ${environment}.`);
  }

  if (time) {
    sections.push(`Tageszeit: ${time}.`);
  }

  // Floor selection
  const floor = getLabel("floor", selections.floor);
  if (floor) {
    sections.push(`Bodenbelag: ${selections.floor}.`);
  }

  // Accessories (multi-select) - handle both array and object formats for backwards compatibility
  const accessories = selections.accessories;
  if (accessories) {
    // Convert to array if it's an object (e.g., {item1: true, item2: true})
    const accessoriesArray = Array.isArray(accessories)
      ? accessories
      : Object.keys(accessories).filter(key => (accessories as Record<string, boolean>)[key]);

    if (accessoriesArray.length > 0) {
      sections.push(`Accessoires & Dekoration: ${accessoriesArray.join(", ")}.`);
    }
  }

  sections.push(
    `Perspektive: ${viewpointDescriptions[viewpoint] ?? viewpointDescriptions.innenansicht
    }`
  );

  sections.push(
    "Wichtige Vorgaben: genau ein Spülbecken mit einem einzigen Wasserhahn, alle Leuchten müssen physisch verankert sein (keine schwebenden Lampen), keine doppelten Armaturen, klare Linienführung, konsistente Materialien und Markensprache von Rotpunkt."
  );

  const wishes = extraWishes?.trim();
  if (wishes) {
    sections.push(`Zusätzliche Wünsche des Nutzers: ${wishes}.`);
  }

  const emphasisLine =
    isFenix && fenixColor
      ? `Wichtig: Möbel in ${fenixColor.description} (FENIX ${fenixColor.name}, ${fenixColor.hex}).`
      : undefined;

  const prompt = [
    emphasisLine,
    "Photorealistische Rotpunkt Küchenvisualisierung, entworfen von einem preisgekrönten Innenarchitekten.",
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
