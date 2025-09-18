"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Header as HeaderType } from "@/sanity/sanity.types";

type Props = HeaderType & {
  logoImage?: string;
  className?: string;
};

export default function Header({
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
        `bg-black grid grid-cols-1 grid-rows-1 text-brand-secondary-1 h-[50vh] min-h-[500px] overflow-hidden items-center justify-center selection:bg-brand-primary-2 selection:text-brand-secondary-1`,
        className
      )}
      aria-labelledby="hero-title"
      role="banner"
    >
      <motion.div
        className="w-full col-span-1 row-span-1 col-start-1 row-start-1"
        variants={backgroundImageVariants}
        initial="initial"
        animate="animate"
        aria-hidden="true"
      >
        <img
          className="w-full h-full col-span-1 row-span-1 col-start-1 row-start-1 object-cover object-bottom"
          src={backgroundImage?.secure_url}
          alt={subheadline}
          role="presentation"
        />
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-16 items-center flex-wrap flex flex-col justify-center row-start-1 col-start-1 z-10 relative">
        {/* Logo Section */}
        <motion.header
          className="mx-auto px-4 py-16 w-full"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex justify-center">
            <Image
              src={logoImage}
              alt="Rotpunkt Küchen Logo"
              className="mx-auto mb-2 w-24 max-h-24"
              width={96}
              height={96}
            />
          </div>
        </motion.header>

        {/* Main Title */}
        <motion.div
          className="mx-auto w-full"
          variants={titleVariants}
          initial="initial"
          animate="animate"
        >
          <h1
            id="hero-title"
            className="text-7xl leading-relaxed tracking-tight font-bold  text-center bg-gradient-to-br from-red-500 to-red-600 bg-clip-text text-transparent"
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
          <p className="text-white mx-auto tracking-wider text-2xl max-w-2xl text-center font-bold "

            role="doc-subtitle"
          >
            {subheadline}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mx-auto max-w-3xl"
          variants={descriptionVariants}
          initial="initial"
          animate="animate"
        >
          <p  className="text-white  tracking-wider text-lg max-w-2xl text-center font-bold mb-8">

            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
