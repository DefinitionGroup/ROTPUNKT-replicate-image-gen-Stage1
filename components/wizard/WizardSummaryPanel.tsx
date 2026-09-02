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
import { kitchenLayoutOptions } from "./wizardSteps";
import {
  hasIslandLayout,
  kitchenZoneOptions,
  resolveKitchenZones,
} from "./kitchenZones";

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
  prompt,
  missingKeys,
  isSignedIn,
  loading = false,
  onSubmit,
  onRequireAuth,
  onJumpToFinal,
  onJumpToStep,
}: WizardSummaryPanelProps) {
  void _extraWishes;

  const t = useTranslations("wizard.summary");
  const tLayout = useTranslations("wizard.kitchenLayout");
  const tZones = useTranslations("wizard.kitchenZones");
  const tOptions = useTranslations();
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
    type SelectionItem = {
      key: string;
      stepIndex: number;
      title: string;
      description: string;
      selectedLabel: string | undefined;
      isMulti: boolean;
      count: number;
    };

    const items: SelectionItem[] = [];

    translatedSteps.forEach((step, stepIndex) => {
      // Handle atmosphere step — expand into sub-steps
      if (step.key === "atmosphere" && step.translatedSubSteps) {
        for (const [subKey, subStep] of Object.entries(step.translatedSubSteps)) {
          const selectedValue = selections[subKey as keyof WizardState["selectedOptions"]] as string | undefined;
          const baseLabel = subStep.options.find(
            (opt) => opt.value === selectedValue
          )?.label;
          items.push({
            key: subKey,
            stepIndex,
            title: subStep.label,
            description: subStep.description,
            selectedLabel: baseLabel,
            isMulti: false,
            count: baseLabel ? 1 : 0,
          });
        }
        return;
      }

      const key = step.key as keyof WizardState["selectedOptions"];
      const selectedValue = selections[key];

      // Handle accessories as array
      if (step.key === "accessories" && Array.isArray(selectedValue)) {
        const selectedLabels = selectedValue.map((val) =>
          step.options.find((opt) => opt.value === val)?.label ?? val
        );
        items.push({
          key: key as string,
          stepIndex,
          title: step.label,
          description: step.description,
          selectedLabel: selectedLabels.length > 0 ? selectedLabels.join(", ") : undefined,
          isMulti: true,
          count: selectedLabels.length,
        });
        return;
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
      items.push({
        key: key as string,
        stepIndex,
        title: step.label,
        description: step.description,
        selectedLabel,
        isMulti: false,
        count: selectedLabel ? 1 : 0,
      });

      // Show kitchen layout sub-selection after the "kind" step
      if (step.key === "kind" && selections.kitchenLook) {
        const layoutOpt = kitchenLayoutOptions.find(
          (o) => o.value === selections.kitchenLook
        );
        const layoutLabel = layoutOpt
          ? tOptions(layoutOpt.labelKey)
          : selections.kitchenLook;
        items.push({
          key: "kitchenLook",
          stepIndex,
          title: tLayout("title"),
          description: tLayout("description"),
          selectedLabel: layoutLabel,
          isMulti: false,
          count: 1,
        });
      }

      // Sink and cooktop placement only exist for the island layout
      if (step.key === "kind" && hasIslandLayout(selections)) {
        const zones = resolveKitchenZones(selections);
        const zoneLabel = (value: string) => {
          const opt = kitchenZoneOptions.find((o) => o.value === value);
          return opt ? tOptions(opt.labelKey) : value;
        };
        items.push(
          {
            key: "sinkLocation",
            stepIndex,
            title: tZones("sink"),
            description: tZones("sinkHint"),
            selectedLabel: zoneLabel(zones.sinkLocation),
            isMulti: false,
            count: 1,
          },
          {
            key: "cooktopLocation",
            stepIndex,
            title: tZones("cooktop"),
            description: tZones("cooktopHint"),
            selectedLabel: zoneLabel(zones.cooktopLocation),
            isMulti: false,
            count: 1,
          }
        );
      }
    });

    return items;
  }, [selections, translatedSteps, locale, tLayout, tOptions, tZones]);

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
    <aside className="bg-card/80 border border-border rounded-2xl p-5 shadow-inner flex flex-col gap-5 w-full lg:max-w-sm lg:h-full max-h-[85vh] lg:max-h-full">
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

      <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 max-h-[40vh] lg:max-h-none">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {t("overview")}
        </h4>
        <div className="flex flex-col gap-3">
          {groupedSelections.map((item, idx) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onJumpToStep(item.stepIndex)}
              className={`text-left rounded-lg border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${item.stepIndex === activeIndex
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

      <div className="text-xs text-muted-foreground">
        <details className="group">
          <summary className="cursor-pointer font-semibold mb-2 hover:text-foreground transition-colors list-none flex items-center gap-2">
            <span className="text-xxs uppercase tracking-wide">Prompt Preview</span>
            <span className="text-[10px] opacity-50 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50 font-mono text-[10px] leading-relaxed break-words">
            {prompt || t("noPromptYet")}
          </div>
        </details>
      </div>


      <div className="mt-auto flex flex-col gap-2">
        {renderPrimaryAction()}
        <p className="text-xs text-muted-foreground">
          {t("autoPromptNote")}
        </p>
      </div>
    </aside>
  );
}
