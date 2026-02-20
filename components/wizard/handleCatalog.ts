import handleCatalogData from "./handleCatalogData.json";

export type HandleCatalogEntry = {
  id: string;
  category: HandleCategoryId;
  subcategory: "holzfarben" | "unifarben" | null;
  imagePath: string;
  trainingCaption: string;
  promptCaption: string;
  labelDe: string;
  labelEn: string;
};

export type HandleCategoryId =
  | "handleless"
  | "buster_and_punch"
  | "standard_handle"
  | "tokyo_grip";

export type HandleCategoryTab = {
  id: HandleCategoryId;
  labelDe: string;
  labelEn: string;
  count: number;
};

export const HANDLE_SELECTION_PREFIX = "handle:";

const categoryConfig: Record<
  HandleCategoryId,
  { labelDe: string; labelEn: string; order: number }
> = {
  handleless: { labelDe: "Grifflos", labelEn: "Handleless", order: 0 },
  buster_and_punch: {
    labelDe: "Buster & Punch",
    labelEn: "Buster & Punch",
    order: 1,
  },
  standard_handle: {
    labelDe: "Standardgriffe",
    labelEn: "Standard Handles",
    order: 2,
  },
  tokyo_grip: { labelDe: "Tokyo Griff", labelEn: "Tokyo Grip", order: 3 },
};

export const handleCatalog =
  handleCatalogData as unknown as HandleCatalogEntry[];

const handleCatalogById = new Map(
  handleCatalog.map((entry) => [entry.id, entry] as const)
);

export const handleCategories: HandleCategoryTab[] = (() => {
  const grouped = new Map<HandleCategoryId, HandleCatalogEntry[]>();

  for (const entry of handleCatalog) {
    const current = grouped.get(entry.category) ?? [];
    current.push(entry);
    grouped.set(entry.category, current);
  }

  return [...grouped.entries()]
    .sort(
      ([idA], [idB]) =>
        (categoryConfig[idA]?.order ?? 99) -
        (categoryConfig[idB]?.order ?? 99)
    )
    .map(([id, entries]) => ({
      id,
      labelDe: categoryConfig[id]?.labelDe ?? id,
      labelEn: categoryConfig[id]?.labelEn ?? id,
      count: entries.length,
    }));
})();

export function getHandlesByCategory(
  categoryId: HandleCategoryId
): HandleCatalogEntry[] {
  return handleCatalog.filter((entry) => entry.category === categoryId);
}

/** Backwards-compatible alias used in KitchenWizardModal */
export const getProductsByHandleCategory = getHandlesByCategory;

export function getTokyoGripSwatches(
  subcategory: "holzfarben" | "unifarben"
): HandleCatalogEntry[] {
  return handleCatalog.filter(
    (entry) =>
      entry.category === "tokyo_grip" && entry.subcategory === subcategory
  );
}

export function encodeHandleSelectionValue(entryId: string): string {
  return `${HANDLE_SELECTION_PREFIX}${entryId}`;
}

export function isHandleSelectionValue(
  value?: string | null
): value is string {
  return (
    typeof value === "string" && value.startsWith(HANDLE_SELECTION_PREFIX)
  );
}

export function parseHandleSelectionValue(
  value?: string | null
): string | undefined {
  if (!isHandleSelectionValue(value)) return undefined;
  return value.slice(HANDLE_SELECTION_PREFIX.length);
}

export function getHandleSelectionByValue(
  value?: string | null
): HandleCatalogEntry | undefined {
  const id = parseHandleSelectionValue(value);
  if (!id) return undefined;
  return handleCatalogById.get(id);
}

function normalizeLocale(locale?: string): "de" | "en" {
  return locale?.startsWith("de") ? "de" : "en";
}

export function getHandleSelectionLabel(
  value?: string | null,
  locale?: string
): string | undefined {
  const entry = getHandleSelectionByValue(value);
  if (!entry) return undefined;
  const normalizedLocale = normalizeLocale(locale);
  const catLabel =
    normalizedLocale === "de"
      ? categoryConfig[entry.category].labelDe
      : categoryConfig[entry.category].labelEn;
  const entryLabel =
    normalizedLocale === "de" ? entry.labelDe : entry.labelEn;
  return `${catLabel} – ${entryLabel}`;
}

export function getHandlePromptDescriptor(value?: string | null) {
  const entry = getHandleSelectionByValue(value);
  if (!entry) return undefined;
  return {
    promptCaption: entry.promptCaption,
    category: entry.category,
  };
}

export function getGriffeImageSrc(imagePath: string) {
  return `/api/griffe-image?path=${encodeURIComponent(imagePath)}`;
}
