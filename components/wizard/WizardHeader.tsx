import React from "react";
import { motion } from "motion/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onClose?: () => void;
  canGoBack: boolean;
  loading?: boolean;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onClose,
  canGoBack,
  loading = false,
}) => {
  return (
    <header className="relative flex flex-row items-center justify-between w-full px-8">
      {/* left slot: reserve space even when wizard hasn't started so the close button stays on the right */}
      <div className="min-w-[8rem] flex items-center justify-start">
        {currentStep >= 0 ? (
          <Button
            onClick={onBack}
            disabled={!canGoBack || loading}
            variant="redOutline"
            size="back"
            enableMotion
            whileHover={canGoBack && !loading ? { scale: 1.05 } : {}}
            className={`
              ${
                !canGoBack || loading
                  ? "opacity-0 cursor-not-allowed pointer-events-none"
                  : ""
              }
            `}
            tabIndex={canGoBack ? 0 : -1}
            aria-label="Zurück zum vorherigen Schritt"
          >
            <FaArrowLeft className="text-base" />
            Zurück
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 gap-1">
        {currentStep >= 0 && (
          <>
            <div className="h-2 w-64 rounded-full bg-gray-800 overflow-hidden">
              <motion.div
                className="h-2 rounded-full bg-brand-primary-2"
                initial={false}
                animate={{
                  width: `${
                    ((Math.min(currentStep, totalSteps) + 1) /
                      (totalSteps + 1)) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {`Schritt ${Math.min(currentStep + 1, totalSteps + 1)} / ${
                totalSteps + 1
              }`}
            </span>
          </>
        )}
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          variant="close"
          size="close"
          enableMotion
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="ml-3"
          aria-label="Wizard schließen"
          tabIndex={0}
        >
          ×
        </Button>
      )}
    </header>
  );
};
