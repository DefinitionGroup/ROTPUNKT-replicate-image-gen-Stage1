"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { WizardState } from "@/app/store/wizardStore";
import { getFenixColorLabel } from "./fenixColors";
import { getFrontfarbenColorLabel } from "./frontfarbenCatalog";
import { getHandleSelectionLabel } from "./handleCatalog";
import { kitchenLayoutOptions } from "./wizardSteps";
import { hasIslandLayout, kitchenZoneOptions, resolveKitchenZones } from "./kitchenZones";
import { useTranslatedWizardSteps } from "./useTranslatedWizardSteps";

export type WizardSelectionItem = {
  key: string;
  stepIndex: number;
  title: string;
  description: string;
  selectedLabel: string | undefined;
  isMulti: boolean;
  count: number;
};

/**
 * Every decision the wizard holds, in step order, with its human label —
 * the atmosphere step expanded into its three parts, the kitchen layout and
 * the sink/cooktop placement listed under the room step they belong to.
 */
export function useWizardSelectionSummary(
  selections: WizardState["selectedOptions"]
): WizardSelectionItem[] {
  const tLayout = useTranslations("wizard.kitchenLayout");
  const tZones = useTranslations("wizard.kitchenZones");
  const tOptions = useTranslations();
  const locale = useLocale();
  const translatedSteps = useTranslatedWizardSteps();

  return useMemo(() => {
    const items: WizardSelectionItem[] = [];

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
}
