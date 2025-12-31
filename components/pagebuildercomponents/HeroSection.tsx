"use client";

import React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RichTextComponent from "./RichTextComponent";
import type {
  HeroSection as HeroSectionType,
  CloudinaryAsset,
  Cta,
  RichText,
} from "@/sanity/sanity.types";

type Props = HeroSectionType & { className?: string };

function urlFromCloudinary(a?: CloudinaryAsset | null) {
  return a?.secure_url ?? a?.url ?? undefined;
}

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

// Updated type guards to be more flexible
function isCta(item: any): item is Cta & { _type?: string } {
  return !!item && (item._type === "cta" || item.text || item.link);
}

function isRichText(item: any): item is RichText & { _type?: string } {
  return !!item && (item._type === "richText" || item.content);
}

export default function HeroSection({
  backgroundImage,
  backgroundAlt,
  description,
  subheadline,
  title,
  logoImageUrl,
  additionalContent,
  className = "",
}: Props) {
  const bgSrc = urlFromCloudinary(backgroundImage);
  const logoSrc =
    urlFromCloudinary(logoImageUrl) ?? "/rotpunkt-kuechen-logo.svg";

  // Log for debugging
  console.log("additionalContent:", additionalContent);

  // collect CTAs and rich text blocks from additionalContent using updated type guards
  const items = additionalContent ?? [];
  const ctas: (Cta & { _type?: string })[] = items.filter(isCta);
  const richTexts: (RichText & { _type?: string })[] = items.filter(isRichText);

  console.log("Filtered CTAs:", ctas);
  console.log("Filtered RichTexts:", richTexts);

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

  // Add variants for additional content
  const contentVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", delay: 0.58, stiffness: 140, damping: 20 },
    },
  };

  return (
    <section
      className={cn(
        "relative grid grid-cols-1 grid-rows-1 overflow-hidden bg-black   text-brand-secondary-1 selection:bg-brand-primary-2 selection:text-brand-secondary-1",
        "min-h-[40vh] md:min-h-[50vh] lg:min-h-[20vh] h-[50vh]",
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
        {/* Subtle gradient for text readability at the bottom/left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content stack (top-left) */}
      <div className="col-start-1 row-start-1 z-10 flex flex-col justify-center">
        <div className="px-6 sm:px-8 lg:px-12 w-full">
          <div className="max-w-4xl pt-20 pb-10">
            {logoSrc && (
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="animate"
                className="mb-6"
              >
                <img
                  src={logoSrc}
                  alt="Brand logo"
                  className="h-10 w-auto md:h-12 opacity-90"
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
                "font-bold tracking-tight text-white",
                "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
                "drop-shadow-lg"
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
                className="mt-6 flex items-center gap-4"
              >
                <div className="h-[2px] w-12 bg-brand-primary-2" />
                {subheadline && (
                  <p className="text-neutral-200 font-medium tracking-wide text-lg sm:text-xl uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded">
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
                className="mt-8 max-w-2xl text-neutral-200 leading-relaxed text-base sm:text-lg font-light drop-shadow-md"
              >
                {description}
              </motion.p>
            )}

            {/* Render rich text blocks using existing RichTextComponent */}
            {richTexts.length > 0 && (
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="mt-6 space-y-4"
              >
                {richTexts.map((rt, idx) => (
                  <div
                    key={(rt as any)._key ?? `richtext-${idx}`}
                    className="prose prose-invert max-w-none"
                  >
                    <RichTextComponent value={rt.content ?? []} />
                  </div>
                ))}
              </motion.div>
            )}

            {/* CTA buttons (support multiple) */}
            {ctas.length > 0 && (
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="mt-6 flex flex-wrap gap-3"
              >
                {ctas.map((c, i) => {
                  const href = hrefFromLink(c.link);
                  console.log(`CTA ${i} - text: ${c.text}, href: ${href}`); // Debug log

                  if (!c.text) {
                    console.log(`CTA ${i} has no text, skipping`);
                    return null;
                  }

                  if (!href) {
                    console.log(`CTA ${i} has no href, skipping`);
                    return null;
                  }

                  // read optional variant/size if present in schema
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
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
