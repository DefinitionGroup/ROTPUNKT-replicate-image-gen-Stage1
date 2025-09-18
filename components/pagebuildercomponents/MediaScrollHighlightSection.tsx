"use client";

import React from "react";
import { cn } from "@/lib/utils";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import ScrollHighlight, {
  ScrollHighlightItem,
} from "@/components/ScrollHighlight";

export type MediaScrollHighlightSectionProps = {
  _type?: "mediaScrollHighlightSection";
  _key?: string;

  id?: string;
  className?: string;

  // media controls
  useVideo?: boolean;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  enableParallax?: boolean;
  overlayOpacity?: number;

  items?: ScrollHighlightItem[];
  viewportMargin?: string;
  padTopBottomVh?: number;

  padY?: "sm" | "md" | "lg";
};

const padMap = { sm: "py-16", md: "py-24", lg: "py-32" } as const;

export default function MediaScrollHighlightSection({
  id,
  className = "",
  useVideo = false,
  imageSrc,
  videoSrc,
  imageAlt = "Background",
  enableParallax = true,
  overlayOpacity = 0.5,
  items = [],
  viewportMargin = "-28% 0px -68% 0px",
  padTopBottomVh = 50,
  padY = "lg",
}: MediaScrollHighlightSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative grid grid-cols-12 outline font-aspekta isolate selection:bg-brand-primary-2 selection:text-brand-secondary-1",
        className
      )}
    >
      {/* Background media */}
      <HeaderImageVideoComp2
        className="absolute inset-0 col-span-12"
        useVideo={useVideo}
        imageSrc={imageSrc}
        videoSrc={videoSrc}
        imageAlt={imageAlt}
        enableParallax={enableParallax}
        opacity={overlayOpacity}
      />

      {/* Foreground content */}
      <div className="relative z-10 col-span-12">
        <div
          className={cn(
            "container mx-auto grid grid-cols-12 gap-8",
            padMap[padY]
          )}
        >
          <div className="col-span-12">
            <ScrollHighlight
              items={items}
              viewportMargin={viewportMargin}
              padTopBottomVh={padTopBottomVh}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
