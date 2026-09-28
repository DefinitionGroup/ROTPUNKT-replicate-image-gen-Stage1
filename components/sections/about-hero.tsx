"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { DURATION, REVEAL_RISE, SIGNATURE_EASE, STAGGER } from "@/lib/motion";
import type { PageContent } from "@/lib/content/types";

/** A shorter film hero for editorial pages: heading bottom-left, no actions. */
export function AboutHero({ hero }: { hero: NonNullable<PageContent["hero"]> }) {
  const reduceMotion = useReducedMotion();
  const rise = (index: number) => ({
    initial: { opacity: 0, y: REVEAL_RISE },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.reveal, ease: SIGNATURE_EASE, delay: 0.2 + index * STAGGER },
  });
  return (
    <section className="relative h-[70svh] min-h-[480px] max-h-[760px] overflow-hidden bg-canvas">
      {hero.video && !reduceMotion ? (
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 size-full object-cover"
          loop
          muted
          playsInline
          poster={hero.image}
          preload="metadata"
          src={hero.video}
        />
      ) : hero.image ? (
        <Image alt={hero.alt ?? ""} className="object-cover" fill priority sizes="100vw" src={hero.image} unoptimized />
      ) : null}
      <div aria-hidden="true" className="hero-shade absolute inset-0" />
      <div className="signature-container absolute inset-x-0 bottom-8 flex flex-col gap-4 md:bottom-16">
        <motion.h1 className="m-0 max-w-[16ch] text-balance text-display" {...rise(0)}>
          {hero.heading}
        </motion.h1>
        {hero.subheading && (
          <motion.p className="m-0 max-w-[42ch] text-body text-graphite md:text-lead" {...rise(1)}>
            {hero.subheading}
          </motion.p>
        )}
      </div>
    </section>
  );
}
