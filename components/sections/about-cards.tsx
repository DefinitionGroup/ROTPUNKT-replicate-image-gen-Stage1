"use client";

import { useState } from "react";
import { MediaCard } from "@/components/design-system/card";
import { DetailCard, DetailTrigger } from "@/components/design-system/detail-card";
import { Emphasis } from "@/components/design-system/emphasis";
import { Label } from "@/components/design-system/label";
import { Pill } from "@/components/design-system/pill";
import { Reveal } from "@/components/design-system/reveal";
import { Tilt } from "@/components/design-system/tilt";
import type { PageContent } from "@/lib/content/types";

/** The editorial page body: headline block, then media cards that open their story. */
export function AboutCards({ headline, cards, closeLabel }: { headline?: PageContent["headline"]; cards: NonNullable<PageContent["cards"]>; closeLabel: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex !== null ? cards[openIndex] : null;

  return (
    <section className="pt-20 md:pt-[120px]">
      {headline && (
        <Reveal className="signature-container grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-3.5 md:gap-5">
            {headline.eyebrow && <Label>{headline.eyebrow}</Label>}
            <h2 className="m-0 text-balance text-heading-lg">
              <Emphasis text={headline.headline} />
            </h2>
          </div>
          {headline.subhead && <p className="m-0 max-w-[44ch] text-body text-graphite">{headline.subhead}</p>}
        </Reveal>
      )}
      <ul className="signature-container mt-8 grid list-none gap-3 p-0 md:mt-12 md:grid-cols-2 md:gap-4">
        {cards.map((card, index) => (
          <Reveal as="li" index={index} key={card.title}>
            <Tilt>
              <MediaCard
                action={
                  <DetailTrigger id={`about-${index}`} label={card.title} onOpen={() => setOpenIndex(index)} open={openIndex === index} tone="glass" />
                }
                alt={card.alt ?? card.title}
                image={card.image}
                label={card.description}
                ratio="aspect-[4/5] md:aspect-[16/11]"
                shade="deep"
                sizes="(min-width: 768px) 45vw, 100vw"
                title={card.title}
              />
            </Tilt>
          </Reveal>
        ))}
      </ul>

      {open && openIndex !== null && (
        <DetailCard
          closeLabel={closeLabel}
          footer={open.cta && <Pill className="h-11" href={open.cta.href} variant="secondary">{open.cta.label}</Pill>}
          id={`about-${openIndex}`}
          label={open.description}
          onClose={() => setOpenIndex(null)}
          open
          title={open.title}
        >
          {open.body.split("\n\n").map((paragraph) => (
            <p className="m-0 text-body text-graphite" key={paragraph.slice(0, 24)}>
              {paragraph}
            </p>
          ))}
        </DetailCard>
      )}
    </section>
  );
}
