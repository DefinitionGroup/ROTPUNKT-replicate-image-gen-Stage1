"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Header as HeaderType } from "@/sanity/sanity.types";
import { $showWizard } from "@/app/store/modals";
import { $prompt } from "@/app/store/prompt";
import { $pageStep } from "@/app/store/step";
import { AnimatePresence } from "motion/react";
import { IntroCard } from "@/components/wizard/IntroCard";
import { useStore } from "@nanostores/react";
import { KitchenWizardModal } from "@/components/wizard/KitchenWizardModal";
import { wizardActions } from "@/app/store/wizardStore";
import ImageGenerator from "@/components/wizard/ImageGenerator";
type Props = HeaderType & {
  logoImage?: string;
  className?: string;
};

export default function Header({
  backgroundImage,
  description,
  subheadline,
  title,
  className = "",
}: Props) {
  const backgroundImageVariants: Variants = {
    initial: { opacity: 0, y: 40, scale: 0.7 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 72,
        mass: 1,
        damping: 20,
        delay: 0.61,
      },
    },
  };
  const pageStep = useStore($pageStep);
  const showWizard = useStore($showWizard);

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
        `grid grid-cols-1 grid-rows-1 h-[70vh] min-h-[700px] rounded-2xl z-50 container mx-auto items-center justify-center text-foreground selection:bg-brand-primary-2 selection:text-brand-secondary-1`,
        className
      )}
      aria-labelledby="hero-title"
      role="banner"
    >
      <motion.div
        className="w-full  border-red-500  bg-black col-span-1 min-h-full  row-span-1 col-start-1 flex items-stretch row-start-1 rounded-2xl overflow-hidden drop-shadow-lg"
        variants={backgroundImageVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true"
      >
        <img
          className=" rounded-2xl opacity-50 "
          src={backgroundImage?.secure_url}
          alt={subheadline}
          role="presentation"
        />
      </motion.div>

      {/* Content Container */}
      <div className=" col-span-1  z-10 flex flex-col justify-center row-span-1 col-start-1 row-start-1">

        {/* Main Title */}
        <motion.div
          className="mx-auto w-full"
          variants={titleVariants}
          initial="initial"
          animate="animate"
        >
          <h1
            id="hero-title"
            className="text-7xl leading-relaxed tracking-tight font-medium text-center text-white"
          >
            {title}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="mx-auto w-full"
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
        >
          <p className="text-white mx-auto tracking-wide text-2xl max-w-2xl text-center font-semibold"

            role="doc-subtitle"
          >
            {subheadline}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mx-auto max-w-4xl "
          variants={descriptionVariants}
          initial="initial"
          animate="animate"
        >
          <p className="text-white font-semibold tracking-wide text-lg mt-4 leading-relaxed text-center">

            {description}
          </p>
        </motion.div>
        <div className="text-center  flex flex-col items-center justify-center">
          {pageStep === "intro" && (
            <IntroCard onStart={() => $showWizard.set(true)} />
          )}
          {pageStep === "imagegen" && (
            <div className="">
              <ImageGenerator
                onBack={() => {
                  $prompt.set(null);
                  $pageStep.set("intro");
                  $showWizard.set(true);
                }}
              />
            </div>
          )}

          <AnimatePresence>
            {showWizard && (
              <KitchenWizardModal
                onPromptReady={(prompt) => {
                  $prompt.set(prompt);
                  $showWizard.set(false);
                  $pageStep.set("imagegen");
                }}
                onClose={() => {
                  $showWizard.set(false);
                  wizardActions.reset();
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>


    </section>
  );
}
