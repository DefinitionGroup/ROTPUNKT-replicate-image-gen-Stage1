"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";

/* ─── Props ──────────────────────────────────────────────────── */

interface PerspectiveSliderProps {
  options: TranslatedWizardOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

/* ─── Component ──────────────────────────────────────────────── */

export const PerspectiveSlider: React.FC<PerspectiveSliderProps> = ({
  options,
  selectedValue,
  onSelect,
  loading = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Find active stop index from selected value
  const activeIndex = useMemo(() => {
    if (!selectedValue) return -1;
    return options.findIndex((o) => o.value === selectedValue);
  }, [selectedValue, options]);

  // Slider position as a fraction [0, 1]
  const sliderPosition = useMemo(() => {
    if (activeIndex < 0 || options.length <= 1) return 0;
    return activeIndex / (options.length - 1);
  }, [activeIndex, options.length]);

  // Track nearest stop while dragging (for hover preview without committing)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const displayIndex =
    hoverIndex !== null ? hoverIndex : activeIndex >= 0 ? activeIndex : 0;
  const displayOption = options[displayIndex];

  // Snap to nearest stop given a fractional position
  const snapToNearest = useCallback(
    (fraction: number) => {
      const idx = Math.round(fraction * (options.length - 1));
      return Math.max(0, Math.min(options.length - 1, idx));
    },
    [options.length]
  );

  // Get fraction from mouse/touch event
  const getFraction = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  // Pointer interaction
  const isDragging = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (loading) return;
      e.preventDefault();
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const frac = getFraction(e.clientX);
      const idx = snapToNearest(frac);
      setHoverIndex(idx);
      onSelect(options[idx].value);
    },
    [loading, getFraction, snapToNearest, onSelect, options]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const frac = getFraction(e.clientX);
      const idx = snapToNearest(frac);
      if (idx !== hoverIndex) {
        setHoverIndex(idx);
        onSelect(options[idx].value);
      }
    },
    [getFraction, snapToNearest, hoverIndex, onSelect, options]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setHoverIndex(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 w-full mx-auto"
    >
      {/* ─── Image Display with crossfade ─────────── */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] rounded-xl overflow-hidden ring-1 ring-border/50 bg-black">
        <AnimatePresence mode="sync">
          {displayOption?.image && (
            <motion.div
              key={displayOption.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={displayOption.image}
                alt={displayOption.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 500px"
                priority={displayIndex === 0}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label overlay — bottom left */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayOption?.value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
                {displayOption?.label ?? "—"}
              </span>
              <span className="block text-sm sm:text-base font-light text-white/90 mt-0.5">
                {displayIndex + 1} / {options.length}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Slider Track ────────────────────────── */}
      <div className="px-1 sm:px-2 w-[80%] mx-auto">
        <div
          ref={trackRef}
          className="relative w-full h-12 cursor-pointer touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={options.length - 1}
          aria-valuenow={displayIndex}
          aria-valuetext={displayOption?.label ?? ""}
          tabIndex={0}
          onKeyDown={(e) => {
            if (loading) return;
            const current = activeIndex >= 0 ? activeIndex : 0;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(current + 1, options.length - 1);
              onSelect(options[next].value);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              const prev = Math.max(current - 1, 0);
              onSelect(options[prev].value);
            }
          }}
        >
          {/* Track background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-muted/60" />

          {/* Filled portion */}
          {activeIndex >= 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full bg-brand-primary-2/50"
              initial={false}
              animate={{ width: `${sliderPosition * 100}%` }}
              transition={{
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
              }}
            />
          )}

          {/* Stop markers */}
          {options.map((opt, idx) => {
            const pos =
              options.length <= 1
                ? 0
                : (idx / (options.length - 1)) * 100;
            const isActive = idx === activeIndex;
            const isHovered = idx === hoverIndex;

            return (
              <div
                key={opt.value}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${pos}%` }}
              >
                {/* Tick */}
                <motion.div
                  className={`
                    w-2 h-2 rounded-full border-2 transition-colors
                    ${isActive
                      ? "bg-brand-primary-2 border-brand-primary-2 shadow-md shadow-brand-primary-2/30"
                      : isHovered
                        ? "bg-brand-primary-2/50 border-brand-primary-2/70"
                        : "bg-muted border-border hover:border-muted-foreground/40"
                    }
                  `}
                  animate={{
                    scale: isActive ? 1.3 : isHovered ? 1.15 : 1,
                  }}
                  transition={{
                    type: "spring" as const,
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              </div>
            );
          })}

          {/* Thumb (follows selected position) */}
          {activeIndex >= 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-brand-primary-2 border-2 border-white shadow-lg shadow-brand-primary-2/40 z-10"
              initial={false}
              animate={{ left: `${sliderPosition * 100}%` }}
              transition={{
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
