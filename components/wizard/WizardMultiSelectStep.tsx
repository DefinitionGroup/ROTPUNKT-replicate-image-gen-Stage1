"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { WizardOption } from "./wizardSteps";

interface WizardMultiSelectStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: WizardOption[];
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
  selectedValues,
  onToggle,
  onContinue,
  loading = false,
}) => {
  // Group options by their group property
  const groupedOptions = optionGroups
    ? optionGroups.map((group) => ({
        name: group,
        options: options.filter((opt) => opt.group === group),
      }))
    : [{ name: "", options }];

  return (
    <motion.div
      className="w-full flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: 320 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 shrink-0 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center text-red-400">
          {icon}
        </div>
        <div>
          <h3 className="text-xl md:text-2xl text-left tracking-tight text-brand-secondary-1">
            {title}
          </h3>
          <p className="text-sm text-gray-400 w-80 text-left mt-1 max-w-xl">
            {description}
          </p>
        </div>
      </div>

      {/* Selection counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          {selectedValues.length === 0
            ? "Keine Auswahl"
            : `${selectedValues.length} ausgewählt`}
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={onContinue}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Weiter →
        </Button>
      </div>

      {/* Grouped options */}
      <div className="space-y-6 overflow-y-auto max-h-[320px] pr-2">
        {groupedOptions.map(({ name, options: groupOptions }) => (
          <div key={name || "default"}>
            {name && (
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-gray-700" />
                <span>{name}</span>
                <span className="h-px flex-1 bg-gray-700" />
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
                      ${
                        isSelected
                          ? "border-red-500 bg-red-500/10 text-white"
                          : "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50"
                      }
                    `}
                  >
                    <div
                      className={`
                        h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-red-500 border-red-500"
                            : "border-gray-600 bg-transparent"
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

      {/* Selected items preview */}
      {selectedValues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-gray-800"
        >
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-sm text-red-300"
                >
                  {option?.label || value}
                  <button
                    onClick={() => onToggle(value)}
                    className="hover:text-red-100 transition-colors"
                    aria-label={`Remove ${option?.label || value}`}
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
