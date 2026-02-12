import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
import { useLocale, useTranslations } from "next-intl";
import {
  encodeFrontfarbenColorValue,
  frontfarbenCatalog,
  getFrontfarbenByMaterialTab,
  getFrontfarbenImageSrc,
  getFrontfarbenMaterialTabs,
  getFrontfarbenMaterialTabIdByValue,
} from "./frontfarbenCatalog";
import {
  encodeFenixColorValue,
  fenixColors,
  isFenixColorValue,
} from "./fenixColors";

interface WizardColorStepProps {
  icon: ReactNode;
  title: string;
  description: string;
  options: TranslatedWizardOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

type ColorTab = "frontfarben" | "fenix";
const ALL_MATERIALS_TAB_ID = "all-materials";

export function WizardColorStep({
  icon,
  title,
  description,
  options,
  selectedValue,
  onSelect,
  loading = false,
}: WizardColorStepProps) {
  const t = useTranslations("wizard.colorTabs");
  const locale = useLocale();
  const normalizedLocale: "de" | "en" = locale.startsWith("de") ? "de" : "en";
  const initialTab: ColorTab = isFenixColorValue(selectedValue) ? "fenix" : "frontfarben";
  const [activeTab, setActiveTab] = useState<ColorTab>(initialTab);
  const [activeMaterialTab, setActiveMaterialTab] = useState<string>(ALL_MATERIALS_TAB_ID);
  const materialTabs = useMemo(() => getFrontfarbenMaterialTabs(), []);
  const hasFrontfarbenOptions = frontfarbenCatalog.length > 0;
  const frontfarbenOptions = useMemo(
    () =>
      activeMaterialTab === ALL_MATERIALS_TAB_ID
        ? frontfarbenCatalog
        : getFrontfarbenByMaterialTab(activeMaterialTab),
    [activeMaterialTab]
  );

  const tabs = useMemo(
    () => [
      {
        id: "frontfarben" as const,
        label: t("frontfarbenLabel"),
        description: t("frontfarbenDescription"),
      },
      {
        id: "fenix" as const,
        label: t("fenixLabel"),
        description: t("fenixDescription"),
      },
    ],
    [t]
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const selectedMaterialTab = getFrontfarbenMaterialTabIdByValue(selectedValue);
    if (selectedMaterialTab) {
      setActiveMaterialTab(selectedMaterialTab);
    }
  }, [selectedValue]);

  const renderTabDescription = () => {
    const current = tabs.find((tab) => tab.id === activeTab);
    return current?.description ?? "";
  };

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
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{description}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <div className="inline-flex w-full sm:w-auto rounded-full border border-border bg-muted/60 p-1 text-xs text-muted-foreground">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isActive
                    ? "bg-brand-primary-2 text-white shadow"
                    : "hover:text-foreground"
                  }`}
                onClick={() => setActiveTab(tab.id)}
                disabled={loading}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="text-xxs text-muted-foreground">{renderTabDescription()}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        {activeTab === "frontfarben" ? (
          hasFrontfarbenOptions ? (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto pb-1 touch-pan-x">
                <div className="inline-flex min-w-max rounded-full border border-border bg-muted/60 p-1 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className={`px-3 sm:px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${activeMaterialTab === ALL_MATERIALS_TAB_ID
                        ? "bg-brand-primary-2 text-white shadow"
                        : "hover:text-foreground"
                      }`}
                    onClick={() => setActiveMaterialTab(ALL_MATERIALS_TAB_ID)}
                    disabled={loading}
                    aria-pressed={activeMaterialTab === ALL_MATERIALS_TAB_ID}
                  >
                    {t("allMaterials")}
                  </button>
                  {materialTabs.map((tab) => {
                    const isActive = tab.id === activeMaterialTab;
                    const tabLabel = normalizedLocale === "de" ? tab.labelDe : tab.labelEn;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`px-3 sm:px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isActive
                            ? "bg-brand-primary-2 text-white shadow"
                            : "hover:text-foreground"
                          }`}
                        onClick={() => setActiveMaterialTab(tab.id)}
                        disabled={loading}
                        aria-pressed={isActive}
                      >
                        {tabLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4">
                {frontfarbenOptions.map((color) => {
                  const value = encodeFrontfarbenColorValue(color.id);
                  const isSelected = selectedValue === value;
                  const colorLabel = normalizedLocale === "de" ? color.labelDe : color.labelEn;
                  const materialLabel =
                    normalizedLocale === "de"
                      ? color.materialTypeDe
                      : color.materialTypeEn;
                  const selectedClass = isSelected
                    ? "border-emerald-400/80 bg-emerald-500/5"
                    : "border-border bg-muted/60 hover:border-brand-primary-2/50 hover:bg-brand-primary-2/5";

                  return (
                    <motion.button
                      key={color.id}
                      type="button"
                      className={`group flex flex-col gap-2 rounded-xl border ${selectedClass} p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70`}
                      whileHover={{ translateY: -2 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={loading}
                      onClick={() => onSelect(value)}
                    >
                      <div className="relative h-20 sm:h-24 w-full overflow-hidden rounded-lg border border-border/60">
                        <Image
                          src={getFrontfarbenImageSrc(color.imagePath)}
                          alt={`${color.id} ${colorLabel}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 50vw, 280px"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xxs font-semibold uppercase tracking-wide text-brand-primary-2">
                          {color.id}
                        </span>
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {colorLabel}
                        </span>
                        <span className="text-xxs text-muted-foreground leading-tight">
                          {materialLabel} · {color.subcategory}
                        </span>
                        <span className="text-xxs text-muted-foreground/90 leading-tight max-h-8 overflow-hidden">
                          {t("trainingCaptionLabel")}: {color.trainingCaption}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4">
              {options.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant="wizardOption"
                    size="wizardOption"
                    enableMotion
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    onClick={() => onSelect(opt.value)}
                    disabled={loading}
                    data-selected={isSelected}
                    className="h-auto py-3 sm:py-4 px-3 sm:px-4 text-left flex-col items-start gap-1.5 border-border/70 bg-muted/60 backdrop-blur rounded-xl"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {opt.label}
                    </span>
                    {opt.hint ? (
                      <span className="text-xxs sm:text-xs text-muted-foreground">{opt.hint}</span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 min-[430px]:grid-cols-3 lg:grid-cols-4 gap-2 pb-4">
            {fenixColors.map((color) => {
              const value = encodeFenixColorValue(color.name);
              const isSelected = selectedValue === value;
              const selectedClass = isSelected
                ? "border-emerald-400/80 bg-emerald-500/5"
                : "border-border bg-muted/60 hover:border-brand-primary-2/50 hover:bg-brand-primary-2/5";

              return (
                <motion.button
                  key={color.name}
                  type="button"
                  className={`group flex flex-col gap-2 rounded-xl border ${selectedClass} p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70`}
                  whileHover={{ translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={() => onSelect(value)}
                >
                  <span
                    className="h-12 sm:h-14 w-full rounded-lg border border-border/60 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-xxs sm:text-xs font-semibold text-foreground leading-tight">
                      {color.name}
                    </span>
                    {/* <span className="text-xxs text-gray-400">{color.hex}</span> */}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
