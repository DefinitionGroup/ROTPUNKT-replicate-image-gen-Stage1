"use client";

import React from "react";
import { motion } from "motion/react";

export interface TextHeadlineComboProps {
  // content
  eyebrow?: string;
  headline: React.ReactNode;
  highlight?: string;
  subhead?: React.ReactNode;
  kicker?: React.ReactNode;

  // style (nested from Sanity)
  style?: {
    align?: "left" | "center" | "right";
    size?: "xl" | "lg" | "md" | "sm";
    animate?: boolean;
    spacing?: "tight" | "normal" | "loose";
  };

  // misc
  bleed?: boolean;
  clamp?: number;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;

  // allow spreading Sanity blocks without TS noise
  _key?: string;
  _type?: string;
}

const sizeMap = {
  xl: {
    headline: "text-5xl md:text-7xl lg:text-7xl",
    subhead: "text-xl md:text-2xl",
    eyebrow: "text-[11px]",
    kicker: "text-sm",
    gap: "gap-6 md:gap-2",
  },
  lg: {
    headline: "text-4xl md:text-5xl",
    subhead: "text-lg md:text-xl",
    eyebrow: "text-[11px]",
    kicker: "text-sm",
    gap: "gap-5 md:gap-6",
  },
  md: {
    headline: "text-3xl md:text-3xl",
    subhead: "text-base md:text-lg",
    eyebrow: "text-[10px]",
    kicker: "text-xs md:text-sm",
    gap: "gap-4 md:gap-5",
  },
  sm: {
    headline: "text-xl md:text-xl",
    subhead: "text-sm md:text-base",
    eyebrow: "text-[10px]",
    kicker: "text-xs",
    gap: "gap-3 md:gap-4",
  },
} as const;

const spacingMap = {
  tight: "space-y-2",
  normal: "space-y-3",
  loose: "space-y-5",
} as const;

export default function TextHeadlineCombo(props: TextHeadlineComboProps) {
  const {
    eyebrow,
    headline,
    highlight,
    subhead,
    kicker,

    style,

    bleed = false,
    clamp,
    gradientFrom = "from-red-400",
    gradientTo = "to-red-500",
    className = "",
  } = props;

  // Resolve with precedence: flat prop → style.* → default
  const align = style?.align ?? "left";
  const size = style?.size ?? "lg";
  const animate = style?.animate ?? true;
  const spacing = style?.spacing ?? "normal";

  const sizes = sizeMap[size];
  const wrapperAlign =
    align === "center"
      ? "mx-auto text-center"
      : align === "right"
      ? "ml-auto text-right"
      : "text-left";

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const baseMotion = (d: number) => ({
    initial: animate ? { opacity: 0, y: 24 } : undefined,
    whileInView: animate ? { opacity: 1, y: 0 } : undefined,
    viewport: animate ? { once: true, amount: 0.5 } : undefined,
    transition: animate
      ? { duration: 0.6, ease: easeCurve, delay: d }
      : undefined,
  });

  console.log(props);
  return (
    <div className="relative container mx-auto my-26 px-4">
      <div
        className={`relative ${
          bleed ? "w-full" : "max-w-6xl"
        } ${wrapperAlign} font-aspekta ${className}`}
      >
        <div className={`flex flex-col ${sizes.gap} ${spacingMap[spacing]}`}>
          {eyebrow && (
            <motion.span
              {...baseMotion(0)}
              className={`tracking-widest uppercase ${sizes.eyebrow} font-semibold text-red-500/90`}
            >
              {eyebrow}
            </motion.span>
          )}

          <motion.h1
            {...baseMotion(0.05)}
            className={`font-semibold tracking-tight text-white leading-tight ${sizes.headline}`}
          >
            {typeof headline === "string" && highlight ? (
              <>
                {headline}{" "}
                <span
                  className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
                >
                  {highlight}
                </span>
              </>
            ) : (
              headline
            )}
          </motion.h1>

          {subhead && (
            <motion.p
              {...baseMotion(0.12)}
              className={`${
                sizes.subhead
              } font-medium leading-relaxed text-white ${
                clamp ? `line-clamp-${clamp}` : ""
              }`}
            >
              {subhead}
            </motion.p>
          )}

          {kicker && (
            <motion.div
              {...baseMotion(0.18)}
              className={`text-white ${sizes.kicker} font-medium tracking-wide`}
            >
              {kicker}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
