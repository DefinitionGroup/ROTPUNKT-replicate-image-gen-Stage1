import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { HandleCategoryId } from "./handleCatalog";
import {
  encodeHandleSelectionValue,
  getGriffeImageSrc,
  getHandlesByCategory,
  getTokyoGripSwatches,
  handleCategories,
  parseHandleSelectionValue,
  getHandleSelectionByValue,
} from "./handleCatalog";
import { StepHeader } from "./StepHeader";

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

  const parsedEntryId = useMemo(
    () => parseHandleSelectionValue(selectedValue),
    [selectedValue]
  );

  const selectedEntry = useMemo(
    () => getHandleSelectionByValue(selectedValue),
    [selectedValue]
  );

  const defaultCategory = handleCategories[0]?.id ?? ("handleless" as HandleCategoryId);

  const initialCategory = useMemo(() => {
    if (!selectedEntry) return defaultCategory;
    return selectedEntry.category;
  }, [defaultCategory, selectedEntry]);

  const [activeCategory, setActiveCategory] =
    useState<HandleCategoryId>(initialCategory);

  // For Tokyo sub-tabs
  const [tokyoSubTab, setTokyoSubTab] = useState<"holzfarben" | "unifarben">(
    selectedEntry?.subcategory === "unifarben" ? "unifarben" : "holzfarben"
  );

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const entries = useMemo(
    () => {
      if (activeCategory === "tokyo_grip") {
        return getTokyoGripSwatches(tokyoSubTab);
      }
      return getHandlesByCategory(activeCategory);
    },
    [activeCategory, tokyoSubTab]
  );

  return (
    <motion.div
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <StepHeader icon={icon} title={title} description={description} />

      {/* Category Tab Bar */}
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
                  className={`px-3 sm:px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${
                    isActive
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

      {/* Tokyo Key Visual + Sub-Tabs */}
      {activeCategory === "tokyo_grip" && (
        <>
          <div className="mb-4 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/50">
            <div className="relative w-full h-40 sm:h-52 md:h-60 bg-background">
              <Image
                src={getGriffeImageSrc("tokyo/Griff Tokyo Detail_converted.jpeg")}
                alt="Tokyo Grip"
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 500px"
                priority
              />
            </div>
          </div>
          <div className="mb-3 flex gap-2 shrink-0">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg border text-xs transition ${
              tokyoSubTab === "holzfarben"
                ? "border-brand-primary-2 bg-brand-primary-2/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-brand-primary-2/50"
            }`}
            onClick={() => setTokyoSubTab("holzfarben")}
            disabled={loading}
          >
            {t("tokyoHolzfarben")}
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg border text-xs transition ${
              tokyoSubTab === "unifarben"
                ? "border-brand-primary-2 bg-brand-primary-2/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-brand-primary-2/50"
            }`}
            onClick={() => setTokyoSubTab("unifarben")}
            disabled={loading}
          >
            {t("tokyoUnifarben")}
          </button>
        </div>
        </>
      )}

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1 pb-4">
          {entries.map((entry) => {
            const isSelected = parsedEntryId === entry.id;
            const label =
              normalizedLocale === "de" ? entry.labelDe : entry.labelEn;

            return (
              <button
                key={entry.id}
                type="button"
                className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${
                  isSelected
                    ? "border-brand-primary-2 ring-2 ring-brand-primary-2"
                    : "border-border hover:border-brand-primary-2/50"
                }`}
                onClick={() =>
                  onSelect(encodeHandleSelectionValue(entry.id))
                }
                disabled={loading}
                data-selected={isSelected}
                aria-pressed={isSelected}
              >
                {/* Image area */}
                <div className="relative h-32 sm:h-36 md:h-40 w-full bg-background overflow-hidden">
                  <Image
                    src={getGriffeImageSrc(entry.imagePath)}
                    alt={label}
                    fill
                    unoptimized
                    loading="lazy"
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>

                {/* Label area */}
                <div
                  className={`px-2.5 py-2 transition-colors ${
                    isSelected
                      ? "bg-brand-primary-2"
                      : "bg-card/80"
                  }`}
                >
                  <span
                    className={`text-xxs sm:text-xs font-medium leading-tight block line-clamp-2 ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
            {t("noProducts")}
          </div>
        )}
      </div>
    </motion.div>
  );
}
