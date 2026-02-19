"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { kitchenLayoutOptions } from "./wizardSteps";
import { useTranslations } from "next-intl";

interface WizardKitchenLayoutPanelProps {
  onSelect: (value: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

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
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/40 flex items-center justify-center text-brand-primary-2 text-lg">
          🍳
        </div>
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl text-left tracking-tight text-foreground">
            {tLayout("title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl text-left leading-snug break-words">
            {tLayout("description")}
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4">
          {kitchenLayoutOptions.map((opt) => (
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
              className="group h-auto overflow-hidden p-0 text-left flex-col items-start rounded-xl"
            >
              {opt.image && (
                <div className="relative -mx-1 -mt-1 h-32 sm:h-40 md:h-48 w-[calc(100%+0.5rem)] overflow-hidden rounded-lg">
                  <Image
                    src={opt.image}
                    alt={t(opt.labelKey)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority={false}
                  />
                </div>
              )}

              <div className="flex flex-col items-start gap-1 p-3 sm:p-4 w-full">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {t(opt.labelKey)}
                </span>
              </div>
            </Button>
          ))}
        </div>

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
