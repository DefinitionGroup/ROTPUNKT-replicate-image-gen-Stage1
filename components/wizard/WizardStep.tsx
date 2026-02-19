import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaCheck } from "react-icons/fa6";
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.08 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12 } },
};

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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4 p-1"
        >
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            const hasImage = !!opt.image;
            return (
              <motion.div key={opt.value} variants={cardVariants}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.value)}
                  disabled={loading}
                  className={`
                    group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 outline-none
                    focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background
                    ${isSelected
                      ? "ring-2 ring-brand-primary-2 shadow-lg shadow-brand-primary-2/10"
                      : "ring-1 ring-border/50 hover:ring-border hover:shadow-md"
                    }
                  `}
                >
                  {hasImage ? (
                    <div className="relative h-28 sm:h-36 md:h-40 w-full overflow-hidden">
                      <Image
                        src={opt.image!}
                        alt={opt.label}
                        fill
                        className={`
                          object-cover transition-all duration-500
                          ${isSelected ? "scale-105 brightness-110" : "group-hover:scale-[1.04] group-hover:brightness-105"}
                        `}
                        sizes="(max-width: 768px) 100vw, 320px"
                        priority={false}
                      />
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-primary-2 flex items-center justify-center shadow-lg"
                          >
                            <FaCheck className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className={`relative h-16 w-full flex items-center justify-center ${isSelected ? "bg-brand-primary-2" : "bg-muted/30 group-hover:bg-muted/50"}`}>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-primary-2 flex items-center justify-center shadow-lg"
                          >
                            <FaCheck className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className={`px-2.5 py-5 transition-colors ${isSelected ? "bg-brand-primary-2" : "bg-card/80"}`}>
                    <span className={`text-xs font-semibold leading-tight block ${isSelected ? "text-white" : "text-foreground"}`}>
                      {opt.label}
                    </span>
                    {opt.hint ? (
                      <span className={`text-xxs mt-0.5 block ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>{opt.hint}</span>
                    ) : null}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};
