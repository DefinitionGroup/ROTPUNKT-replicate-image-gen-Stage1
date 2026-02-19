"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { TranslatedWizardOption } from "./useTranslatedWizardSteps";

/* ─── Time stops mapped to clock hours ───────────────────────── */

interface TimeStop {
  hour: number; // e.g. 6.0, 8.5, etc.
  option: TranslatedWizardOption;
}

/**
 * Maps the 8 time options to clock positions across the 06:00–22:00 range.
 * Returns sorted by hour.
 */
function buildTimeStops(options: TranslatedWizardOption[]): TimeStop[] {
  // Fixed hour mapping for each time option (in order of the options array)
  const hourMap = [6, 8.5, 11, 13, 15.5, 17.5, 19.5, 22];
  return options.map((opt, i) => ({
    hour: hourMap[i] ?? 6 + i * 2,
    option: opt,
  }));
}

/* ─── Format time as HH:MM ──────────────────────────────────── */

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/* ─── Props ──────────────────────────────────────────────────── */

interface TimeSliderProps {
  options: TranslatedWizardOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  loading?: boolean;
}

/* ─── Component ──────────────────────────────────────────────── */

export const TimeSlider: React.FC<TimeSliderProps> = ({
  options,
  selectedValue,
  onSelect,
  loading = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const timeStops = useMemo(() => buildTimeStops(options), [options]);

  const minHour = timeStops[0]?.hour ?? 6;
  const maxHour = timeStops[timeStops.length - 1]?.hour ?? 22;
  const range = maxHour - minHour;

  // Find active stop index from selected value
  const activeIndex = useMemo(() => {
    if (!selectedValue) return -1;
    return timeStops.findIndex((s) => s.option.value === selectedValue);
  }, [selectedValue, timeStops]);

  // Slider position as a fraction [0, 1]
  const sliderPosition = useMemo(() => {
    if (activeIndex < 0) return 0;
    return (timeStops[activeIndex].hour - minHour) / range;
  }, [activeIndex, timeStops, minHour, range]);

  // Track nearest stop while dragging (for hover preview without committing)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex >= 0 ? activeIndex : 0;
  const displayStop = timeStops[displayIndex];

  // Snap to nearest stop given a fractional position
  const snapToNearest = useCallback(
    (fraction: number) => {
      const targetHour = minHour + fraction * range;
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < timeStops.length; i++) {
        const dist = Math.abs(timeStops[i].hour - targetHour);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      return closest;
    },
    [minHour, range, timeStops]
  );

  // Get fraction from mouse/touch event
  const getFraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    []
  );

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
      onSelect(timeStops[idx].option.value);
    },
    [loading, getFraction, snapToNearest, onSelect, timeStops]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const frac = getFraction(e.clientX);
      const idx = snapToNearest(frac);
      if (idx !== hoverIndex) {
        setHoverIndex(idx);
        onSelect(timeStops[idx].option.value);
      }
    },
    [getFraction, snapToNearest, hoverIndex, onSelect, timeStops]
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
      className="flex flex-col gap-4 w-full max-w-[80%] mx-auto"
    >
      {/* ─── Image Display with crossfade ─────────── */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] rounded-xl overflow-hidden ring-1 ring-border/50 bg-muted/20">
        <AnimatePresence mode="sync">
          {displayStop?.option.image && (
            <motion.div
              key={displayStop.option.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={displayStop.option.image}
                alt={displayStop.option.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority={displayIndex === 0}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time + Label overlay */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayStop?.option.value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            >
              <span className="text-5xl sm:text-6xl md:text-7xl font-light text-white tabular-nums tracking-tight">
                {displayStop ? formatTime(displayStop.hour) : "--:--"}
              </span>
              <span className="block text-sm sm:text-base font-light text-white/90 mt-0.5">
                {displayStop?.option.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Slider Track ────────────────────────── */}
      <div className="px-1 sm:px-2">
        <div
          ref={trackRef}
          className="relative w-full h-12 cursor-pointer touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-valuemin={minHour}
          aria-valuemax={maxHour}
          aria-valuenow={displayStop?.hour ?? minHour}
          aria-valuetext={displayStop ? `${formatTime(displayStop.hour)} — ${displayStop.option.label}` : ""}
          tabIndex={0}
          onKeyDown={(e) => {
            if (loading) return;
            const current = activeIndex >= 0 ? activeIndex : 0;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(current + 1, timeStops.length - 1);
              onSelect(timeStops[next].option.value);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              const prev = Math.max(current - 1, 0);
              onSelect(timeStops[prev].option.value);
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
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            />
          )}

          {/* Stop markers */}
          {timeStops.map((stop, idx) => {
            const pos = ((stop.hour - minHour) / range) * 100;
            const isActive = idx === activeIndex;
            const isHovered = idx === hoverIndex;

            return (
              <div
                key={stop.option.value}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${pos}%` }}
              >
                {/* Tick */}
                <motion.div
                  className={`
                    w-2.5 h-2.5 rounded-full border-2 transition-colors
                    ${isActive
                      ? "bg-brand-primary-2 border-brand-primary-2 shadow-md shadow-brand-primary-2/30"
                      : isHovered
                        ? "bg-brand-primary-2/50 border-brand-primary-2/70"
                        : "bg-muted border-border hover:border-muted-foreground/40"
                    }
                  `}
                  animate={{ scale: isActive ? 1.3 : isHovered ? 1.15 : 1 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                />
                {/* Hour label below */}
                <span
                  className={`
                    absolute top-5 text-[9px] sm:text-[10px] font-medium tabular-nums whitespace-nowrap transition-colors
                    ${isActive ? "text-brand-primary-2" : "text-muted-foreground/60"}
                  `}
                >
                  {formatTime(stop.hour)}
                </span>
              </div>
            );
          })}

          {/* Thumb (follows selected position) */}
          {activeIndex >= 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-brand-primary-2 border-2 border-white shadow-lg shadow-brand-primary-2/40 z-10"
              initial={false}
              animate={{ left: `${sliderPosition * 100}%` }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
