"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { kitchenLayoutOptions } from "./wizardSteps";
import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";

interface WizardKitchenLayoutPanelProps {
  onSelect: (value: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
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

export function WizardKitchenLayoutPanel({
  onSelect,
  onSkip,
  loading = false,
}: WizardKitchenLayoutPanelProps) {
  const t = useTranslations();
  const tLayout = useTranslations("wizard.kitchenLayout");

  return (
    <motion.div
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <StepHeader title={tLayout("title")} description={tLayout("description")} />

      {/* Options Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 p-1"
        >
          {kitchenLayoutOptions.map((opt) => (
            <motion.div key={opt.value} variants={cardVariants}>
              <button
                type="button"
                onClick={() => onSelect(opt.value)}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 outline-none ring-1 ring-border/50 hover:ring-border hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              >
                {opt.image && (
                  <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden">
                    <Image
                      src={opt.image}
                      alt={t(opt.labelKey)}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-105"
                      sizes="(max-width: 768px) 100vw, 320px"
                      priority={false}
                    />
                  </div>
                )}

                <div className="px-5 py-5 bg-card/80 transition-colors">
                  <span className="text-xs font-semibold leading-tight block text-foreground">
                    {t(opt.labelKey)}
                  </span>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Skip link */}
        <div className="text-center mt-2 pb-4">
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {tLayout("skip")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
