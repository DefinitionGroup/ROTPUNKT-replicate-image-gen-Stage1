"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@nanostores/react";
import { useAuth } from "@clerk/nextjs";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/card";
import {
  wizardStore,
  wizardActions,
  WizardState,
} from "../../app/store/wizardStore";
import { WizardHeader } from "./WizardHeader";
import { WizardIntro } from "./WizardIntro";
import { WizardStep } from "./WizardStep";
import { WizardMultiSelectStep } from "./WizardMultiSelectStep";
import { WizardFinal } from "./WizardFinal";
import { wizardSteps } from "./wizardSteps";
import { useTranslatedWizardSteps } from "./useTranslatedWizardSteps";
import { WizardSummaryPanel } from "./WizardSummaryPanel";
import { buildPrompt } from "./promptBuilder";
import type { WizardPreset } from "./wizardPresets";
import { WizardColorStep } from "./WizardColorStep";
import { useTranslations } from "next-intl";

interface KitchenWizardModalProps {
  onPromptReady: (prompt: string) => void;
  loading?: boolean;
  onClose?: () => void;
}

export const KitchenWizardModal: React.FC<KitchenWizardModalProps> = ({
  onPromptReady,
  loading = false,
  onClose,
}) => {
  const tSummary = useTranslations("wizard.summary");
  const wizardState = useStore(wizardStore);
  const { isSignedIn } = useAuth();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const translatedSteps = useTranslatedWizardSteps();

  const totalSteps = wizardSteps.length;

  const summaryData = useMemo(
    () =>
      buildPrompt({
        selections: wizardState.selectedOptions,
        extraWishes: wizardState.extraWishes,
      }),
    [wizardState.selectedOptions, wizardState.extraWishes]
  );

  const isFinalStep = wizardState.currentStep === totalSteps;
  const isIntro = wizardState.currentStep === -1;
  const showSummaryPanel = !isIntro;
  const currentStepDefinition =
    !isIntro && !isFinalStep && wizardState.currentStep >= 0
      ? translatedSteps[wizardState.currentStep]
      : undefined;
  const isColorStep = currentStepDefinition?.key === "color";
  const isMultiSelectStep = currentStepDefinition?.multiSelect === true;

  const startWithPreset = (preset: WizardPreset) => {
    setIsSummaryCollapsed(true);
    wizardActions.applyPreset({
      options: preset.options,
      extraWishes: preset.extraWishes,
    });
    wizardActions.setStep(0);
  };

  const startBlank = () => {
    setIsSummaryCollapsed(true);
    wizardActions.reset();
    wizardActions.setStep(0);
  };

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    stepContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [wizardState.currentStep]);

  const handleOptionSelect = (option: string) => {
    if (
      wizardState.currentStep < 0 ||
      wizardState.currentStep >= wizardSteps.length
    )
      return;

    const currentStepKey = wizardSteps[wizardState.currentStep]
      .key as keyof WizardState["selectedOptions"];
    wizardActions.selectOption(currentStepKey, option);
    wizardActions.nextStep(totalSteps);
  };

  const handleMultiSelectToggle = (option: string) => {
    wizardActions.toggleMultiOption("accessories", option);
  };

  const handleMultiSelectContinue = () => {
    wizardActions.nextStep(totalSteps);
  };

  const handleSubmit = () => {
    if (summaryData.missingKeys.length > 0) {
      wizardActions.setError("Bitte alle Schritte ausfüllen.");
      return;
    }

    onPromptReady(summaryData.prompt);
    if (onClose) onClose();
  };

  const canGoBack = wizardState.currentStep > -1;
  const missingKeys = summaryData.missingKeys;

  return (
    <AnimatePresence>
      <motion.div
        key="wizard-popover"
        ref={overlayRef}
        className="fixed inset-0 z-9999990 flex items-center justify-center overflow-y-auto bg-background/20 backdrop-blur-lg p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, type: "spring" }}
          className="relative w-full max-w-[980px] h-[calc(100dvh-1rem)] sm:h-[96vh] max-h-[640px] min-h-0 z-[999999999]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full h-full min-h-0 sm:min-h-[500px] flex flex-col shadow-2xl bg-card/95 border border-border rounded-2xl overflow-hidden">
            <CardHeader>
              <WizardHeader
                currentStep={wizardState.currentStep}
                totalSteps={wizardSteps.length}
                onBack={wizardActions.goBack}
                onClose={onClose}
                canGoBack={canGoBack}
                loading={loading}
              />
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
              {showSummaryPanel && (
                <div className="mb-3 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSummaryCollapsed((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    aria-label={
                      isSummaryCollapsed
                        ? tSummary("showDetails")
                        : tSummary("hideDetails")
                    }
                  >
                    {isSummaryCollapsed ? (
                      <PanelRightOpen className="h-3.5 w-3.5" />
                    ) : (
                      <PanelRightClose className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isSummaryCollapsed
                        ? tSummary("showDetails")
                        : tSummary("hideDetails")}
                    </span>
                  </button>
                </div>
              )}

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 h-full min-h-0 overflow-hidden">
                  <div
                    ref={stepContainerRef}
                    className="flex-1 flex flex-col min-h-0 overflow-y-auto touch-pan-y [-webkit-overflow-scrolling:touch]"
                  >
                  <AnimatePresence mode="wait" initial={false}>
                    {isIntro && (
                      <WizardIntro
                        key="intro"
                        onPresetSelect={startWithPreset}
                        onBlankStart={startBlank}
                        loading={loading}
                      />
                    )}

                    {!isIntro && !isFinalStep && currentStepDefinition && (
                      isColorStep ? (
                        <WizardColorStep
                          key={`${wizardState.currentStep}-color`}
                          icon={currentStepDefinition.icon}
                          title={currentStepDefinition.label}
                          description={currentStepDefinition.description}
                          options={currentStepDefinition.options}
                          selectedValue={
                            wizardState.selectedOptions.color
                          }
                          onSelect={handleOptionSelect}
                          loading={loading}
                        />
                      ) : isMultiSelectStep ? (
                        <WizardMultiSelectStep
                          key={`${wizardState.currentStep}-multiselect`}
                          icon={currentStepDefinition.icon}
                          title={currentStepDefinition.label}
                          description={currentStepDefinition.description}
                          options={currentStepDefinition.options}
                          optionGroups={currentStepDefinition.optionGroups}
                          selectedValues={
                            wizardState.selectedOptions.accessories || []
                          }
                          onToggle={handleMultiSelectToggle}
                          onContinue={handleMultiSelectContinue}
                          loading={loading}
                        />
                      ) : (
                        <WizardStep
                          key={wizardState.currentStep}
                          icon={currentStepDefinition.icon}
                          title={currentStepDefinition.label}
                          description={currentStepDefinition.description}
                          options={currentStepDefinition.options}
                          selectedValue={
                            wizardState.selectedOptions[
                            currentStepDefinition.key as Exclude<keyof WizardState["selectedOptions"], "accessories">
                            ] as string | undefined
                          }
                          onSelect={handleOptionSelect}
                          loading={loading}
                        />
                      )
                    )}

                    {isFinalStep && (
                      <WizardFinal
                        key="final"
                        extraWishes={wizardState.extraWishes}
                        onExtraWishesChange={wizardActions.setExtraWishes}
                        showAuthPrompt={wizardState.showAuthPrompt}
                        isSignedIn={!!isSignedIn}
                        onSubmit={handleSubmit}
                        onAuthRequired={() => wizardActions.setAuthPrompt(true)}
                        loading={loading}
                        showSubmitButton={true}
                      />
                    )}
                  </AnimatePresence>

                  {wizardState.error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-destructive text-center mt-6"
                      role="alert"
                    >
                      {wizardState.error}
                    </motion.p>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {showSummaryPanel && !isSummaryCollapsed && (
                    <motion.div
                      key="wizard-summary-panel"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2 }}
                      className="w-full lg:max-w-sm"
                    >
                      <WizardSummaryPanel
                        selections={wizardState.selectedOptions}
                        extraWishes={wizardState.extraWishes}
                        currentStep={wizardState.currentStep}
                        totalSteps={totalSteps}
                        prompt={summaryData.prompt}
                        missingKeys={missingKeys}
                        isSignedIn={!!isSignedIn}
                        loading={loading}
                        onSubmit={handleSubmit}
                        onRequireAuth={() => wizardActions.setAuthPrompt(true)}
                        onJumpToFinal={() => wizardActions.setStep(totalSteps)}
                        onJumpToStep={(index) => wizardActions.setStep(index)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
