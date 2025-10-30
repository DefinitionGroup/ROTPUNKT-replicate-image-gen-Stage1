"use client";

import React, { useEffect, useRef } from "react";
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
import { WizardFinal } from "./WizardFinal";
import { wizardSteps } from "./wizardSteps";

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

  const CARD_HEIGHT = 600;
  const CARD_WIDTH = 720;

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
    wizardActions.nextStep();
  };

  const labelForOption = (
    key: keyof WizardState["selectedOptions"],
    value?: string
  ) => {
    if (!value) return "";
    const entry = wizardSteps.find((step) => step.key === key)?.options.find(
      (option) => option.value === value
    );
    return entry?.label ?? value;
  };

  const handleSubmit = () => {
    const { selectedOptions, extraWishes } = wizardState;
    const valuesAreValid = Object.values(selectedOptions).every(Boolean);

    if (!valuesAreValid) {
      wizardActions.setError("Bitte alle Schritte ausfüllen.");
      return;
    }

    const viewpoint = selectedOptions.viewpoint ?? "innenansicht";
    const viewpointClause =
      viewpoint === "aussenansicht"
        ? "Außenperspektive: Die Szene zeigt die Architektur von außen und ermöglicht einen Blick ins Innere durch Fenster."
        : "Innenperspektive: Betrachtung aus dem Raum heraus mit Fokus auf Arbeitsflächen, Schränke und Ausstattung.";

    const promptSections = [
      "Photorealistische Rotpunkt Küchenvisualisierung, entworfen von einem preisgekrönten Innenarchitekten.",
      `Raumfokus: ${labelForOption("kind", selectedOptions.kind)} im Stil ${labelForOption(
        "style",
        selectedOptions.style
      )} mit einer ${labelForOption("color", selectedOptions.color)}en Farbpalette.`,
      `Umgebung & Stimmung: ${labelForOption(
        "environment",
        selectedOptions.environment
      )}e Atmosphäre in einem ${labelForOption(
        "houseType",
        selectedOptions.houseType
      )}, Standort: ${labelForOption(
        "location",
        selectedOptions.location
      )}.`,
      `Tageszeit: ${labelForOption("time", selectedOptions.time)}.`,
      `Perspektive: ${viewpointClause}`,
      "Wichtige Vorgaben: genau ein Spülbecken mit einem einzigen Wasserhahn, alle Leuchten müssen physisch verankert sein (keine schwebenden Lampen), keine doppelten Armaturen, klare Linienführung, konsistente Materialien und Markensprache von Rotpunkt.",
      extraWishes.trim()
        ? `Zusätzliche Wünsche des Nutzers: ${extraWishes.trim()}.`
        : "",
    ].filter(Boolean);

    onPromptReady(promptSections.join("\n"));
    if (onClose) onClose();
  };

  const canGoBack = wizardState.currentStep > -1;

  return (
    <AnimatePresence>
      <motion.div
        key="wizard-popover"
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        tabIndex={-1}
        onMouseDown={handleOverlayClick}
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
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full h-full min-h-[670px] max-h-[96vh] flex flex-col shadow-2xl bg-gradient-to-br from-black/100 via-neutral-950 to-neutral-900/50 border border-gray-800 rounded-2xl">
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

            <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
              <AnimatePresence mode="wait" initial={false}>
                {wizardState.currentStep === -1 && (
                  <WizardIntro
                    key="intro"
                    onStart={() => wizardActions.setStep(0)}
                  />
                )}

                {wizardState.currentStep >= 0 &&
                  wizardState.currentStep < wizardSteps.length && (
                    <WizardStep
                      key={wizardState.currentStep}
                      icon={wizardSteps[wizardState.currentStep].icon}
                      title={wizardSteps[wizardState.currentStep].label}
                      options={wizardSteps[wizardState.currentStep].options}
                      selectedValue={
                        wizardState.selectedOptions[
                          wizardSteps[wizardState.currentStep]
                            .key as keyof WizardState["selectedOptions"]
                        ]
                      }
                      onSelect={handleOptionSelect}
                      loading={loading}
                    />
                  )}

                {wizardState.currentStep === wizardSteps.length && (
                  <WizardFinal
                    key="final"
                    extraWishes={wizardState.extraWishes}
                    onExtraWishesChange={wizardActions.setExtraWishes}
                    showAuthPrompt={wizardState.showAuthPrompt}
                    isSignedIn={!!isSignedIn}
                    onSubmit={handleSubmit}
                    onAuthRequired={() => wizardActions.setAuthPrompt(true)}
                    loading={loading}
                  />
                )}
              </AnimatePresence>

              {wizardState.error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-center mt-3"
                  role="alert"
                >
                  {wizardState.error}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
