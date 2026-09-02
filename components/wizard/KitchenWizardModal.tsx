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
import {
  $promptPipelineV2Enabled,
  loadRuntimeConfig,
} from "../../app/store/runtimeConfig";
import { WizardHeader } from "./WizardHeader";
import { WizardIntro } from "./WizardIntro";
import { WizardStep } from "./WizardStep";
import { WizardMultiSelectStep } from "./WizardMultiSelectStep";
import { WizardAtmosphereStep } from "./WizardAtmosphereStep";
import { WizardFinal } from "./WizardFinal";
import { wizardSteps } from "./wizardSteps";
import { useTranslatedWizardSteps } from "./useTranslatedWizardSteps";
import { WizardSummaryPanel } from "./WizardSummaryPanel";
import { buildPrompt, toGenerationRequestSpec } from "./promptBuilder";
import type { GenerationRequestSpec } from "@/lib/imageGenerationContract";
import type { WizardPreset } from "./wizardPresets";
import { WizardColorStep } from "./WizardColorStep";
import { WizardHandleStep } from "./WizardHandleStep";
import { WizardKitchenLayoutPanel } from "./WizardKitchenLayoutPanel";
import { PromptDebugPopover } from "./PromptDebugPopover";
import { useTranslations } from "next-intl";

interface KitchenWizardModalProps {
  onPromptReady: (spec: GenerationRequestSpec) => void;
  loading?: boolean;
  onClose?: () => void;
}

export const KitchenWizardModal: React.FC<KitchenWizardModalProps> = ({
  onPromptReady,
  loading = false,
  onClose,
}) => {
  const tSummary = useTranslations("wizard.summary");
  const tIntroPresets = useTranslations("wizard.intro.presets");
  const tErrors = useTranslations("wizard.errors");
  const wizardState = useStore(wizardStore);
  const promptPipelineV2Enabled = useStore($promptPipelineV2Enabled);
  const { isSignedIn } = useAuth();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [showKitchenLayout, setShowKitchenLayout] = useState(false);
  const translatedSteps = useTranslatedWizardSteps();
  const promptDebugEnv = (process.env.NEXT_PUBLIC_WIZARD_PROMPT_DEBUG ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  const showPromptDebugPopover =
    process.env.NODE_ENV === "development" &&
    (promptDebugEnv === "true" ||
      promptDebugEnv === "1" ||
      promptDebugEnv === "yes" ||
      promptDebugEnv === "on");

  const totalSteps = wizardSteps.length;

  const summaryData = useMemo(
    () =>
      buildPrompt({
        selections: wizardState.selectedOptions,
        extraWishes: wizardState.extraWishes,
        pipelineV2Enabled: promptPipelineV2Enabled,
      }),
    [
      wizardState.selectedOptions,
      wizardState.extraWishes,
      promptPipelineV2Enabled,
    ]
  );

  const isFinalStep = wizardState.currentStep === totalSteps;
  const isIntro = wizardState.currentStep === -1;
  const showSummaryPanel = !isIntro;
  const currentStepDefinition =
    !isIntro && !isFinalStep && wizardState.currentStep >= 0
      ? translatedSteps[wizardState.currentStep]
      : undefined;
  const isColorStep = currentStepDefinition?.key === "color";
  const isHandleStep = currentStepDefinition?.key === "handle";
  const isAtmosphereStep = currentStepDefinition?.key === "atmosphere";
  const isMultiSelectStep = currentStepDefinition?.multiSelect === true;
  const isFloorStep = currentStepDefinition?.key === "floor";
  const isKindStepWithLayout = currentStepDefinition?.key === "kind" && showKitchenLayout;
  const debugStepLabel = isIntro
    ? "intro"
    : isFinalStep
      ? "final"
      : `${wizardState.currentStep + 1}/${totalSteps} (${currentStepDefinition?.key ?? "unknown"})`;

  const startWithPreset = (preset: WizardPreset) => {
    setIsSummaryCollapsed(true);
    wizardActions.applyPreset({
      options: preset.options,
      extraWishes: tIntroPresets(`${preset.id}.extraWishes`),
    });
    wizardActions.setStep(totalSteps);
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
    void loadRuntimeConfig();
  }, []);

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

  // Reset kitchen layout panel when navigating away from the kind step
  const kindStepIndex = wizardSteps.findIndex((s) => s.key === "kind");
  useEffect(() => {
    if (wizardState.currentStep !== kindStepIndex) {
      setShowKitchenLayout(false);
    }
  }, [wizardState.currentStep, kindStepIndex]);

  // Override back button to go back to kind grid from kitchen layout panel
  const handleBack = () => {
    if (showKitchenLayout) {
      setShowKitchenLayout(false);
      return;
    }
    wizardActions.goBack();
  };

  const handleOptionSelect = (option: string) => {
    if (
      wizardState.currentStep < 0 ||
      wizardState.currentStep >= wizardSteps.length
    )
      return;

    const currentStepKey = wizardSteps[wizardState.currentStep]
      .key as keyof WizardState["selectedOptions"];

    // Intercept kitchen selection in the "kind" step
    if (currentStepKey === "kind" && option === "kueche") {
      wizardActions.selectOption(currentStepKey, option);
      setShowKitchenLayout(true);
      return;
    }

    // Clear kitchenLook when selecting a non-kitchen kind
    if (currentStepKey === "kind" && option !== "kueche") {
      const current = wizardStore.get();
      if (current.selectedOptions.kitchenLook) {
        const nextSelectedOptions = { ...current.selectedOptions };
        delete nextSelectedOptions.kitchenLook;
        wizardStore.set({
          ...current,
          selectedOptions: nextSelectedOptions,
        });
      }
    }

    wizardActions.selectOption(currentStepKey, option);
    wizardActions.nextStep(totalSteps);
  };

  const handleKitchenLayoutSelect = (value: string) => {
    wizardActions.selectOption("kitchenLook", value);
    setShowKitchenLayout(false);
    wizardActions.nextStep(totalSteps);
  };

  const handleKitchenLayoutSkip = () => {
    setShowKitchenLayout(false);
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
      wizardActions.setError(tErrors("fillAllSteps"));
      return;
    }

    // Capture prompt and contract together before onClose resets the wizard state.
    onPromptReady(toGenerationRequestSpec(summaryData));
    if (onClose) onClose();
  };

  const canGoBack = wizardState.currentStep > -1;
  const missingKeys = summaryData.missingKeys;

  return (
    <AnimatePresence>
      <motion.div
        key="wizard-popover"
        ref={overlayRef}
        className="fixed inset-x-0 bottom-0 top-[calc(4.75rem+env(safe-area-inset-top))] md:inset-0 z-[2147483645] md:z-[2147483647] flex items-start md:items-center justify-center overflow-y-auto bg-background/20 backdrop-blur-lg p-2 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <PromptDebugPopover
          enabled={showPromptDebugPopover}
          stepLabel={debugStepLabel}
          missingKeys={missingKeys}
          sections={summaryData.modelSections}
          prompt={summaryData.modelPrompt}
        />

        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, type: "spring" }}
          className="relative w-full max-w-[980px] h-full md:h-[96vh] md:max-h-[90vh] min-h-0 z-[999999999]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full h-full min-h-0 sm:min-h-[500px] flex flex-col shadow-2xl bg-card/95 border border-border rounded-2xl overflow-hidden">
            <CardHeader>
              <WizardHeader
                currentStep={wizardState.currentStep}
                totalSteps={wizardSteps.length}
                onBack={handleBack}
                onClose={onClose}
                canGoBack={canGoBack || showKitchenLayout}
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
                      isKindStepWithLayout ? (
                        <WizardKitchenLayoutPanel
                          key={`${wizardState.currentStep}-kitchen-layout`}
                          onSelect={handleKitchenLayoutSelect}
                          onSkip={handleKitchenLayoutSkip}
                          loading={loading}
                        />
                      ) : isColorStep ? (
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
                      ) : isHandleStep ? (
                        <WizardHandleStep
                          key={`${wizardState.currentStep}-handle`}
                          icon={currentStepDefinition.icon}
                          title={currentStepDefinition.label}
                          description={currentStepDefinition.description}
                          selectedValue={wizardState.selectedOptions.handle}
                          onSelect={handleOptionSelect}
                          loading={loading}
                        />
                      ) : isAtmosphereStep && currentStepDefinition.translatedSubSteps ? (
                        <WizardAtmosphereStep
                          key={`${wizardState.currentStep}-atmosphere`}
                          styleOptions={currentStepDefinition.translatedSubSteps.style?.options ?? []}
                          viewpointOptions={currentStepDefinition.translatedSubSteps.viewpoint?.options ?? []}
                          timeOptions={currentStepDefinition.translatedSubSteps.time?.options ?? []}
                          selectedStyle={wizardState.selectedOptions.style}
                          selectedViewpoint={wizardState.selectedOptions.viewpoint}
                          selectedTime={wizardState.selectedOptions.time}
                          onSelectStyle={(v) => wizardActions.selectOption("style", v)}
                          onSelectViewpoint={(v) => wizardActions.selectOption("viewpoint", v)}
                          onSelectTime={(v) => wizardActions.selectOption("time", v)}
                          onContinue={() => wizardActions.nextStep(totalSteps)}
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
                          columns={isFloorStep ? 4 : undefined}
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
                        onAuthRequired={() => wizardActions.requestAuth()}
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
                        onRequireAuth={() => wizardActions.requestAuth()}
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
