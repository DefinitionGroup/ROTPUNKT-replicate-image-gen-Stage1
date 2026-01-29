"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@nanostores/react";
import { useAuth } from "@clerk/nextjs";
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
  const wizardState = useStore(wizardStore);
  const { isSignedIn } = useAuth();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const translatedSteps = useTranslatedWizardSteps();

  const CARD_HEIGHT = 640;
  const CARD_WIDTH = 980;
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
    wizardActions.applyPreset({
      options: preset.options,
      extraWishes: preset.extraWishes,
    });
    wizardActions.setStep(0);
  };

  const startBlank = () => {
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

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.target === overlayRef.current && onClose) {
      onClose();
    }
  };

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
        className="fixed inset-0 z-9999990 flex items-center justify-center bg-black/80 backdrop-blur-sm absolute"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        tabIndex={-1}
        // [[fix]]  Disabled onClick to prevent closing modal when clicking on overlay
        // onClick={handleOverlayClick} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, type: "spring" }}
          className="relative"
          style={{
            width: CARD_WIDTH,
            minWidth: CARD_WIDTH,
            maxWidth: "98vw",
            minHeight: CARD_HEIGHT,
            maxHeight: "96vh",
            zIndex: 999999999,
            position: "relative",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full h-full min-h-[500px] max-h-[96vh] flex flex-col shadow-2xl bg-gradient-to-br from-black/100 via-neutral-950 to-neutral-900/50 border border-gray-800 rounded-2xl overflow-hidden">
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

            <CardContent className="flex-1 flex flex-col p-6 sm:p-8 overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
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
                      className="text-red-400 text-center mt-6"
                      role="alert"
                    >
                      {wizardState.error}
                    </motion.p>
                  )}
                </div>

                {showSummaryPanel && (
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
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
