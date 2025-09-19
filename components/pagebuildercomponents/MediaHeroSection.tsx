"use client";

import React from "react";
import { motion } from "motion/react";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RichTextComponent from "./RichTextComponent";
import type {
  MediaHeroSectionProps,
  CloudinaryAsset,
  Cta,
  RichText,
} from "@/sanity/sanity.types";

export default function MediaHeroSection({
  id = "Step3",
  className = "",
  heading = "Von kleinen Ideen",
  subheading = "und grossen Visionen.",
  useVideo = false,
  // support both projected string fields (imageSrc/videoSrc) and raw cloudinary assets (backgroundImage/backgroundVideo)
  imageSrc,
  videoSrc,
  imageAlt = "Hero Background",
  enableParallax = true,
  overlayOpacity = 0.5,
  animation = { delay: 0.1, staggerDelay: 0.1, duration: 0.5, distance: 80 },
  // new: additionalContent (array of cta | richText) from schema
  additionalContent,
  // also accept cloudinary fields if present
  backgroundImage,
  backgroundVideo,
}: MediaHeroSectionProps & {
  // accommodate raw asset shapes until your typegen is regenerated
  backgroundImage?: CloudinaryAsset | null;
  backgroundVideo?: CloudinaryAsset | null;
  additionalContent?: Array<
    ({ _type?: "cta" } & Cta) | ({ _type?: "richText" } & RichText)
  >;
}) {
  function urlFromCloudinary(a?: CloudinaryAsset | null) {
    return a?.secure_url ?? a?.url ?? undefined;
  }

  const resolvedImageSrc =
    urlFromCloudinary(backgroundImage) ??
    imageSrc ??
    "/hero-bg-home2-34f136.png";
  const resolvedVideoSrc = urlFromCloudinary(backgroundVideo) ?? videoSrc;

  // Fixed helpers for links - same as HeroSection
  function hrefFromLink(link: any) {
    if (!link) return undefined;

    console.log("Processing link:", link); // Debug log

    if (link.linkType === "external") {
      return link.externalUrl;
    }

    if (link.linkType === "internal") {
      // Check if we have a page reference
      if (link.page?._ref) {
        // You'll need to resolve this reference to get the actual slug
        // For now, let's try to use externalUrl as fallback if it exists
        return link.externalUrl || `#ref-${link.page._ref}`;
      }

      // Try to get slug from page object
      const slug = link.page?.slug?.current ?? link.page?.slug;
      if (slug) return `/${slug}`;

      // Fallback to any URL we can find
      return link.page?.url ?? link.externalUrl ?? undefined;
    }

    if (link.linkType === "anchor") {
      return link.anchor ? `#${link.anchor}` : undefined;
    }

    // Fallback: if no linkType but we have URLs
    return link.externalUrl || link.url || undefined;
  }

  // Updated type guards to be more flexible - same as HeroSection
  const items = additionalContent ?? [];
  const isCta = (it: any): it is Cta & { _type?: string } =>
    !!it && (it._type === "cta" || it.text || it.link);
  const isRich = (it: any): it is RichText & { _type?: string } =>
    !!it && (it._type === "richText" || it.content);

  const ctas = items.filter(isCta);
  const richTexts = items.filter(isRich);

  // Debug logging
  console.log("MediaHero additionalContent:", additionalContent);
  console.log("MediaHero CTAs found:", ctas.length);
  console.log("MediaHero Rich texts found:", richTexts.length);

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
        className="mt-12 min-h-[70vh]"
        enableParallax={enableParallax}
        useVideo={useVideo}
        imageSrc={resolvedImageSrc}
        videoSrc={resolvedVideoSrc}
        imageAlt={imageAlt}
        opacity={overlayOpacity}
      />

      <div className="z-10 gap-8 col-span-12 py-32 col-start-1 row-start-1 grid-cols-12 px-4">
        <StaggeredSlideUp
          className="flex flex-col items-center mt-64 justify-center container mx-auto text-center"
          delay={animation.delay ?? 0.1}
          staggerDelay={animation.staggerDelay ?? 0.1}
          duration={animation.duration ?? 0.5}
          distance={animation.distance ?? 80}
        >
          <h2 className="text-7xl leading-compress text-gray-100 max-w-3xl text-center font-bold tracking-wider leading-tighter mb-8">
            {heading}
          </h2>
          <p className="text-xl text-gray-100 font-bold text-center max-w-2xl mx-auto">
            {subheading}
          </p>

          {/* Render rich text blocks if provided */}
          {richTexts.length > 0 && (
            <div className="mt-6 max-w-3xl">
              {richTexts.map((rt, i) => (
                <div
                  key={(rt as any)._key ?? `richtext-${i}`}
                  className="prose prose-invert mx-auto text-center"
                >
                  <RichTextComponent value={rt.content ?? []} />
                </div>
              ))}
            </div>
          )}

          {/* Render CTAs if provided */}
          {ctas.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {ctas.map((c, i) => {
                const href = hrefFromLink(c.link);
                console.log(
                  `MediaHero CTA ${i} - text: ${c.text}, href: ${href}`
                ); // Debug log

                if (!c.text) {
                  console.log(`MediaHero CTA ${i} has no text, skipping`);
                  return null;
                }

                if (!href) {
                  console.log(`MediaHero CTA ${i} has no href, skipping`);
                  return null;
                }

                const variant = (c as any).variant ?? "default";
                const size = (c as any).size ?? "default";
                return (
                  <Button
                    key={`cta-${i}`}
                    asChild
                    variant={variant}
                    size={size}
                  >
                    <a href={href}>{c.text}</a>
                  </Button>
                );
              })}
            </div>
          )}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
