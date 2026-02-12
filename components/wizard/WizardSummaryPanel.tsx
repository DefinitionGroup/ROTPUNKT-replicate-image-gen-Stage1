"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useTranslatedWizardSteps } from "./useTranslatedWizardSteps";
import { useLocale, useTranslations } from "next-intl";
import type { WizardState } from "@/app/store/wizardStore";
import { getFenixColorLabel } from "./fenixColors";
import { getWizardProgress } from "./wizardProgress";
import { getFrontfarbenColorLabel } from "./frontfarbenCatalog";
import { getHandleSelectionLabel } from "./handleCatalog";

interface WizardSummaryPanelProps {
  selections: WizardState["selectedOptions"];
  extraWishes: string;
  currentStep: number;
  totalSteps: number;
  prompt: string;
  missingKeys: string[];
  isSignedIn: boolean;
  loading?: boolean;
  onSubmit: () => void;
  onRequireAuth: () => void;
  onJumpToFinal: () => void;
  onJumpToStep: (index: number) => void;
}

export function WizardSummaryPanel({
  selections,
  extraWishes: _extraWishes,
  currentStep,
  totalSteps,
  prompt: _prompt,
  missingKeys,
  isSignedIn,
  loading = false,
  onSubmit,
  onRequireAuth,
  onJumpToFinal,
  onJumpToStep,
}: WizardSummaryPanelProps) {
  void _extraWishes;
  void _prompt;
  const t = useTranslations("wizard.summary");
  const locale = useLocale();
  const translatedSteps = useTranslatedWizardSteps();

  const isComplete = missingKeys.length === 0;
  const isOnFinalStep = currentStep >= totalSteps;
  const { totalStages, currentStage, progressPercent } = getWizardProgress(
    currentStep,
    totalSteps
  );
  const activeIndex = currentStep >= 0 ? Math.min(currentStep, totalSteps - 1) : -1;

  const groupedSelections = useMemo(() => {
    return translatedSteps.map((step) => {
      const key = step.key as keyof WizardState["selectedOptions"];
      const selectedValue = selections[key];

      // Handle accessories as array
      if (step.key === "accessories" && Array.isArray(selectedValue)) {
        const selectedLabels = selectedValue.map((val) =>
          step.options.find((opt) => opt.value === val)?.label ?? val
        );
        return {
          key,
          title: step.label,
          description: step.description,
          selectedLabel: selectedLabels.length > 0 ? selectedLabels.join(", ") : undefined,
          isMulti: true,
          count: selectedLabels.length,
        };
      }

      const baseLabel = step.options.find(
        (opt) => opt.value === selectedValue
      )?.label;
      const selectedLabel =
        step.key === "color"
          ? getFrontfarbenColorLabel(selectedValue as string, locale) ??
          getFenixColorLabel(selectedValue as string) ??
          baseLabel
          : step.key === "handle"
            ? getHandleSelectionLabel(selectedValue as string, locale) ?? baseLabel
          : baseLabel;
      return {
        key,
        title: step.label,
        description: step.description,
        selectedLabel,
        isMulti: false,
        count: selectedLabel ? 1 : 0,
      };
    });
  }, [selections, translatedSteps, locale]);

  const renderPrimaryAction = () => {
    if (!isComplete) {
      return (
        <Button
          variant="redCta"
          size="cta"
          className="w-full justify-center"
          disabled
        >
          {t("selectAllOptions")}
        </Button>
      );
    }

    if (!isOnFinalStep) {
      return (
        <Button
          variant="redCta"
          size="cta"
          className="w-full justify-center"
          onClick={onJumpToFinal}
          enableMotion
        >
          {t("continueToWishes")}
        </Button>
      );
    }

    if (!isSignedIn) {
      return (
        <Button
          variant="red"
          size="cta"
          className="w-full justify-center"
          onClick={onRequireAuth}
          enableMotion
          disabled={loading}
        >
          {t("loginToGenerate")}
        </Button>
      );
    }

    return (
      <Button
        variant="red"
        size="cta"
        className="w-full justify-center"
        onClick={onSubmit}
        enableMotion
        disabled={loading}
      >
        {loading ? t("generating") : t("createImage")}
      </Button>
    );
  };

  return (
    <aside className="bg-card/80 border border-border rounded-2xl p-5 shadow-inner flex flex-col gap-5 w-full lg:max-w-sm max-h-[calc(96vh-6rem)]">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("progress")}
        </h4>
        <span className="text-xs text-muted-foreground">
          {t("step", { current: currentStage, total: totalStages })}
        </span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-primary-2"
          initial={false}
          animate={{
            width: `${progressPercent}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1"
      // style={{ maxHeight: "26rem" }}
      >
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {t("overview")}
        </h4>
        <div className="flex flex-col gap-3">
          {groupedSelections.map((item, idx) => (
            <button
              key={item.key as string}
              type="button"
              onClick={() => onJumpToStep(idx)}
              className={`text-left rounded-lg border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${idx === activeIndex
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-border bg-muted/60 hover:border-brand-primary-2/50 hover:bg-brand-primary-2/5"
                }`}
              disabled={loading}
            >
              <div className="flex items-center justify-between">
                <span className="text-xxs font-bold uppercase tracking-wide text-muted-foreground">
                  {idx + 1}. {item.title}
                </span>
                {item.selectedLabel ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <FaCheckCircle className="h-3 w-3" />
                    {t("selected")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <FaRegCircle className="h-3 w-3" />
                    {t("open")}
                  </span>
                )}
              </div>
              <p className="text-xs inline-block mt-1 font-bold text-foreground border rounded-3xl p-1 border-border px-7">
                {item.selectedLabel ?? t("noSelection")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border/70" />


      <div className="mt-auto flex flex-col gap-2">
        {renderPrimaryAction()}
        <p className="text-xs text-muted-foreground">
          {t("autoPromptNote")}
        </p>
      </div>
    </aside>
  );
}
