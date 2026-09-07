"use client";

import { useAuth } from "@clerk/nextjs";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { $generationSpec, $isKitchenRoom } from "@/app/store/prompt";
import { $promptPipelineV2Enabled, loadRuntimeConfig } from "@/app/store/runtimeConfig";
import { wizardActions, wizardStore, type WizardState } from "@/app/store/wizardStore";
import ImageGenerator from "@/components/wizard/ImageGenerator";
import { PromptDebugPopover } from "@/components/wizard/PromptDebugPopover";
import { WizardAtmosphereStep } from "@/components/wizard/WizardAtmosphereStep";
import { WizardColorStep } from "@/components/wizard/WizardColorStep";
import { WizardFinal } from "@/components/wizard/WizardFinal";
import { WizardHandleStep } from "@/components/wizard/WizardHandleStep";
import { WizardKitchenLayoutPanel } from "@/components/wizard/WizardKitchenLayoutPanel";
import { WizardKitchenZonesPanel } from "@/components/wizard/WizardKitchenZonesPanel";
import { WizardMultiSelectStep } from "@/components/wizard/WizardMultiSelectStep";
import { WizardStep } from "@/components/wizard/WizardStep";
import {
  DEFAULT_ISLAND_COOKTOP_LOCATION,
  DEFAULT_ISLAND_SINK_LOCATION,
  ISLAND_LAYOUT_VALUE,
  isKitchenZoneLocation,
  resolveKitchenZones,
} from "@/components/wizard/kitchenZones";
import { buildPrompt, toGenerationRequestSpec } from "@/components/wizard/promptBuilder";
import { useTranslatedWizardSteps } from "@/components/wizard/useTranslatedWizardSteps";
import { useWizardSelectionSummary } from "@/components/wizard/useWizardSelectionSummary";
import type { WizardPreset } from "@/components/wizard/wizardPresets";
import { wizardSteps } from "@/components/wizard/wizardSteps";
import { DURATION, REVEAL_RISE, SIGNATURE_EASE } from "@/lib/motion";
import { StudioIntro } from "./studio-intro";
import { StudioRail, StudioStepStrip } from "./studio-rail";

type Stage = "configure" | "result";

const stepTransition = { duration: DURATION.overlay, ease: SIGNATURE_EASE };

/**
 * The configurator as a page. Two columns on the stage: the running list of
 * decisions on the left, the current question on the right. When the image
 * is requested, the question column becomes the result — the list stays,
 * so what was chosen is always beside what it produced.
 *
 * The flow logic is the wizard's own; only the frame changed. The prompt and
 * the quality contract are captured together at submit, never rebuilt later.
 */
export function StudioShell() {
  const t = useTranslations("studio");
  const tIntroPresets = useTranslations("wizard.intro.presets");
  const tErrors = useTranslations("wizard.errors");
  const wizardState = useStore(wizardStore);
  const promptPipelineV2Enabled = useStore($promptPipelineV2Enabled);
  const { isLoaded, isSignedIn } = useAuth();
  const translatedSteps = useTranslatedWizardSteps();
  const selectionItems = useWizardSelectionSummary(wizardState.selectedOptions);

  const [stage, setStage] = useState<Stage>("configure");
  const [showKitchenLayout, setShowKitchenLayout] = useState(false);
  const [showKitchenZones, setShowKitchenZones] = useState(false);

  const promptDebugEnv = (process.env.NEXT_PUBLIC_WIZARD_PROMPT_DEBUG ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  const showPromptDebugPopover =
    process.env.NODE_ENV === "development" &&
    ["true", "1", "yes", "on"].includes(promptDebugEnv);

  const totalSteps = wizardSteps.length;

  const summaryData = useMemo(
    () =>
      buildPrompt({
        selections: wizardState.selectedOptions,
        extraWishes: wizardState.extraWishes,
        pipelineV2Enabled: promptPipelineV2Enabled,
      }),
    [wizardState.selectedOptions, wizardState.extraWishes, promptPipelineV2Enabled]
  );

  const isFinalStep = wizardState.currentStep === totalSteps;
  const isIntro = wizardState.currentStep === -1;
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
  const isKindStepWithZones = currentStepDefinition?.key === "kind" && showKitchenZones;
  const kitchenZones = resolveKitchenZones(wizardState.selectedOptions);
  const missingKeys = summaryData.missingKeys;
  const debugStepLabel = isIntro
    ? "intro"
    : isFinalStep
      ? "final"
      : `${wizardState.currentStep + 1}/${totalSteps} (${currentStepDefinition?.key ?? "unknown"})`;

  useEffect(() => {
    void loadRuntimeConfig();
  }, []);

  // Someone who signed in to generate comes back to the same place, prompt gone.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const { currentStep, resumeAfterAuth } = wizardStore.get();
    if (resumeAfterAuth && currentStep >= 0) {
      wizardActions.setAuthPrompt(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [wizardState.currentStep, stage]);

  const kindStepIndex = wizardSteps.findIndex((step) => step.key === "kind");
  useEffect(() => {
    if (wizardState.currentStep !== kindStepIndex) {
      setShowKitchenLayout(false);
      setShowKitchenZones(false);
    }
  }, [wizardState.currentStep, kindStepIndex]);

  const startWithPreset = (preset: WizardPreset) => {
    wizardActions.applyPreset({
      options: preset.options,
      extraWishes: tIntroPresets(`${preset.id}.extraWishes`),
    });
    wizardActions.setStep(totalSteps);
  };

  const startBlank = () => {
    wizardActions.reset();
    wizardActions.setStep(0);
  };

  const handleBack = () => {
    if (showKitchenZones) {
      setShowKitchenZones(false);
      setShowKitchenLayout(true);
      return;
    }
    if (showKitchenLayout) {
      setShowKitchenLayout(false);
      return;
    }
    wizardActions.goBack();
  };

  const handleOptionSelect = (option: string) => {
    if (wizardState.currentStep < 0 || wizardState.currentStep >= wizardSteps.length) return;
    const currentStepKey = wizardSteps[wizardState.currentStep].key as keyof WizardState["selectedOptions"];

    if (currentStepKey === "kind" && option === "kueche") {
      wizardActions.selectOption(currentStepKey, option);
      setShowKitchenLayout(true);
      return;
    }
    if (currentStepKey === "kind" && option !== "kueche") {
      wizardActions.clearOptions("kitchenLook", "sinkLocation", "cooktopLocation");
    }
    wizardActions.selectOption(currentStepKey, option);
    wizardActions.nextStep(totalSteps);
  };

  const handleKitchenLayoutSelect = (value: string) => {
    wizardActions.selectOption("kitchenLook", value);
    setShowKitchenLayout(false);

    if (value === ISLAND_LAYOUT_VALUE) {
      const current = wizardStore.get().selectedOptions;
      if (!isKitchenZoneLocation(current.sinkLocation)) {
        wizardActions.selectOption("sinkLocation", DEFAULT_ISLAND_SINK_LOCATION);
      }
      if (!isKitchenZoneLocation(current.cooktopLocation)) {
        wizardActions.selectOption("cooktopLocation", DEFAULT_ISLAND_COOKTOP_LOCATION);
      }
      setShowKitchenZones(true);
      return;
    }
    wizardActions.clearOptions("sinkLocation", "cooktopLocation");
    wizardActions.nextStep(totalSteps);
  };

  const handleKitchenLayoutSkip = () => {
    setShowKitchenLayout(false);
    wizardActions.clearOptions("kitchenLook", "sinkLocation", "cooktopLocation");
    wizardActions.nextStep(totalSteps);
  };

  const handleKitchenZonesContinue = () => {
    setShowKitchenZones(false);
    wizardActions.nextStep(totalSteps);
  };

  const handleSubmit = () => {
    if (summaryData.missingKeys.length > 0) {
      wizardActions.setError(tErrors("fillAllSteps"));
      wizardActions.setStep(totalSteps);
      return;
    }
    const spec = toGenerationRequestSpec(summaryData);
    $generationSpec.set(spec);
    $isKitchenRoom.set(spec.isKitchenRoom);
    setStage("result");
  };

  const jumpToStep = (index: number) => {
    setStage("configure");
    wizardActions.setStep(index);
  };

  const canGoBack = wizardState.currentStep > -1 || showKitchenLayout || showKitchenZones;
  const stepCounter = t("rail.step", {
    current: Math.min(wizardState.currentStep + 1, totalSteps + 1),
    total: totalSteps + 1,
  });

  return (
    <main className="min-h-screen bg-canvas pt-16">
      <PromptDebugPopover
        enabled={showPromptDebugPopover}
        stepLabel={debugStepLabel}
        missingKeys={missingKeys}
        sections={summaryData.modelSections}
        prompt={summaryData.modelPrompt}
      />

      {isIntro && stage === "configure" ? (
        <div className="signature-container py-12 md:py-20">
          <StudioIntro onBlankStart={startBlank} onPresetSelect={startWithPreset} />
        </div>
      ) : (
        <div className="signature-container flex flex-col gap-8 py-8 lg:flex-row lg:items-start lg:gap-14 lg:py-12">
          <StudioRail
            className="hidden lg:sticky lg:top-24 lg:block lg:w-[300px] lg:shrink-0"
            currentStep={wizardState.currentStep}
            extraWishes={wizardState.extraWishes}
            isSignedIn={Boolean(isSignedIn)}
            items={selectionItems}
            missingCount={missingKeys.length}
            onEdit={() => setStage("configure")}
            onJumpToFinal={() => jumpToStep(totalSteps)}
            onJumpToStep={jumpToStep}
            onRequireAuth={() => wizardActions.requestAuth()}
            onReset={() => {
              setStage("configure");
              wizardActions.reset();
            }}
            onSubmit={handleSubmit}
            prompt={summaryData.prompt}
            stage={stage}
            totalSteps={totalSteps}
          />

          <section aria-live="polite" className="min-w-0 flex-1">
            {stage === "configure" && (
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <button
                    className={`group inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-nav text-graphite transition-colors duration-state ease-signature hover:text-ink ${
                      canGoBack ? "" : "pointer-events-none opacity-0"
                    }`}
                    disabled={!canGoBack}
                    onClick={handleBack}
                    type="button"
                  >
                    <svg aria-hidden="true" className="size-3 transition-transform duration-state ease-signature group-hover:-translate-x-0.5" fill="none" viewBox="0 0 12 12">
                      <path d="M10 6H2m0 0 4-4M2 6l4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
                    </svg>
                    {t("stage.back")}
                  </button>
                  <span className="tnum text-caption text-graphite">{stepCounter}</span>
                </div>
                <StudioStepStrip
                  className="lg:hidden"
                  currentStep={wizardState.currentStep}
                  items={selectionItems}
                  onJumpToFinal={() => jumpToStep(totalSteps)}
                  onJumpToStep={jumpToStep}
                  totalSteps={totalSteps}
                />
              </div>
            )}

            <AnimatePresence initial={false} mode="wait">
              {stage === "result" ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0, y: REVEAL_RISE }}
                  key="result"
                  transition={stepTransition}
                >
                  <ImageGenerator onBack={() => setStage("configure")} />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[60vh] flex-col"
                  exit={{ opacity: 0, y: -REVEAL_RISE / 2 }}
                  initial={{ opacity: 0, y: REVEAL_RISE }}
                  key={`${wizardState.currentStep}-${showKitchenLayout}-${showKitchenZones}`}
                  transition={stepTransition}
                >
                  {!isIntro && !isFinalStep && currentStepDefinition &&
                    (isKindStepWithZones ? (
                      <WizardKitchenZonesPanel
                        cooktopLocation={kitchenZones.cooktopLocation}
                        onContinue={handleKitchenZonesContinue}
                        onSelectCooktop={(value) => wizardActions.selectOption("cooktopLocation", value)}
                        onSelectSink={(value) => wizardActions.selectOption("sinkLocation", value)}
                        sinkLocation={kitchenZones.sinkLocation === "island" ? "island" : "wall_run"}
                      />
                    ) : isKindStepWithLayout ? (
                      <WizardKitchenLayoutPanel onSelect={handleKitchenLayoutSelect} onSkip={handleKitchenLayoutSkip} />
                    ) : isColorStep ? (
                      <WizardColorStep
                        description={currentStepDefinition.description}
                        icon={currentStepDefinition.icon}
                        onSelect={handleOptionSelect}
                        options={currentStepDefinition.options}
                        selectedValue={wizardState.selectedOptions.color}
                        title={currentStepDefinition.label}
                      />
                    ) : isHandleStep ? (
                      <WizardHandleStep
                        description={currentStepDefinition.description}
                        icon={currentStepDefinition.icon}
                        onSelect={handleOptionSelect}
                        selectedValue={wizardState.selectedOptions.handle}
                        title={currentStepDefinition.label}
                      />
                    ) : isAtmosphereStep && currentStepDefinition.translatedSubSteps ? (
                      <WizardAtmosphereStep
                        onContinue={() => wizardActions.nextStep(totalSteps)}
                        onSelectStyle={(value) => wizardActions.selectOption("style", value)}
                        onSelectTime={(value) => wizardActions.selectOption("time", value)}
                        onSelectViewpoint={(value) => wizardActions.selectOption("viewpoint", value)}
                        selectedStyle={wizardState.selectedOptions.style}
                        selectedTime={wizardState.selectedOptions.time}
                        selectedViewpoint={wizardState.selectedOptions.viewpoint}
                        styleOptions={currentStepDefinition.translatedSubSteps.style?.options ?? []}
                        timeOptions={currentStepDefinition.translatedSubSteps.time?.options ?? []}
                        viewpointOptions={currentStepDefinition.translatedSubSteps.viewpoint?.options ?? []}
                      />
                    ) : isMultiSelectStep ? (
                      <WizardMultiSelectStep
                        description={currentStepDefinition.description}
                        icon={currentStepDefinition.icon}
                        onContinue={() => wizardActions.nextStep(totalSteps)}
                        onToggle={(option) => wizardActions.toggleMultiOption("accessories", option)}
                        optionGroups={currentStepDefinition.optionGroups}
                        options={currentStepDefinition.options}
                        selectedValues={wizardState.selectedOptions.accessories || []}
                        title={currentStepDefinition.label}
                      />
                    ) : (
                      <WizardStep
                        columns={isFloorStep ? 4 : undefined}
                        description={currentStepDefinition.description}
                        icon={currentStepDefinition.icon}
                        onSelect={handleOptionSelect}
                        options={currentStepDefinition.options}
                        selectedValue={
                          wizardState.selectedOptions[
                            currentStepDefinition.key as Exclude<keyof WizardState["selectedOptions"], "accessories">
                          ] as string | undefined
                        }
                        title={currentStepDefinition.label}
                      />
                    ))}

                  {isFinalStep && (
                    <WizardFinal
                      extraWishes={wizardState.extraWishes}
                      isSignedIn={Boolean(isSignedIn)}
                      onAuthRequired={() => wizardActions.requestAuth()}
                      onExtraWishesChange={wizardActions.setExtraWishes}
                      onSubmit={handleSubmit}
                      showAuthPrompt={wizardState.showAuthPrompt}
                      showSubmitButton
                    />
                  )}

                  {wizardState.error && (
                    <p className="mt-6 text-body text-signature" role="alert">
                      {wizardState.error}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      )}
    </main>
  );
}
