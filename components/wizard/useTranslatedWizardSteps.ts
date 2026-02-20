"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { wizardSteps, type WizardStepDefinition, type WizardOption, type WizardSubStep } from "./wizardSteps";

export type TranslatedWizardOption = Omit<WizardOption, "labelKey" | "hintKey" | "group"> & {
  label: string;
  hint?: string;
  group?: string;
};

export type TranslatedSubStep = Omit<WizardSubStep, "labelKey" | "descriptionKey" | "options"> & {
  label: string;
  description: string;
  options: TranslatedWizardOption[];
};

export type TranslatedWizardStep = Omit<WizardStepDefinition, "labelKey" | "descriptionKey" | "options" | "optionGroupKeys" | "subSteps"> & {
  label: string;
  description: string;
  options: TranslatedWizardOption[];
  optionGroups?: string[];
  translatedSubSteps?: Record<string, TranslatedSubStep>;
};

function translateOption(opt: WizardOption, t: (key: string) => string): TranslatedWizardOption {
  return {
    value: opt.value,
    germanLabel: opt.germanLabel,
    englishLabel: opt.englishLabel,
    label: t(opt.labelKey),
    hint: opt.hintKey ? t(opt.hintKey) : undefined,
    image: opt.image,
    group: opt.group ? t(opt.group) : undefined,
  };
}

export function useTranslatedWizardSteps(): TranslatedWizardStep[] {
  const t = useTranslations();

  return useMemo(() => {
    return wizardSteps.map((step) => {
      // Translate subSteps if present
      let translatedSubSteps: Record<string, TranslatedSubStep> | undefined;
      if (step.subSteps) {
        translatedSubSteps = {};
        for (const [subKey, subStep] of Object.entries(step.subSteps)) {
          translatedSubSteps[subKey] = {
            label: t(subStep.labelKey),
            description: t(subStep.descriptionKey),
            options: subStep.options.map((opt) => translateOption(opt, t)),
          };
        }
      }

      return {
        ...step,
        label: t(step.labelKey),
        description: t(step.descriptionKey),
        optionGroups: step.optionGroupKeys?.map((key) => t(key)),
        options: step.options.map((opt) => translateOption(opt, t)),
        translatedSubSteps,
      };
    });
  }, [t]);
}

export function useTranslatedWizardStep(stepIndex: number): TranslatedWizardStep | undefined {
  const translatedSteps = useTranslatedWizardSteps();
  return translatedSteps[stepIndex];
}
