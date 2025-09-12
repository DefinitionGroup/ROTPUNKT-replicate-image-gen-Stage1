import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface WizardStepProps {
  icon: React.ReactNode;
  title: string;
  options: Array<{ value: string; label: string }>;
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  icon,
  title,
  options,
  selectedValue,
  onSelect,
  loading = false,
}) => {
  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: 300 }}
    >
      <div className="flex justify-center flex-column w-24">
        <div className="mb-4 h-8 w-8">{icon}</div>
      </div>

      <h3 className="text-2xl tracking-tight text-white mb-12">
        {title} auswählen
      </h3>

      <div
        className={`w-full max-w-2xl mx-auto mt-2 mb-7 grid gap-5 ${
          options.length === 5 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {options.map((opt, idx) => {
          const isOddLast = options.length === 5 && idx >= 4;
          const isSelected = selectedValue === opt.value;

          return (
            <Button
              key={opt.value}
              variant="wizardOption"
              size="wizardOption"
              enableMotion
              whileHover={{ scaleX: 1.051 }}
              whileTap={{ scaleX: 0.98 }}
              transition={{ type: "spring" }}
              onClick={() => onSelect(opt.value)}
              disabled={loading}
              data-selected={isSelected}
              className={`
                ${isOddLast ? "col-span-2 mx-auto w-2/3" : ""}
              `}
              style={{ minWidth: 0 }}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};
