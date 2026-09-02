"use client";

import React from "react";
import { motion } from "motion/react";
import { FaCheck } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { kitchenZoneOptions, type KitchenZoneLocation } from "./kitchenZones";

interface WizardKitchenZonesPanelProps {
  sinkLocation: KitchenZoneLocation;
  cooktopLocation: KitchenZoneLocation;
  onSelectSink: (value: KitchenZoneLocation) => void;
  onSelectCooktop: (value: KitchenZoneLocation) => void;
  onContinue: () => void;
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

type ZoneKind = "sink" | "cooktop";

function ZoneSchematic({
  location,
  kind,
}: {
  location: KitchenZoneLocation;
  kind: ZoneKind;
}) {
  const markerX = location === "wall_run" ? 34 : 60;
  const markerY = location === "wall_run" ? 17 : 52;
  return (
    <svg
      viewBox="0 0 120 72"
      className="h-16 w-full text-muted-foreground"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="8"
        y="8"
        width="104"
        height="18"
        rx="2"
        className="fill-current opacity-30"
      />
      <rect
        x="34"
        y="42"
        width="52"
        height="20"
        rx="2"
        className="fill-current opacity-30"
      />
      {kind === "sink" ? (
        <rect
          x={markerX - 7}
          y={markerY - 5}
          width="14"
          height="10"
          rx="2"
          className="fill-brand-primary-2"
        />
      ) : (
        <g className="fill-brand-primary-2">
          <circle cx={markerX - 4} cy={markerY - 2.5} r="2.5" />
          <circle cx={markerX + 4} cy={markerY - 2.5} r="2.5" />
          <circle cx={markerX - 4} cy={markerY + 3} r="2.5" />
          <circle cx={markerX + 4} cy={markerY + 3} r="2.5" />
        </g>
      )}
    </svg>
  );
}

function ZoneGroup({
  kind,
  title,
  hint,
  value,
  onSelect,
  loading,
}: {
  kind: ZoneKind;
  title: string;
  hint: string;
  value: KitchenZoneLocation;
  onSelect: (value: KitchenZoneLocation) => void;
  loading: boolean;
}) {
  const t = useTranslations();
  return (
    <div>
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div
        role="radiogroup"
        aria-label={title}
        className="grid grid-cols-2 gap-3"
      >
        {kitchenZoneOptions.map((opt) => {
          const optionValue = opt.value as KitchenZoneLocation;
          const isSelected = optionValue === value;
          return (
            <motion.button
              key={`${kind}-${opt.value}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              variants={cardVariants}
              onClick={() => onSelect(optionValue)}
              disabled={loading}
              className={`relative flex flex-col gap-2 rounded-xl border bg-card/80 px-4 pb-3 pt-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background ${
                isSelected
                  ? "border-brand-primary-2 ring-1 ring-brand-primary-2"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <ZoneSchematic location={optionValue} kind={kind} />
              <span className="text-xs font-semibold text-foreground">
                {t(opt.labelKey)}
              </span>
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary-2 text-white">
                  <FaCheck className="h-2.5 w-2.5" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function WizardKitchenZonesPanel({
  sinkLocation,
  cooktopLocation,
  onSelectSink,
  onSelectCooktop,
  onContinue,
  loading = false,
}: WizardKitchenZonesPanelProps) {
  const tZones = useTranslations("wizard.kitchenZones");

  return (
    <motion.div
      className="w-full flex flex-col h-full min-h-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary-2/15 border border-brand-primary-2/40 flex items-center justify-center text-brand-primary-2 text-lg">
          🚰
        </div>
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl text-left tracking-tight text-foreground">
            {tZones("title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl text-left leading-snug break-words">
            {tZones("description")}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 pb-4"
        >
          <ZoneGroup
            kind="sink"
            title={tZones("sink")}
            hint={tZones("sinkHint")}
            value={sinkLocation}
            onSelect={onSelectSink}
            loading={loading}
          />
          <ZoneGroup
            kind="cooktop"
            title={tZones("cooktop")}
            hint={tZones("cooktopHint")}
            value={cooktopLocation}
            onSelect={onSelectCooktop}
            loading={loading}
          />
        </motion.div>

        <div className="flex justify-end pb-4 pt-2">
          <Button
            type="button"
            variant="redCta"
            size="cta"
            onClick={onContinue}
            disabled={loading}
          >
            {tZones("continue")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
