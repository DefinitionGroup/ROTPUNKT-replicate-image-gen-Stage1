import React from "react";
import { motion } from "motion/react";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getWizardProgress } from "./wizardProgress";

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
  const t = useTranslations('wizard.header');
  const { totalStages, currentStage, progressPercent, hasStarted } =
    getWizardProgress(currentStep, totalSteps);

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
              ${!canGoBack || loading
                ? "opacity-0 cursor-not-allowed pointer-events-none"
                : ""
              }
            `}
            tabIndex={canGoBack ? 0 : -1}
            aria-label={t('backAriaLabel')}
          >
            <FaArrowLeft className="text-base" />
            {t('back')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 gap-1">
        <div className="h-2 w-64 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-brand-primary-2"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {hasStarted
            ? t('step', { current: currentStage, total: totalStages })
            : "\u00A0"}
        </span>
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
          aria-label={t('closeAriaLabel')}
          tabIndex={0}
        >
          ×
        </Button>
      )}
    </header>
  );
};
