"use client";

import React from "react";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import { cn } from "@/lib/utils";
import { MediaHeroSectionProps } from "@/sanity/sanity.types";

export default function MediaHeroSection({
  id = "Step3",
  className = "",
  heading = "Von kleinen Ideen",
  subheading = "und grossen Visionen.",
  useVideo = false,
  imageSrc = "/hero-bg-home2-34f136.png",
  videoSrc = "/iStock-1459952878_suesser_kleiner_junge.mp4",
  imageAlt = "Hero Background",
  enableParallax = true,
  overlayOpacity = 0.5,
  animation = { delay: 0.1, staggerDelay: 0.1, duration: 0.5, distance: 80 },
}: MediaHeroSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative grid grid-cols-12 min-h-[50vh] isolate overflow-hidden selection:bg-brand-primary-2 selection:text-brand-secondary-1",
        className
      )}
    >
      {/* Background media */}
      <HeaderImageVideoComp2
        className="mt-12 min-h-[70vh] "
        enableParallax={true}
        useVideo={useVideo}
        imageSrc={imageSrc}
        videoSrc={videoSrc}
        imageAlt={imageAlt}
        opacity={overlayOpacity}
      />

      <div className="z-1  gap-8 col-span-12 py-32 col-start-1  row-start-1 grid-cols-12 px-4">
        <StaggeredSlideUp
          className="flex flex-col items-center mt-64 justify-center container mx-auto text-center "
          delay={animation.delay ?? 0.1}
          staggerDelay={animation.staggerDelay ?? 0.1}
          duration={animation.duration ?? 0.5}
          distance={animation.distance ?? 80}
        >
          <h2 className="text-7xl leading-compress text-gray-100 max-w-3xl textg-center font-bold tracking-wider leading-tighter mb-8">
            {heading}
          </h2>
          <p className="text-xl text-gray-100 font-bold text-center max-w-2xs mx-auto">
            {subheading}
          </p>
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
