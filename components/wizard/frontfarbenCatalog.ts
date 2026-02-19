import frontfarbenCatalogData from "./frontfarbenCatalogData.json";

export type FrontfarbenCatalogEntry = {
  id: string;
  materialTypeDe: string;
  materialTypeEn: string;
  subcategory: string;
  colorCode: string;
  labelDe: string;
  labelEn: string;
  trainingCaption: string;
  imagePath: string;
};

export type FrontfarbenMaterialTab = {
  id: string;
  labelDe: string;
  labelEn: string;
  count: number;
};

export const FRONTFARBEN_COLOR_PREFIX = "frontfarbe:";

/** UI display overrides — keeps raw data fields intact for prompt/training references */
const materialDisplayNameDe: Record<string, string> = {
  "Rahmenfront": "Echtholz",
  "Nussbaumfront": "Echtholz",
};
const materialDisplayNameEn: Record<string, string> = {
  "Frame front": "Real Wood",
  "Walnut front": "Real Wood",
};

/** Grouping overrides — merge material types into a single tab */
const materialGroupKey: Record<string, string> = {
  "Nussbaumfront": "Rahmenfront",
};

export function getDisplayMaterialDe(raw: string): string {
  return materialDisplayNameDe[raw] ?? raw;
}
export function getDisplayMaterialEn(raw: string): string {
  return materialDisplayNameEn[raw] ?? raw;
}

/** Returns the canonical grouping key for a material type (merges Nussbaumfront → Rahmenfront, etc.) */
function getMaterialGroupKey(materialTypeDe: string): string {
  return materialGroupKey[materialTypeDe] ?? materialTypeDe;
}

const materialOrder = [
  "Matte Kunststofffront",
  "Echtlackfront",
  "Rahmenfront",
  "Eichenholzfront",
  "Synchronpore Front",
  "Glaslaminat",
  "Front mit Metalloberfläche",
];

export const frontfarbenCatalog = frontfarbenCatalogData as FrontfarbenCatalogEntry[];

const frontfarbenById = new Map(
  frontfarbenCatalog.map((entry) => [entry.id, entry] as const)
);
const frontfarbenMaterialPreviewByTabId = new Map<string, string>();
const materialTabIdByColorId = new Map(
  frontfarbenCatalog.map((entry) => [entry.id, toMaterialTabId(getMaterialGroupKey(entry.materialTypeDe))] as const)
);

for (const entry of frontfarbenCatalog) {
  const tabId = toMaterialTabId(getMaterialGroupKey(entry.materialTypeDe));
  if (!frontfarbenMaterialPreviewByTabId.has(tabId)) {
    frontfarbenMaterialPreviewByTabId.set(tabId, entry.imagePath);
  }
}

function toMaterialTabId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeLocale(locale?: string): "de" | "en" {
  return locale?.startsWith("de") ? "de" : "en";
}

const frontfarbenMaterialTabs: FrontfarbenMaterialTab[] = (() => {
  const grouped = new Map<string, FrontfarbenCatalogEntry[]>();

  for (const entry of frontfarbenCatalog) {
    const groupKey = getMaterialGroupKey(entry.materialTypeDe);
    const existing = grouped.get(groupKey) ?? [];
    existing.push(entry);
    grouped.set(groupKey, existing);
  }

  return [...grouped.entries()]
    .sort(([materialA], [materialB]) => {
      const orderA = materialOrder.indexOf(materialA);
      const orderB = materialOrder.indexOf(materialB);
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return materialA.localeCompare(materialB, "de");
    })
    .map(([materialTypeDe, entries]) => ({
      id: toMaterialTabId(materialTypeDe),
      labelDe: getDisplayMaterialDe(materialTypeDe),
      labelEn: getDisplayMaterialEn(entries[0]?.materialTypeEn ?? materialTypeDe),
      count: entries.length,
    }));
})();

export function getFrontfarbenMaterialTabs(): FrontfarbenMaterialTab[] {
  return frontfarbenMaterialTabs;
}

export function getFrontfarbenByMaterialTab(
  tabId: string
): FrontfarbenCatalogEntry[] {
  const tab = frontfarbenMaterialTabs.find((item) => item.id === tabId);
  if (!tab) return frontfarbenCatalog;
  return frontfarbenCatalog.filter(
    (entry) => toMaterialTabId(getMaterialGroupKey(entry.materialTypeDe)) === tab.id
  );
}

export function encodeFrontfarbenColorValue(id: string): string {
  return `${FRONTFARBEN_COLOR_PREFIX}${id}`;
}

export function isFrontfarbenColorValue(
  value?: string | null
): value is string {
  return typeof value === "string" && value.startsWith(FRONTFARBEN_COLOR_PREFIX);
}

export function getFrontfarbenColorByValue(value?: string) {
  if (!isFrontfarbenColorValue(value)) return undefined;
  const id = value.slice(FRONTFARBEN_COLOR_PREFIX.length);
  return frontfarbenById.get(id);
}

export function getFrontfarbenMaterialTabIdByValue(value?: string) {
  if (!isFrontfarbenColorValue(value)) return undefined;
  const id = value.slice(FRONTFARBEN_COLOR_PREFIX.length);
  return materialTabIdByColorId.get(id);
}

export function getFrontfarbenColorLabel(value?: string, locale?: string) {
  const entry = getFrontfarbenColorByValue(value);
  if (!entry) return undefined;
  const normalizedLocale = normalizeLocale(locale);
  const label = normalizedLocale === "de" ? entry.labelDe : entry.labelEn;
  const material =
    normalizedLocale === "de" ? getDisplayMaterialDe(entry.materialTypeDe) : getDisplayMaterialEn(entry.materialTypeEn);
  return `${entry.id} - ${label} (${material})`;
}

export function getFrontfarbenImageSrc(imagePath: string) {
  return `/api/frontfarben-image?path=${encodeURIComponent(imagePath)}`;
}

export function getFrontfarbenMaterialTabPreviewImage(tabId: string) {
  return frontfarbenMaterialPreviewByTabId.get(tabId);
}
