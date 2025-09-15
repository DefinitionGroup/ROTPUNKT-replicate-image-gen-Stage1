"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import type {
  HeroSection as HeroSectionType,
  CloudinaryAsset,
} from "@/sanity/sanity.types";

type Props = HeroSectionType & { className?: string };

function urlFromCloudinary(a?: CloudinaryAsset | null) {
  return a?.secure_url ?? a?.url ?? undefined;
}

export default function HeroSection({
  backgroundImage,
  backgroundAlt,
  description,
  subheadline,
  title,
  logoImageUrl,
  className = "",
}: Props) {
  const bgSrc = urlFromCloudinary(backgroundImage);
  const logoSrc =
    urlFromCloudinary(logoImageUrl) ?? "/rotpunkt-kuechen-logo.svg";

  const bgVariants: Variants = {
    initial: { opacity: 0, scale: 1.04, y: 12 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const logoVariants: Variants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.1 } },
  };
  const titleVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 0.22, stiffness: 140, damping: 18 },
    },
  };
  const subtitleVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 0.34, stiffness: 140, damping: 18 },
    },
  };
  const descVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 0.46, stiffness: 140, damping: 20 },
    },
  };

  return (
    <section
      className={cn(
        "relative grid grid-cols-1 grid-rows-1 overflow-hidden bg-black text-brand-secondary-1 selection:bg-brand-primary-2 selection:text-brand-secondary-1",
        "min-h-[40vh] md:min-h-[50vh] lg:min-h-[60vh]",
        className
      )}
      aria-labelledby="hero-title"
      role="banner"
    >
      {/* Background image */}
      {bgSrc && (
        <motion.div
          variants={bgVariants}
          initial="initial"
          animate="animate"
          aria-hidden="true"
          className="col-start-1 row-start-1 h-full w-full"
        >
          <img
            src={bgSrc}
            alt={backgroundAlt ?? subheadline ?? title ?? "Hero background"}
            className={cn("h-full w-full object-cover", "object-[center_70%]")}
          />
        </motion.div>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 col-start-1 row-start-1"
      >
        {/* left-to-right gradient so left-aligned text pops */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        {/* subtle top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content stack (top-left) */}
      <div className="col-start-1 row-start-1 z-10">
        <div className=" px-6 sm:px-8 lg:px-12">
          <div className="max-w-4xl pt-10 sm:pt-12 md:pt-16 lg:pt-20 pb-10 md:pb-14">
            {logoSrc && (
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="animate"
                className="mb-4"
              >
                <img
                  src={logoSrc}
                  alt="Brand logo"
                  className="h-12 w-auto md:h-14 lg:h-16 opacity-95"
                  loading="eager"
                />
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              id="hero-title"
              variants={titleVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "font-semibold tracking-tight",
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              )}
            >
              {title}
            </motion.h1>

            {/* Accent divider + subtitle */}
            {(subheadline || true) && (
              <motion.div
                variants={subtitleVariants}
                initial="initial"
                animate="animate"
                className="mt-4"
              >
                <div className="h-[3px] w-24 bg-brand-primary-2/80 rounded-full" />
                {subheadline && (
                  <p className="mt-3 text-red-500 font-extrabold tracking-tight text-base sm:text-lg md:text-xl">
                    {subheadline}
                  </p>
                )}
              </motion.div>
            )}

            {/* Description (further down) */}
            {description && (
              <motion.p
                variants={descVariants}
                initial="initial"
                animate="animate"
                className="mt-8 max-w-3xl text-gray-200/95 leading-relaxed text-sm sm:text-base"
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
