"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { FaCouch, FaEye, FaClock, FaCheck } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";
import { TimeSlider } from "./TimeSlider";
import { PerspectiveSlider } from "./PerspectiveSlider";

/* ─── Types ──────────────────────────────────────────────────── */

type SubSection = "style" | "viewpoint" | "time";

interface WizardAtmosphereStepProps {
  styleOptions: TranslatedWizardOption[];
  viewpointOptions: TranslatedWizardOption[];
  timeOptions: TranslatedWizardOption[];
  selectedStyle?: string;
  selectedViewpoint?: string;
  selectedTime?: string;
  onSelectStyle: (value: string) => void;
  onSelectViewpoint: (value: string) => void;
  onSelectTime: (value: string) => void;
  onContinue: () => void;
  loading?: boolean;
}

/* ─── Sub-section config ─────────────────────────────────────── */

const SUB_SECTIONS: {
  id: SubSection;
  icon: React.ReactNode;
  translationKey: string;
}[] = [
  {
    id: "style",
    icon: <FaCouch className="w-3.5 h-3.5" />,
    translationKey: "style",
  },
  {
    id: "viewpoint",
    icon: <FaEye className="w-3.5 h-3.5" />,
    translationKey: "viewpoint",
  },
  {
    id: "time",
    icon: <FaClock className="w-3.5 h-3.5" />,
    translationKey: "time",
  },
];

/* ─── Animation Variants ─────────────────────────────────────── */

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

/* ─── Main Component ─────────────────────────────────────────── */

export const WizardAtmosphereStep: React.FC<WizardAtmosphereStepProps> = ({
  styleOptions,
  viewpointOptions,
  timeOptions,
  selectedStyle,
  selectedViewpoint,
  selectedTime,
  onSelectStyle,
  onSelectViewpoint,
  onSelectTime,
  onContinue,
  loading = false,
}) => {
  const t = useTranslations("wizard");
  const tSteps = useTranslations("wizard.steps");
  const tAtmosphere = useTranslations("wizard.atmosphere");

  const [activeSection, setActiveSection] = useState<SubSection>("style");

  const selectionMap: Record<SubSection, string | undefined> = useMemo(
    () => ({
      style: selectedStyle,
      viewpoint: selectedViewpoint,
      time: selectedTime,
    }),
    [selectedStyle, selectedViewpoint, selectedTime]
  );

  const optionsMap: Record<SubSection, TranslatedWizardOption[]> = useMemo(
    () => ({
      style: styleOptions,
      viewpoint: viewpointOptions,
      time: timeOptions,
    }),
    [styleOptions, viewpointOptions, timeOptions]
  );

  const handlersMap: Record<SubSection, (v: string) => void> = useMemo(
    () => ({
      style: onSelectStyle,
      viewpoint: onSelectViewpoint,
      time: onSelectTime,
    }),
    [onSelectStyle, onSelectViewpoint, onSelectTime]
  );

  const completedCount = [selectedStyle, selectedViewpoint, selectedTime].filter(Boolean).length;
  const allComplete = completedCount === 3;

  const handleSelect = useCallback(
    (value: string) => {
      handlersMap[activeSection](value);

      // Auto-advance to next incomplete section after a short delay
      setTimeout(() => {
        const order: SubSection[] = ["style", "viewpoint", "time"];
        const currentIdx = order.indexOf(activeSection);
        // Find next incomplete section after current
        for (let i = 1; i <= order.length; i++) {
          const nextSection = order[(currentIdx + i) % order.length];
          // The newly selected value might not be in selectionMap yet, so check manually
          const isJustSelected = nextSection === activeSection;
          const hasSelection = isJustSelected ? true : !!selectionMap[nextSection];
          if (!hasSelection) {
            setActiveSection(nextSection);
            return;
          }
        }
      }, 200);
    },
    [activeSection, handlersMap, selectionMap]
  );

  // Slider sections: select immediately (no auto-advance while dragging)
  const handleTimeSelect = useCallback(
    (value: string) => {
      onSelectTime(value);
    },
    [onSelectTime]
  );

  const handleViewpointSelect = useCallback(
    (value: string) => {
      onSelectViewpoint(value);
    },
    [onSelectViewpoint]
  );

  const currentOptions = optionsMap[activeSection];
  const currentSelection = selectionMap[activeSection];

  return (
    <motion.div
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      {/* ─── Header ────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/40 flex items-center justify-center text-brand-primary-2">
          <FaCouch className="w-full h-full text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl md:text-2xl text-left tracking-tight text-foreground">
            {tAtmosphere("title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-xl text-left leading-snug">
            {tAtmosphere("description")}
          </p>
        </div>
      </div>

      {/* ─── Segmented Tab Bar ─────────────────────── */}
      <div className="mb-3 shrink-0">
        <div className="flex bg-muted/50 rounded-xl p-1 border border-border/40">
          {SUB_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            const isComplete = !!selectionMap[section.id];
            const label = tSteps(`${section.translationKey}.label`);

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                disabled={loading}
                className={`
                  relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors
                  ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="atmosphere-tab-active"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/60"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {isComplete ? (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400">
                      <FaCheck className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="text-brand-primary-2/70">{section.icon}</span>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(" ")[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Section Description ───────────────────── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeSection}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-muted-foreground mb-3 shrink-0 leading-relaxed"
        >
          {tSteps(`${activeSection}.description`)}
        </motion.p>
      </AnimatePresence>

      {/* ─── Options: Grid or Time Slider ─────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <AnimatePresence mode="wait">
          {activeSection === "time" ? (
            <TimeSlider
              key="time-slider"
              options={timeOptions}
              selectedValue={selectedTime}
              onSelect={handleTimeSelect}
              loading={loading}
            />
          ) : activeSection === "viewpoint" ? (
            <PerspectiveSlider
              key="perspective-slider"
              options={viewpointOptions}
              selectedValue={selectedViewpoint}
              onSelect={handleViewpointSelect}
              loading={loading}
            />
          ) : (
            <motion.div
              key={activeSection}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4"
            >
              {currentOptions.map((opt) => {
                const isSelected = currentSelection === opt.value;
                const hasImage = !!opt.image;

                return (
                  <motion.div key={opt.value} variants={cardVariants}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
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
                      {/* Image */}
                      {hasImage ? (
                        <div className="relative h-20 sm:h-24 md:h-28 w-full overflow-hidden">
                          <Image
                            src={opt.image!}
                            alt={opt.label}
                            fill
                            className={`
                              object-cover transition-all duration-500
                              ${isSelected ? "scale-105 brightness-110" : "group-hover:scale-[1.04] group-hover:brightness-105"}
                            `}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 220px"
                            priority={false}
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                          {/* Selection checkmark */}
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
                        /* No-image card */
                        <div
                          className={`
                          relative h-16 w-full flex items-center justify-center
                          ${isSelected
                              ? "bg-brand-primary-2/10"
                              : "bg-muted/30 group-hover:bg-muted/50"
                            }
                        `}
                        >
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

                      {/* Label */}
                      <div
                        className={`
                        px-2.5 py-2 transition-colors
                        ${isSelected ? "bg-brand-primary-2/5" : "bg-card/80"}
                      `}
                      >
                        <span
                          className={`
                          text-xs font-semibold leading-tight block
                          ${isSelected ? "text-brand-primary-2" : "text-foreground"}
                        `}
                        >
                          {opt.label}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Continue Bar ──────────────────────────── */}
      <div className="shrink-0 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-3">
            {SUB_SECTIONS.map((section) => {
              const isComplete = !!selectionMap[section.id];
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-1.5 group"
                  disabled={loading}
                >
                  <motion.div
                    className={`
                      w-2 h-2 rounded-full transition-colors
                      ${isComplete ? "bg-emerald-400" : isActive ? "bg-brand-primary-2" : "bg-muted-foreground/30"}
                    `}
                    animate={{
                      scale: isActive ? 1.3 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors hidden sm:inline
                    ${isComplete ? "text-emerald-400" : isActive ? "text-foreground" : "text-muted-foreground/50"}
                  `}
                  >
                    {tSteps(`${section.translationKey}.label`)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress badge + Continue */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedCount}/3
            </span>

            <Button
              onClick={onContinue}
              disabled={loading || !allComplete}
              className={`
                rounded-full px-5 py-2.5 text-xs font-medium shadow-lg transition-all
                ${allComplete
                  ? "bg-brand-primary-2 hover:bg-brand-primary-2/90 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
              enableMotion
              whileHover={allComplete ? { scale: 1.03 } : {}}
              whileTap={allComplete ? { scale: 0.97 } : {}}
            >
              {allComplete ? tAtmosphere("continue") : tAtmosphere("selectAll")}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
