"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { Button } from "@/components/ui/button";
import {
  resolveRotpunktLogoSrc,
  useRotpunktLogoSrc,
} from "@/components/theme/useRotpunktLogo";
import { useTheme } from "@/components/theme/ThemeProvider";

import type {
  ExpandableCards as ExpandableCardsType,
  ContentBlock,
} from "@/sanity/sanity.types";

type PortableTextValue =
  | PortableTextBlock[]
  | ContentBlock[]
  | string
  | undefined;

type TransformedItem = {
  _key?: string;
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt?: string;
  logoSrc: string;
  body?: PortableTextValue;
  ctaText?: string;
  ctaHref?: string;
};

type ExpandableCardsProps = ExpandableCardsType & {
  className?: string;
  defaultLogoSrc?: string;
};

export default function ExpandableCards({
  className,
  items,
  defaultLogoSrc,
}: ExpandableCardsProps) {
  const [active, setActive] = useState<TransformedItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const themeLogoSrc = useRotpunktLogoSrc();
  const { resolvedTheme } = useTheme();

  const resolvedDefaultLogoSrc = resolveRotpunktLogoSrc(
    defaultLogoSrc,
    resolvedTheme,
    {
      fallbackSrc: themeLogoSrc,
    }
  );

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  useOutsideClick(ref, () => {
    if (active) setActive(null);
  });

  const transformedItems: TransformedItem[] =
    items?.map((item) => ({
      _key: item._key,
      title: item.title || "",
      description: item.description,
      imageSrc: item.image?.secure_url || "",
      imageAlt: item.image?.context?.custom?.alt || item.imageAlt,
      logoSrc: resolveRotpunktLogoSrc(item.logo?.secure_url, resolvedTheme, {
        fallbackSrc: resolvedDefaultLogoSrc,
      }) as string,
      body: item.body,
      ctaText: item.ctaButton?.text,
      ctaHref:
        item.ctaButton?.link?.linkType === "external"
          ? item.ctaButton.link.externalUrl
          : item.ctaButton?.link?.page?._ref,
    })) || [];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2147483647] bg-background/80 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 z-[2147483647] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card/95 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-[900px] sm:rounded-2xl"
              role="dialog"
              aria-modal="true"
            >
              <motion.button
                key={`button-${active.title}-${id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="absolute right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                <CloseIcon />
              </motion.button>

              {/* Hero image + heading */}
              <motion.div
                className="relative h-52 w-full shrink-0 sm:h-72"
                layoutId={`image-${active.title}-${id}`}
              >
                <img
                  width={1600}
                  height={900}
                  src={active.imageSrc}
                  alt={active.imageAlt || active.title}
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-card/95" />

                {/* Logo */}
                <motion.img
                  layoutId={`logo-${active.title}-${id}`}
                  src={active.logoSrc}
                  alt={`${active.title} logo`}
                  className="absolute left-4 top-4 h-12 w-16 object-contain sm:left-6 sm:top-6 sm:h-16 sm:w-24"
                />

                <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="max-w-3xl">
                    {active.description && (
                      <motion.p
                        layoutId={`description-${active.description}-${id}`}
                        className="text-foreground text-2xl leading-tight sm:text-4xl"
                      >
                        {active.description}
                      </motion.p>
                    )}
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="mt-2 text-lg text-foreground sm:mt-3 sm:text-xl"
                    >
                      {active.title}
                    </motion.h3>
                  </div>
                </div>
              </motion.div>

              {/* Body content */}
              <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 flex flex-col gap-4 text-sm font-medium leading-relaxed text-foreground sm:text-base"
                >
                  {Array.isArray(active.body) ? (
                    <PortableText value={active.body as PortableTextBlock[]} />
                  ) : typeof active.body === "string" ? (
                    <p>{active.body}</p>
                  ) : null}
                </motion.div>

                {active.ctaHref && active.ctaText && (
                  <Button asChild variant="redCta" size="cta" enableMotion>
                    <a
                      href={active.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {active.ctaText}
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Grid */}
      <div className={`w-full mx-auto md:max-w-5xl ${className ?? ""}`}>
        <StaggeredSlideUp className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full">
          {transformedItems.map((card) => (
            <motion.button
              type="button"
              layoutId={`card-${card.title}-${id}`}
              key={card._key ?? `${card.title}-${id}`}
              onClick={() => setActive(card)}
              className="group col-span-1 grid h-[220px] min-h-[220px] w-full grid-cols-1 grid-rows-1 overflow-hidden rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/70 sm:h-[260px]"
            >
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-background h-full rounded-lg overflow-hidden"
              >
                <img
                  width={1200}
                  height={800}
                  src={card.imageSrc}
                  alt={card.imageAlt || card.title}
                  className="w-full h-full object-cover object-top opacity-50"
                />
              </motion.div>

              <div className="col-start-1 row-start-1 col-span-1 p-8 z-10 flex flex-col items-start justify-between">
                <motion.img
                  layoutId={`logo-${card.title}-${id}`}
                  src={card.logoSrc}
                  alt={`${card.title} logo`}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  {card.description && (
                    <motion.p
                      layoutId={`description-${card.description}-${id}`}
                      className="text-foreground text-2xl md:text-3xl md:text-left"
                    >
                      {card.description}
                    </motion.p>
                  )}
                  <motion.h3
                    layoutId={`title-${card.title}-${id}`}
                    className="font-medium text-xl text-foreground md:text-left"
                  >
                    {card.title}
                  </motion.h3>
                </div>
              </div>
            </motion.button>
          ))}
        </StaggeredSlideUp>
      </div>
    </>
  );
}

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-foreground"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
