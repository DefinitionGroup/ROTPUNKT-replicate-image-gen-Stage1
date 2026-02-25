"use client";

import { useEffect } from "react";
import { $showWizard } from "@/app/store/modals";
import { $prompt, $isKitchenRoom } from "@/app/store/prompt";
import { $pageStep } from "@/app/store/step";
import { AnimatePresence } from "motion/react";
import { IntroCard } from "@/components/wizard/IntroCard";
import { useStore } from "@nanostores/react";
import { KitchenWizardModal } from "@/components/wizard/KitchenWizardModal";
import { useAuth } from "@clerk/nextjs";
import { wizardActions, wizardStore } from "@/app/store/wizardStore";
import ImageGenerator from "./ImageGenerator";
export default function Wizard() {
  const pageStep = useStore($pageStep);
  const showWizard = useStore($showWizard);
  const wizardState = useStore(wizardStore);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !wizardState.resumeAfterAuth) {
      return;
    }

    if (wizardState.currentStep < 0) {
      return;
    }

    $showWizard.set(true);
    wizardActions.setAuthPrompt(false);
  }, [
    isLoaded,
    isSignedIn,
    wizardState.currentStep,
    wizardState.resumeAfterAuth,
  ]);

  return (
    <div className="text-center my-8 min-h-[25rem]  flex flex-col items-center justify-center">
      {pageStep === "intro" && (
        <IntroCard onStart={() => $showWizard.set(true)} />
      )}
      {pageStep === "imagegen" && (
        <div className="w-full max-w-3xl mx-auto min-h-[44rem] flex items-center justify-center">
          <ImageGenerator
            onBack={() => {
              $prompt.set(null);
              $pageStep.set("intro");
              $showWizard.set(true);
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {showWizard && (
          <KitchenWizardModal
            onPromptReady={(prompt, isKitchen) => {
              $prompt.set(prompt);
              $isKitchenRoom.set(isKitchen);
              $showWizard.set(false);
              $pageStep.set("imagegen");
            }}
            onClose={() => {
              $showWizard.set(false);
              wizardActions.reset();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
