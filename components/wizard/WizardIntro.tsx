import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";

interface WizardIntroProps {
  onStart: () => void;
}

export const WizardIntro: React.FC<WizardIntroProps> = ({ onStart }) => {
  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center text-center gap-7"
      style={{ minHeight: 360 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.38, type: "spring" }}
    >
      <motion.img
        src="/rotpunkt-kuechen-logo.svg"
        alt="Rotpunkt Küchen Logo"
        className="mb-3 w-28 h-28"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.16, duration: 0.38 }}
      />

      <div className="flex flex-col gap-2 mb-3">
        <h2 className="text-2xl font-extrabold text-brand-secondary-1 bg-brand-primary-2 bg-clip-text tracking-tight drop-shadow-xl">
          Küchen-Konfigurator
        </h2>
        <p className="text-gray-200 tracking-tight text-sm max-w-xl">
          Starten Sie jetzt und gestalten Sie Ihre Traumküche Schritt für
          Schritt.
        </p>
      </div>

      <Button enableMotion onClick={onStart} variant="red" size="red" autoFocus>
        Jetzt starten
      </Button>
    </motion.div>
  );
};
