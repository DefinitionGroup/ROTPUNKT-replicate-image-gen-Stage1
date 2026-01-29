"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { wizardSteps, type WizardStepDefinition, type WizardOption } from "./wizardSteps";

export type TranslatedWizardOption = Omit<WizardOption, "labelKey" | "hintKey" | "group"> & {
  label: string;
  hint?: string;
  group?: string;
};

export type TranslatedWizardStep = Omit<WizardStepDefinition, "labelKey" | "descriptionKey" | "options" | "optionGroupKeys"> & {
  label: string;
  description: string;
  options: TranslatedWizardOption[];
  optionGroups?: string[];
};

export function useTranslatedWizardSteps(): TranslatedWizardStep[] {
  const t = useTranslations();

  return useMemo(() => {
    return wizardSteps.map((step) => ({
      ...step,
      label: t(step.labelKey),
      description: t(step.descriptionKey),
      optionGroups: step.optionGroupKeys?.map((key) => t(key)),
      options: step.options.map((opt) => ({
        value: opt.value,
        germanLabel: opt.germanLabel,
        label: t(opt.labelKey),
        hint: opt.hintKey ? t(opt.hintKey) : undefined,
        image: opt.image,
        group: opt.group ? t(opt.group) : undefined,
      })),
    }));
  }, [t]);
}

export function useTranslatedWizardStep(stepIndex: number): TranslatedWizardStep | undefined {
  const translatedSteps = useTranslatedWizardSteps();
  return translatedSteps[stepIndex];
}
