import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  encodeHandleSelectionValue,
  getGriffeImageSrc,
  getProductsByHandleCategory,
  handleCategories,
  parseHandleSelectionValue,
} from "./handleCatalog";

interface WizardHandleStepProps {
  icon: ReactNode;
  title: string;
  description: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

export function WizardHandleStep({
  icon,
  title,
  description,
  selectedValue,
  onSelect,
  loading = false,
}: WizardHandleStepProps) {
  const t = useTranslations("wizard.handleMatrix");
  const locale = useLocale();
  const normalizedLocale: "de" | "en" = locale.startsWith("de") ? "de" : "en";
  const parsedSelection = useMemo(
    () => parseHandleSelectionValue(selectedValue),
    [selectedValue]
  );
  const defaultCategory = handleCategories[0]?.id ?? "";
  const selectedProduct = parsedSelection?.productId;

  const initialCategory = useMemo(() => {
    if (!selectedProduct) return defaultCategory;
    const entry = handleCategories.find((category) =>
      getProductsByHandleCategory(category.id).some((product) => product.id === selectedProduct)
    );
    return entry?.id ?? defaultCategory;
  }, [defaultCategory, selectedProduct]);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const products = useMemo(
    () => getProductsByHandleCategory(activeCategory),
    [activeCategory]
  );

  return (
    <motion.div
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/40 flex items-center justify-center text-brand-primary-2">
          {icon}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl text-left md:text-2xl tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl text-left leading-snug break-words">{description}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <p className="text-xxs text-muted-foreground">{t("categoryLabel")}</p>
        <div className="overflow-x-auto pb-1 touch-pan-x">
          <div className="inline-flex min-w-max rounded-full border border-border bg-muted/60 p-1 text-xs text-muted-foreground">
            {handleCategories.map((category) => {
              const isActive = category.id === activeCategory;
              const label =
                normalizedLocale === "de" ? category.labelDe : category.labelEn;
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`px-3 sm:px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isActive
                    ? "bg-brand-primary-2 text-white shadow"
                    : "hover:text-foreground"
                    }`}
                  onClick={() => setActiveCategory(category.id)}
                  disabled={loading}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="flex flex-col gap-3 pb-4">
          {products.map((product) => {
            const productLabel =
              normalizedLocale === "de" ? product.descriptionDe : product.descriptionEn;
            const typeLabel =
              normalizedLocale === "de" ? product.typeDe : product.typeEn;
            const isProductSelected = parsedSelection?.productId === product.id;

            return (
              <div
                key={product.id}
                className={`rounded-xl border p-3 sm:p-4 transition ${isProductSelected
                  ? "border-brand-primary-2/60 bg-brand-primary-2/5"
                  : "border-border bg-muted/60"
                  }`}
              >
                <div className="grid grid-cols-1 min-[680px]:grid-cols-[220px_1fr] gap-3 sm:gap-4">
                  <div className="relative h-32 sm:h-36 rounded-lg border border-border/60 overflow-hidden bg-background">
                    {product.imagePath ? (
                      <Image
                        src={getGriffeImageSrc(product.imagePath)}
                        alt={`${product.model} ${productLabel}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 220px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        {t("imageUnavailable")}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-xxs uppercase text-left tracking-wide text-brand-primary-2 font-semibold">
                        {t("modelLabel")}: {product.model}
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-foreground leading-tight text-left break-words">
                        {productLabel}
                      </h4>
                      <p className="text-xxs sm:text-xs text-muted-foreground text-left leading-snug break-words">
                        {typeLabel}
                      </p>
                      <p className="text-xxs text-muted-foreground/90 text-left leading-snug break-words">{product.dimensions}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xxs uppercase text-left tracking-wide text-muted-foreground">
                        {t("availableColors")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => {
                          const value = encodeHandleSelectionValue(product.id, color.id);
                          const isSelected = selectedValue === value;
                          const colorLabel =
                            normalizedLocale === "de" ? color.nameDe : color.nameEn;
                          return (
                            <button
                              key={`${product.id}-${color.id}`}
                              type="button"
                              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xxs sm:text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isSelected
                                ? "border-brand-primary-2 bg-brand-primary-2/10 text-foreground"
                                : "border-border bg-background/70 text-muted-foreground hover:text-foreground hover:border-brand-primary-2/50"
                                }`}
                              onClick={() => onSelect(value)}
                              disabled={loading}
                              aria-pressed={isSelected}
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-sm border border-border/70"
                                style={{ backgroundColor: color.hex }}
                                aria-hidden="true"
                              />
                              <span>{colorLabel}</span>
                              <span className="text-muted-foreground/80">({color.id})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {products.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
              {t("noProducts")}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
