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

const materialOrder = [
  "Matte Kunststofffront",
  "Echtlackfront",
  "Rahmenfront",
  "Eichenholzfront",
  "Synchronpore Front",
  "Glaslaminat",
  "Front mit Metalloberfläche",
  "Nussbaumfront",
];

export const frontfarbenCatalog = frontfarbenCatalogData as FrontfarbenCatalogEntry[];

const frontfarbenById = new Map(
  frontfarbenCatalog.map((entry) => [entry.id, entry] as const)
);
const materialTabIdByColorId = new Map(
  frontfarbenCatalog.map((entry) => [entry.id, toMaterialTabId(entry.materialTypeDe)] as const)
);

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
    const existing = grouped.get(entry.materialTypeDe) ?? [];
    existing.push(entry);
    grouped.set(entry.materialTypeDe, existing);
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
      labelDe: materialTypeDe,
      labelEn: entries[0]?.materialTypeEn ?? materialTypeDe,
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
    (entry) => toMaterialTabId(entry.materialTypeDe) === tab.id
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
    normalizedLocale === "de" ? entry.materialTypeDe : entry.materialTypeEn;
  return `${entry.id} - ${label} (${material})`;
}

export function getFrontfarbenImageSrc(imagePath: string) {
  return `/api/frontfarben-image?path=${encodeURIComponent(imagePath)}`;
}
