"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Card } from "@/components/design-system/card";
import { Emphasis } from "@/components/design-system/emphasis";
import { GlassSegments } from "@/components/design-system/glass";
import { Label, SectionIntro } from "@/components/design-system/label";
import { Overlay } from "@/components/design-system/overlay";
import { Pill } from "@/components/design-system/pill";
import { Reveal } from "@/components/design-system/reveal";
import type { StudioTeaserContent } from "@/lib/content/types";
import { DURATION, SIGNATURE_EASE } from "@/lib/motion";

const CYCLE_MS = 3200;

/** The configurator as a card with a living HUD: the stages cycle over the scene until someone touches them. */
export function StudioTeaser({ studio, closeLabel }: { studio: StudioTeaserContent; closeLabel: string }) {
  const reduceMotion = useReducedMotion();
  const [stageId, setStageId] = useState(studio.stages[0]?.id ?? "");
  const [paused, setPaused] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || studio.stages.length < 2) return;
    const timer = window.setInterval(() => {
      setStageId((current) => {
        const index = studio.stages.findIndex((stage) => stage.id === current);
        return studio.stages[(index + 1) % studio.stages.length].id;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, studio.stages]);

  const stage = studio.stages.find((entry) => entry.id === stageId) ?? studio.stages[0];

  return (
    <section className="signature-container pt-20 md:pt-[120px]" id="konfigurator">
      <Reveal>
        <Card className="grid overflow-hidden lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative order-first min-h-[260px] bg-canvas lg:order-last lg:min-h-[560px]">
            <Image alt={studio.alt} className="object-cover" fill sizes="(min-width: 1024px) 58vw, 100vw" src={studio.image} unoptimized />
            <div aria-hidden="true" className="media-shade absolute inset-0" />
            {studio.stages.length > 0 && (
              <div className="absolute left-4 top-4 md:left-6 md:top-6">
                <GlassSegments
                  activeId={stageId}
                  ariaLabel={studio.label ?? "Stages"}
                  layoutGroup="teaser"
                  onChange={(id) => {
                    setPaused(true);
                    setStageId(id);
                  }}
                  segments={studio.stages.map(({ id, label }) => ({ id, label }))}
                  size="card"
                />
              </div>
            )}
            {stage && (
              <div aria-live="polite" className="absolute inset-x-4 bottom-4 hidden min-h-12 max-w-[34ch] md:inset-x-6 md:bottom-6 md:block">
                <AnimatePresence mode="wait">
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="m-0 text-nav font-base text-ink"
                    exit={{ opacity: 0, y: -6 }}
                    initial={{ opacity: 0, y: 6 }}
                    key={stage.id}
                    transition={{ duration: DURATION.accordion, ease: SIGNATURE_EASE }}
                  >
                    <span className="text-graphite">{stage.title}.</span> {stage.body}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 md:p-10 lg:gap-12 lg:p-14">
            <div className="flex flex-col gap-5">
              <SectionIntro label={studio.label} title={<Emphasis text={studio.title} />} />
              <p className="m-0 max-w-[40ch] text-body text-graphite">{studio.body}</p>
              {studio.note && (
                <p className="m-0 border-t border-hairline pt-5 text-caption text-graphite">{studio.note}</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Pill className="w-full sm:w-auto" href={studio.cta.href}>
                {studio.cta.label}
              </Pill>
              <Pill className="w-full sm:w-auto" onClick={() => setExplainerOpen(true)} variant="secondary">
                {studio.explainerLabel}
              </Pill>
            </div>
          </div>
        </Card>
      </Reveal>

      <Overlay
        closeLabel={closeLabel}
        footer={<Pill href={studio.cta.href}>{studio.cta.label}</Pill>}
        label={studio.label}
        onClose={() => setExplainerOpen(false)}
        open={explainerOpen}
        title={<Emphasis text={studio.explainerTitle} />}
      >
        <p className="m-0 mt-4 max-w-[44ch] text-body text-graphite">{studio.explainerIntro}</p>
        <ol className="m-0 mt-8 flex list-none flex-col p-0">
          {studio.steps.map((entry, index) => (
            <li className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-hairline py-6 last:border-b" key={entry.label}>
              <span className="tnum text-title text-graphite">{index + 1}</span>
              <div className="flex flex-col gap-2">
                <Label>{entry.label}</Label>
                <h3 className="m-0 text-card-title">{entry.title}</h3>
                <p className="m-0 text-body text-graphite">{entry.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Overlay>
    </section>
  );
}
