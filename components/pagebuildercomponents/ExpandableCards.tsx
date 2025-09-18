"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { Button } from "@/components/ui/button";

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
  defaultLogoSrc = "/rotpunkt-kuechen-logo.svg",
}: ExpandableCardsProps) {
  const [active, setActive] = useState<TransformedItem | boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };
    document.body.style.overflow =
      active && typeof active === "object" ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const transformedItems: TransformedItem[] =
    items?.map((item) => ({
      _key: item._key,
      title: item.title || "",
      description: item.description,
      imageSrc: item.image?.secure_url || "",
      imageAlt: item.image?.context?.custom?.alt || item.imageAlt,
      logoSrc: item.logo?.secure_url || defaultLogoSrc,
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
        {active && typeof active === "object" && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-3 right-3 lg:hidden items-center justify-center rounded-full h-8 w-8 bg-white/90"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[900px] min-h-[70vh]  relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              {/* Hero image */}
              <motion.div
                className="w-full absolute sm:rounded-t-xl opacity-80 object-cover object-top"
                layoutId={`image-${active.title}-${id}`}
              >
                <img
                  width={1600}
                  height={900}
                  src={active.imageSrc}
                  alt={active.imageAlt || active.title}
                  className="w-full h-100 absolute min-h-[70vh] sm:rounded-t-xl opacity-50 object-cover object-top"
                />
              </motion.div>

              {/* Logo */}
              <motion.img
                layoutId={`logo-${active.title}-${id}`}
                src={active.logoSrc}
                alt={`${active.title} logo`}
                className="w-24 h-20 object-contain absolute top-12 left-8"
              />

              {/* Content */}
              <div className="flex justify-start border-t absolute top-30 items-start m-8 pt-8 z-10 gap-8">
                <div className="flex justify-start items-start z-10">
                  <div>
                    {active.description && (
                      <motion.p
                        layoutId={`description-${active.description}-${id}`}
                        className="text-white font-black text-5xl dark:text-neutral-200"
                      >
                        {active.description}
                      </motion.p>
                    )}
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="text-xl text-white font-bold mt-4 dark:text-neutral-100"
                    >
                      {active.title}
                    </motion.h3>
                  </div>
                </div>

                <div className="relative px-0 md:px-8 min-h-full ">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-white text-md md:text-base lg:text-base mb-4 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto font-bold dark:text-neutral-300 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {Array.isArray(active.body) ? (
                      <PortableText value={active.body as any} />
                    ) : typeof active.body === "string" ? (
                      <p>{active.body}</p>
                    ) : null}
                  </motion.div>

                  {active.ctaHref && active.ctaText && (
                    <Button
                      asChild
                      variant="redCta"
                      size="cta"
                      layoutId={`button-${active.title}-${id}`}
                      enableMotion
                    >
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
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Grid */}
      <ul className={`w-full max-w-5xl mx-auto ${className ?? ""}`}>
        <StaggeredSlideUp className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-full">
          {transformedItems.map((card) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={card._key ?? `${card.title}-${id}`}
              onClick={() => setActive(card)}
              className="col-span-1 grid grid-cols-1 grid-rows-1 min-h-[360px] rounded-lg overflow-hidden h-[200px] cursor-pointer"
            >
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="col-start-1 col-span-1 row-start-1 bg-black h-full rounded-lg overflow-hidden"
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
                      className="text-neutral-100 text-2xl md:text-3xl dark:text-neutral-300 md:text-left"
                    >
                      {card.description}
                    </motion.p>
                  )}
                  <motion.h3
                    layoutId={`title-${card.title}-${id}`}
                    className="font-medium text-xl text-neutral-100 dark:text-neutral-200 md:text-left"
                  >
                    {card.title}
                  </motion.h3>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggeredSlideUp>
      </ul>
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
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
