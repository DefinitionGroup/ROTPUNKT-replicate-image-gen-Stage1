"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { wizardSteps } from "./wizardSteps";
import type { WizardState } from "@/app/store/wizardStore";
import type { WizardPreset } from "./wizardPresets";
import { wizardPresets } from "./wizardPresets";

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
  onJumpToStep: (index: number) => void;
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
  onJumpToStep,
}: WizardSummaryPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const cleanedWishes = extraWishes.trim();

  const isComplete = missingKeys.length === 0;
  const isOnFinalStep = currentStep >= totalSteps;
  const activeIndex = Math.min(currentStep, Math.max(0, totalSteps - 1));

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
        <div className="grid grid-cols-1 gap-3">
          {wizardPresets.map((preset) => (
            <PresetCard
              key={preset.label}
              preset={preset}
              onSelect={onApplyPreset}
              disabled={loading}
            />
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
            <button
              key={item.key as string}
              type="button"
              onClick={() => onJumpToStep(idx)}
              className={`text-left rounded-lg border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                idx === activeIndex
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-gray-800 bg-gray-900/60 hover:border-brand-primary-2/50 hover:bg-brand-primary-2/5"
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-between">
                <span className="text-xxs font-bold uppercase tracking-wide text-gray-600">
                  {idx + 1}. {item.title}
                </span>
                {item.selectedLabel ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <FaCheckCircle className="h-3 w-3" />
                    ausgewählt
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <FaRegCircle className="h-3 w-3" />
                    offen
                  </span>
                )}
              </div>
              <p className="text-xs inline-block mt-1 font-bold  text-brand-secondary-1 border rounded-3xl p-1 border-gray-600 px-7">
                {item.selectedLabel ?? "Noch keine Auswahl"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800/80" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              Prompt-Vorschau
            </h4>
            <span className="text-xs text-gray-500">
              {showPrompt ? "Sichtbar" : "Ausgeblendet"}
            </span>
          </div>
          <Switch
            checked={showPrompt}
            onCheckedChange={setShowPrompt}
            disabled={!prompt.length}
            aria-label="Prompt-Vorschau umschalten"
          />
        </div>

        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!prompt.length}
              >
                {copied ? "Kopiert" : "Prompt kopieren"}
              </Button>
            </div>
            <pre className="rounded-xl border border-gray-800 bg-black/70 text-left text-xs text-gray-300 p-4 overflow-y-auto max-h-48 whitespace-pre-wrap">
              {prompt}
            </pre>
            {cleanedWishes && (
              <p className="text-xs text-gray-400">
                Extra-Wünsche: {cleanedWishes}
              </p>
            )}
          </motion.div>
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

type PresetCardProps = {
  preset: WizardPreset;
  onSelect: (preset: WizardPreset) => void;
  disabled: boolean;
};

function PresetCard({ preset, onSelect, disabled }: PresetCardProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = preset.previewImage && !imageError;

  return (
    <Card className="overflow-hidden border border-gray-700 bg-gray-900/70 hover:border-brand-primary-2/80 hover:bg-brand-primary-2/10 transition-colors">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onSelect(preset)}
        disabled={disabled}
      >
        <div className="relative h-28 w-full">
          {showImage ? (
            <Image
              src={preset.previewImage!}
              alt={preset.label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute bottom-2 left-3 text-sm font-semibold text-white">
            {preset.label}
          </span>
        </div>
        <CardContent className="py-3 px-4">
          <p className="text-xxs text-gray-300 leading-relaxed">
            {preset.description}
          </p>
        </CardContent>
      </button>
    </Card>
  );
}
