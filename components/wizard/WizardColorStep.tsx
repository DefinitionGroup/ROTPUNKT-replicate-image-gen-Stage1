import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { FaCheck } from "react-icons/fa6";
import type { ReactNode } from "react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  encodeFrontfarbenColorValue,
  frontfarbenCatalog,
  getDisplayMaterialDe,
  getDisplayMaterialEn,
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
import { StepHeader } from "./StepHeader";

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
      <StepHeader icon={icon} title={title} description={description} />

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
                  className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4 p-1"
                >
                  {frontfarbenOptions.map((color) => {
                    const value = encodeFrontfarbenColorValue(color.id);
                    const isSelected = selectedValue === value;
                    const colorLabel = normalizedLocale === "de" ? color.labelDe : color.labelEn;
                    const materialLabel =
                      normalizedLocale === "de"
                        ? getDisplayMaterialDe(color.materialTypeDe)
                        : getDisplayMaterialEn(color.materialTypeEn);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        className={`
                          group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 outline-none
                          focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background
                          ${isSelected
                            ? "ring-2 ring-brand-primary-2 shadow-lg shadow-brand-primary-2/10"
                            : "ring-1 ring-border/50 hover:ring-border hover:shadow-md"
                          }
                        `}
                        disabled={loading}
                        onClick={() => onSelect(value)}
                      >
                        <div className="relative h-20 sm:h-24 w-full overflow-hidden">
                          <Image
                            src={getFrontfarbenImageSrc(color.imagePath)}
                            alt={`${color.id} ${colorLabel}`}
                            fill
                            unoptimized
                            className={`object-cover transition-all duration-500 ${isSelected ? "scale-105 brightness-110" : "group-hover:scale-[1.04] group-hover:brightness-105"}`}
                            sizes="(max-width: 768px) 50vw, 280px"
                          />
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-primary-2 flex items-center justify-center shadow-lg"
                              >
                                <FaCheck className="w-2.5 h-2.5 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className={`px-5 py-5 transition-colors ${isSelected ? "bg-brand-primary-2" : "bg-card/80"}`}>
                          <span className={`text-xxs font-semibold uppercase tracking-wide ${isSelected ? "text-white/80" : "text-brand-primary-2"}`}>
                            {color.id}
                          </span>
                          <span className={`text-xs font-semibold leading-tight block mt-0.5 ${isSelected ? "text-white" : "text-foreground"}`}>
                            {colorLabel}
                          </span>
                          <span className={`text-xxs leading-tight block ${isSelected ? "text-white/60" : "text-muted-foreground"}`}>
                            {materialLabel} · {color.subcategory}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4 p-1">
              {options.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelect(opt.value)}
                    disabled={loading}
                    className={`
                      group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 outline-none
                      focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background
                      ${isSelected
                        ? "ring-2 ring-brand-primary-2 shadow-lg shadow-brand-primary-2/10"
                        : "ring-1 ring-border/50 hover:ring-border hover:shadow-md"
                      }
                    `}
                  >
                    <div className={`relative h-16 w-full flex items-center justify-center ${isSelected ? "bg-brand-primary-2" : "bg-muted/30 group-hover:bg-muted/50"}`}>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-primary-2 flex items-center justify-center shadow-lg"
                          >
                            <FaCheck className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className={`px-5 py-5 transition-colors ${isSelected ? "bg-brand-primary-2" : "bg-card/80"}`}>
                      <span className={`text-xs font-semibold leading-tight block ${isSelected ? "text-white" : "text-foreground"}`}>
                        {opt.label}
                      </span>
                      {opt.hint ? (
                        <span className={`text-xxs mt-0.5 block ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>{opt.hint}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 min-[430px]:grid-cols-3 lg:grid-cols-4 gap-2 pb-4 p-1">
            {fenixColors.map((color) => {
              const value = encodeFenixColorValue(
                color.selectionValue ?? color.name
              );
              const isSelected = selectedValue === value;

              return (
                <button
                  key={color.name}
                  type="button"
                  className={`
                    group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 outline-none
                    focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background
                    ${isSelected
                      ? "ring-2 ring-brand-primary-2 shadow-lg shadow-brand-primary-2/10"
                      : "ring-1 ring-border/50 hover:ring-border hover:shadow-md"
                    }
                  `}
                  disabled={loading}
                  onClick={() => onSelect(value)}
                >
                  <div className="relative p-3 pb-0">
                    <div
                      className={`relative block h-12 sm:h-14 w-full overflow-hidden rounded-lg border shadow-inner transition-all duration-300 ${isSelected ? "border-brand-primary-2/40 brightness-110" : "border-border/60"}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <Image
                        src={getFrontfarbenImageSrc(color.imagePath)}
                        alt={`${color.fxId} ${color.name}`}
                        fill
                        unoptimized
                        className={`object-cover transition-all duration-500 ${isSelected ? "scale-105 brightness-110" : "group-hover:scale-[1.04] group-hover:brightness-105"}`}
                        sizes="(max-width: 768px) 50vw, 180px"
                      />
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-primary-2 flex items-center justify-center shadow-lg"
                        >
                          <FaCheck className="w-2.5 h-2.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={`px-5 py-5 transition-colors ${isSelected ? "bg-brand-primary-2" : "bg-card/80"}`}>
                    <span className={`text-xxs sm:text-xs font-semibold leading-tight block ${isSelected ? "text-white" : "text-foreground"}`}>
                      {color.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
