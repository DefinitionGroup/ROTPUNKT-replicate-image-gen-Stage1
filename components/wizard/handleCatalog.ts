import handleCatalogData from "./handleCatalogData.json";

export type HandleColorOption = {
  id: string;
  nameDe: string;
  nameEn: string;
  hex: string;
  group: string | null;
};

export type HandleProduct = {
  id: string;
  categoryId: string;
  categoryDe: string;
  categoryEn: string;
  model: string;
  descriptionDe: string;
  descriptionEn: string;
  typeDe: string;
  typeEn: string;
  dimensions: string;
  imagePath: string | null;
  colors: HandleColorOption[];
};

export type HandleCategory = {
  id: string;
  labelDe: string;
  labelEn: string;
  count: number;
};

export const HANDLE_SELECTION_PREFIX = "handle:";

export const handleCatalog = handleCatalogData as HandleProduct[];

const categoryOrder = ["buster-grips", "tokyo", "buegelgriff", "yell"];

const productById = new Map(handleCatalog.map((item) => [item.id, item] as const));

export const handleCategories: HandleCategory[] = (() => {
  const grouped = new Map<string, HandleProduct[]>();

  for (const product of handleCatalog) {
    const current = grouped.get(product.categoryId) ?? [];
    current.push(product);
    grouped.set(product.categoryId, current);
  }

  return [...grouped.entries()]
    .sort(([idA], [idB]) => {
      const orderA = categoryOrder.indexOf(idA);
      const orderB = categoryOrder.indexOf(idB);
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return idA.localeCompare(idB);
    })
    .map(([id, products]) => ({
      id,
      labelDe: products[0]?.categoryDe ?? id,
      labelEn: products[0]?.categoryEn ?? id,
      count: products.length,
    }));
})();

export function getProductsByHandleCategory(categoryId: string): HandleProduct[] {
  return handleCatalog.filter((item) => item.categoryId === categoryId);
}

export function encodeHandleSelectionValue(productId: string, colorId: string): string {
  return `${HANDLE_SELECTION_PREFIX}${productId}|${colorId}`;
}

export function isHandleSelectionValue(value?: string | null): value is string {
  return typeof value === "string" && value.startsWith(HANDLE_SELECTION_PREFIX);
}

export function parseHandleSelectionValue(value?: string | null) {
  if (!isHandleSelectionValue(value)) return undefined;
  const payload = value.slice(HANDLE_SELECTION_PREFIX.length);
  const [productId, colorId] = payload.split("|");
  if (!productId || !colorId) return undefined;
  return { productId, colorId };
}

export function getHandleSelectionByValue(value?: string | null) {
  const parsed = parseHandleSelectionValue(value);
  if (!parsed) return undefined;
  const product = productById.get(parsed.productId);
  if (!product) return undefined;
  const color = product.colors.find((item) => item.id === parsed.colorId);
  if (!color) return undefined;
  return { product, color };
}

function normalizeLocale(locale?: string): "de" | "en" {
  return locale?.startsWith("de") ? "de" : "en";
}

export function getHandleSelectionLabel(value?: string | null, locale?: string) {
  const selection = getHandleSelectionByValue(value);
  if (!selection) return undefined;
  const normalizedLocale = normalizeLocale(locale);
  const name = normalizedLocale === "de" ? selection.color.nameDe : selection.color.nameEn;
  const type = normalizedLocale === "de" ? selection.product.typeDe : selection.product.typeEn;
  const category =
    normalizedLocale === "de" ? selection.product.categoryDe : selection.product.categoryEn;
  return `${category} ${selection.product.model} - ${type} / ${name}`;
}

export function getHandlePromptDescriptor(value?: string | null) {
  const selection = getHandleSelectionByValue(value);
  if (!selection) return undefined;
  const { product, color } = selection;
  return {
    categoryDe: product.categoryDe,
    model: product.model,
    typeDe: product.typeDe,
    descriptionDe: product.descriptionDe,
    dimensions: product.dimensions,
    colorCode: color.id,
    colorNameDe: color.nameDe,
    colorHex: color.hex,
  };
}

export function getGriffeImageSrc(imagePath: string) {
  return `/api/griffe-image?path=${encodeURIComponent(imagePath)}`;
}
