import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { WizardOption } from "./wizardSteps";

interface WizardStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: WizardOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  icon,
  title,
  description,
  options,
  selectedValue,
  onSelect,
  loading = false,
}) => {
  return (
    <motion.div
      className="w-full flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      style={{ minHeight: 320 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 shrink-0 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center text-red-400">
          {icon}
        </div>
        <div>
          <h3 className="text-xl md:text-2xl text-left tracking-tight text-brand-secondary-1">
            {title}
          </h3>
          <p className="text-sm text-gray-400 w-80 text-left mt-1 max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          const hasImage = !!opt.image;
          return (
            <Button
              key={opt.value}
              variant="wizardOption"
              size="wizardOption"
              enableMotion
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              onClick={() => onSelect(opt.value)}
              disabled={loading}
              data-selected={isSelected}
              className="group h-auto overflow-hidden py-4 px-5 text-left flex-col items-start gap-3 border-gray-800/60 bg-gray-900/70 backdrop-blur rounded-xl"
            >
              {hasImage ? (
                <div className="relative -mx-1 -mt-1 h-32 w-[calc(100%+0.5rem)] overflow-hidden rounded-lg">
                  <Image
                    src={opt.image!}
                    alt={opt.label}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                </div>
              ) : null}

              <div className="flex flex-col items-start gap-1 w-full">
                <span className="text-sm font-semibold text-brand-secondary-1">
                  {opt.label}
                </span>
                {opt.hint ? (
                  <span className="text-xs text-gray-400">{opt.hint}</span>
                ) : null}
              </div>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};
