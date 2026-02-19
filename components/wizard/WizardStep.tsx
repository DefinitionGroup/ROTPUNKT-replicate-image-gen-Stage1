import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";

interface WizardStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: TranslatedWizardOption[];
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
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/40 flex items-center justify-center text-brand-primary-2">
          {icon}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl text-left tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl text-left leading-snug break-words">
            {description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
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
                className="group h-auto overflow-hidden p-0 text-left flex-col items-start rounded-xl"
              >
                {hasImage ? (
                  <div className="relative -mx-1 -mt-1 h-28 sm:h-36 md:h-40 w-[calc(100%+0.5rem)] overflow-hidden rounded-lg">
                    <Image
                      src={opt.image!}
                      alt={opt.label}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 320px"
                      priority={false}
                    />
                  </div>
                ) : null}

                <div className="flex flex-col items-start gap-1 p-3 sm:p-4 w-full">
                  <span className="text-xs sm:text-sm font-semibold">
                    {opt.label}
                  </span>
                  {opt.hint ? (
                    <span className="text-xxs sm:text-xs text-muted-foreground group-data-[selected=true]:text-white/70">{opt.hint}</span>
                  ) : null}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
