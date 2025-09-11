"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

import { Header2 as HeaderType2 } from "@/sanity/sanity.types";

type Props = HeaderType2 & {
  logoImage?: string;
  className?: string;
};

export default function HeroSection2({
  backgroundImage,
  description,
  subheadline,
  title,
  logoImage = "/rotpunkt-kuechen-logo.svg",
  className = "",
}: Props) {
  const backgroundImageVariants: Variants = {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: {
      opacity: 0.4,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 72,
        mass: 1,
        damping: 20,
        delay: 1.1,
      },
    },
  };

  const logoVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.25 },
    },
  };

  const titleVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.22 },
    },
  };

  const subtitleVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.45 },
    },
  };

  const descriptionVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 1.7 },
    },
  };

  return (
    <section
      className={cn(
        `bg-black grid grid-cols-1 grid-rows-1 text-red h-[50vh] min-h-[500px] overflow-hidden items-center justify-center`,
        className
      )}
      aria-labelledby="hero-title"
      role="banner">
      <motion.div
        className="w-full col-span-1 row-span-1 col-start-1 row-start-1"
        variants={backgroundImageVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true">
        <img
          className="w-full h-full col-span-1 row-span-1 col-start-1 row-start-1 object-cover object-bottom"
          src={backgroundImage?.secure_url}
          alt={subheadline}
          role="presentation"
        />
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-16 items-center flex-wrap flex flex-col justify-center row-start-1 col-start-1 z-10 relative">
        {/* Main Title */}
        <motion.div
          className="mx-auto w-full"
          variants={titleVariants}
          initial="initial"
          animate="animate">
          <h2
            id="hero-title"
            className="text-6xl font-medium text-white uppercase tracking-tighter text-center bg-gradient-to-br  bg-clip-text ">
            {title}
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="mx-auto w-full"
          variants={subtitleVariants}
          initial="initial"
          animate="animate">
          <p
            className="text-center text-lg text-red-500 max-w-3xl mx-auto font-black tracking-tight mt-4"
            role="doc-subtitle">
            {subheadline}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mx-auto max-w-3xl"
          variants={descriptionVariants}
          initial="initial"
          animate="animate">
          <p className="text-center text-sm text-gray-300 leading-relaxed mb-12 tracking-wide mt-6">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
