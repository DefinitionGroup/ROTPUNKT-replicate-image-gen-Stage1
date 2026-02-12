import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  encodeFrontfarbenColorValue,
  frontfarbenCatalog,
  getFrontfarbenByMaterialTab,
  getFrontfarbenImageSrc,
  getFrontfarbenMaterialTabPreviewImage,
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
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);
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

  useEffect(() => {
    if (activeTab !== "frontfarben") {
      setIsMaterialMenuOpen(false);
    }
  }, [activeTab]);

  const renderTabDescription = () => {
    const current = tabs.find((tab) => tab.id === activeTab);
    return current?.description ?? "";
  };

  const activeMaterialLabel = useMemo(() => {
    if (activeMaterialTab === ALL_MATERIALS_TAB_ID) {
      return t("allMaterials");
    }
    const tab = materialTabs.find((entry) => entry.id === activeMaterialTab);
    if (!tab) {
      return t("allMaterials");
    }
    return normalizedLocale === "de" ? tab.labelDe : tab.labelEn;
  }, [activeMaterialTab, materialTabs, normalizedLocale, t]);

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
        <p className="text-xxs text-muted-foreground text-left leading-snug break-words">{renderTabDescription()}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        {activeTab === "frontfarben" ? (
          hasFrontfarbenOptions ? (
            <div className="flex flex-col gap-3">
              <div className="sticky top-0 z-20 pb-2 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-xl">
                <div className="rounded-xl border border-border p-2 sm:p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`px-3 sm:px-4 py-1.5 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 text-xs ${activeMaterialTab === ALL_MATERIALS_TAB_ID
                        ? "border-brand-primary-2 bg-brand-primary-2 text-white shadow"
                        : "border-border bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      onClick={() => {
                        setActiveMaterialTab(ALL_MATERIALS_TAB_ID);
                        setIsMaterialMenuOpen(false);
                      }}
                      disabled={loading}
                      aria-pressed={activeMaterialTab === ALL_MATERIALS_TAB_ID}
                    >
                      {t("allMaterials")}
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-border bg-muted/60 text-xs text-foreground transition hover:border-brand-primary-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70"
                      onClick={() => setIsMaterialMenuOpen((value) => !value)}
                      disabled={loading}
                      aria-expanded={isMaterialMenuOpen}
                      aria-controls="frontfarben-material-menu"
                    >
                      <span>{activeMaterialLabel}</span>
                      {isMaterialMenuOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isMaterialMenuOpen ? (
                      <motion.div
                        id="frontfarben-material-menu"
                        initial={{ opacity: 0, y: 6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 6, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-3 gap-2">
                          {materialTabs.map((tab) => {
                            const isActive = tab.id === activeMaterialTab;
                            const tabLabel = normalizedLocale === "de" ? tab.labelDe : tab.labelEn;
                            const previewImagePath = getFrontfarbenMaterialTabPreviewImage(tab.id);
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                className={`w-full px-3 py-2 rounded-lg border text-xs text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isActive
                                  ? "border-brand-primary-2 bg-brand-primary-2/15 text-foreground"
                                  : "border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-brand-primary-2/50"
                                  }`}
                                onClick={() => {
                                  setActiveMaterialTab(tab.id);
                                  setIsMaterialMenuOpen(false);
                                }}
                                disabled={loading}
                                aria-pressed={isActive}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="relative h-9 w-9 rounded-md overflow-hidden border border-border/60 bg-background shrink-0">
                                    {previewImagePath ? (
                                      <Image
                                        src={getFrontfarbenImageSrc(previewImagePath)}
                                        alt={tabLabel}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        sizes="36px"
                                      />
                                    ) : null}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="truncate text-xs font-medium text-foreground">
                                      {tabLabel}
                                    </span>
                                    <span className="inline-flex w-fit font-bold items-center rounded-full border border-border/70 bg-muted/70 px-1.5 py-0.5 text-xxs text-brand-primary-2 leading-none">
                                      {tab.count}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeMaterialTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4"
                >
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
                </motion.div>
              </AnimatePresence>
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
