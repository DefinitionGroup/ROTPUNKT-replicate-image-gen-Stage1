"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
import { StepHeader } from "./StepHeader";

interface WizardMultiSelectStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: TranslatedWizardOption[];
  optionGroups?: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onContinue: () => void;
  loading?: boolean;
}

export const WizardMultiSelectStep: React.FC<WizardMultiSelectStepProps> = ({
  icon,
  title,
  description,
  options,
  optionGroups,
  selectedValues: rawSelectedValues,
  onToggle,
  onContinue,
  loading = false,
}) => {
  const t = useTranslations("wizard.multiselect");
  // Normalize selectedValues to always be an array (handle object format from old localStorage)
  const selectedValues = Array.isArray(rawSelectedValues)
    ? rawSelectedValues
    : typeof rawSelectedValues === 'object' && rawSelectedValues !== null
      ? Object.keys(rawSelectedValues).filter(key => (rawSelectedValues as Record<string, boolean>)[key])
      : [];

  // Group options by their group property
  const groupedOptions = optionGroups
    ? optionGroups.map((group) => ({
      name: group,
      options: options.filter((opt) => opt.group === group),
    }))
    : [{ name: "", options }];

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

      {/* Selection counter */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-sm text-muted-foreground">
          {selectedValues.length === 0
            ? t("noSelection")
            : t("selected", { count: selectedValues.length })}
        </span>
        <Button
          variant="red"
          size="sm"
          onClick={onContinue}
          disabled={loading}
        >
          {t("continue")}
        </Button>
      </div>

      {/* Grouped options */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="space-y-6 pb-4">
          {groupedOptions.map(({ name, options: groupOptions }) => (
            <div key={name || "default"}>
              {name && (
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span>{name}</span>
                  <span className="h-px flex-1 bg-border" />
                </h4>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {groupOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <Button
                      key={opt.value}
                      variant="outline"
                      size="sm"
                      onClick={() => onToggle(opt.value)}
                      disabled={loading}
                      className={`
                      relative h-auto py-3 px-4 text-left justify-start gap-3
                      border transition-all duration-200
                      ${isSelected
                          ? "border-brand-primary-2 bg-brand-primary-2/10 text-foreground"
                          : "border-border bg-muted/60 text-muted-foreground hover:border-border/90 hover:bg-muted"
                        }
                    `}
                    >
                      <div
                        className={`
                        h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors
                        ${isSelected
                            ? "bg-brand-primary-2 border-brand-primary-2"
                            : "border-border bg-transparent"
                          }
                      `}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className="text-sm">{opt.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected items preview */}
      {selectedValues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-border"
        >
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/30 text-sm text-brand-primary-2"
                >
                  {option?.label || value}
                  <button
                    onClick={() => onToggle(value)}
                    className="hover:text-brand-primary-2 transition-colors"
                    aria-label={t("remove")}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
