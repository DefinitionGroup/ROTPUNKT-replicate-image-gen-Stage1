import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
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

type ColorTab = "standard" | "fenix";

const TABS: { id: ColorTab; label: string; description: string }[] = [
  {
    id: "standard",
    label: "Rotpunkt Palette",
    description: "Unsere kuratierte Auswahl beliebter Farbwünsche.",
  },
  {
    id: "fenix",
    label: "FENIX Palette",
    description: "Originale FENIX NTM® Oberflächenfarben zur Auswahl.",
  },
];

export function WizardColorStep({
  icon,
  title,
  description,
  options,
  selectedValue,
  onSelect,
  loading = false,
}: WizardColorStepProps) {
  const initialTab: ColorTab = isFenixColorValue(selectedValue)
    ? "fenix"
    : "standard";
  const [activeTab, setActiveTab] = useState<ColorTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const renderTabDescription = () => {
    const current = TABS.find((tab) => tab.id === activeTab);
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
          <h3 className="text-xl text-left md:text-2xl tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">{description}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 shrink-0">
        <div className="inline-flex rounded-full border border-border bg-muted/60 p-1 text-xs text-muted-foreground max-w-max">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-1.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 ${isActive
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

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {activeTab === "standard" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
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
                  className="h-auto py-4 px-5 text-left flex-col items-start gap-2 border-border/70 bg-muted/60 backdrop-blur rounded-xl"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                  {opt.hint ? (
                    <span className="text-xs text-muted-foreground">{opt.hint}</span>
                  ) : null}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pb-4">
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
                  className={`group flex flex-col gap-3 rounded-xl border ${selectedClass} p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70`}
                  whileHover={{ translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={() => onSelect(value)}
                >
                  <span
                    className="h-16 w-full rounded-lg border border-border/60 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground">
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
