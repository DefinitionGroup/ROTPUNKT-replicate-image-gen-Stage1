"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { wizardSteps } from "./wizardSteps";
import type { WizardState } from "@/app/store/wizardStore";
import type { WizardPreset } from "./wizardPresets";
import { wizardPresets } from "./wizardPresets";
import { motion } from "motion/react";

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
  onApplyPreset: (preset: WizardPreset) => void;
}

export function WizardSummaryPanel({
  selections,
  extraWishes,
  currentStep,
  totalSteps,
  prompt,
  missingKeys,
  isSignedIn,
  loading = false,
  onSubmit,
  onRequireAuth,
  onJumpToFinal,
  onApplyPreset,
}: WizardSummaryPanelProps) {
  const [copied, setCopied] = useState(false);
  const cleanedWishes = extraWishes.trim();

  const isComplete = missingKeys.length === 0;
  const isOnFinalStep = currentStep >= totalSteps;

  const groupedSelections = useMemo(() => {
    return wizardSteps.map((step) => {
      const key = step.key as keyof WizardState["selectedOptions"];
      const selectedValue = selections[key];
      const selectedLabel = step.options.find(
        (opt) => opt.value === selectedValue
      )?.label;
      return {
        key,
        title: step.label,
        description: step.description,
        selectedLabel,
      };
    });
  }, [selections]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard error", error);
    }
  };

  const renderPrimaryAction = () => {
    if (!isComplete) {
      return (
        <Button
          variant="redCta"
          size="cta"
          className="w-full justify-center"
          disabled
        >
          Wählen Sie alle Optionen aus
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
          Weiter zu "Zusätzliche Wünsche"
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
          Einloggen, um zu generieren
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
        {loading ? "Erzeuge Bild..." : "Bild erstellen"}
      </Button>
    );
  };

  return (
    <aside className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 shadow-inner flex flex-col gap-5 w-full lg:max-w-sm max-h-[calc(96vh-6rem)]">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Fortschritt
        </h4>
        <span className="text-xs text-gray-300">
          Schritt {Math.min(currentStep + 1, totalSteps + 1)} / {totalSteps + 1}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-primary-2"
          initial={false}
          animate={{
            width: `${
              ((Math.min(currentStep, totalSteps) + 1) / (totalSteps + 1)) *
              100
            }%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Schnelleinstellungen
        </h4>
        <div className="flex flex-wrap gap-2">
          {wizardPresets.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="bg-gray-900/80 text-gray-200 border border-gray-700 hover:bg-brand-primary-2/80 hover:text-brand-secondary-1 hover:border-brand-primary-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70"
              onClick={() => onApplyPreset(preset)}
              disabled={loading}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800/80" />

      <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: "26rem" }}>
        <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          Auswahlüberblick
        </h4>
        <div className="flex flex-col gap-3">
          {groupedSelections.map((item, idx) => (
            <div
              key={item.key as string}
              className={`rounded-xl border p-3 transition-colors ${
                idx === Math.min(currentStep, totalSteps)
                  ? "border-brand-primary-2/80 bg-brand-primary-2/10"
                  : "border-gray-800 bg-gray-900/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {idx + 1}. {item.title}
                </span>
                <span className="text-[10px] text-gray-500">
                  {item.selectedLabel ? "ausgewählt" : "offen"}
                </span>
              </div>
              <p className="text-sm mt-1 text-brand-secondary-1">
                {item.selectedLabel ?? "Noch keine Auswahl"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800/80" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Prompt-Vorschau
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!prompt.length}
          >
            {copied ? "Kopiert" : "Prompt kopieren"}
          </Button>
        </div>
        <motion.pre
          className="rounded-xl border border-gray-800 bg-black/70 text-left text-xs text-gray-300 p-4 overflow-y-auto max-h-48 whitespace-pre-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {prompt}
        </motion.pre>
        {cleanedWishes && (
          <p className="text-xs text-gray-400">
            Extra-Wünsche: {cleanedWishes}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {renderPrimaryAction()}
        <p className="text-xs text-gray-500">
          Zusätzliche Wünsche werden automatisch in den Prompt eingefügt.
        </p>
      </div>
    </aside>
  );
}
