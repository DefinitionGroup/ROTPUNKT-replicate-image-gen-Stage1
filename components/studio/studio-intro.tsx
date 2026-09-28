"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Emphasis } from "@/components/design-system/emphasis";
import { Label } from "@/components/design-system/label";
import type { WizardPreset } from "@/components/wizard/wizardPresets";
import { wizardPresets } from "@/components/wizard/wizardPresets";
import { DURATION, REVEAL_RISE, SIGNATURE_EASE, STAGGER } from "@/lib/motion";

type StudioIntroProps = {
  onPresetSelect: (preset: WizardPreset) => void;
  onBlankStart: () => void;
};

function Arrow() {
  return (
    <svg aria-hidden="true" className="size-3.5 transition-transform duration-state ease-signature group-hover:translate-x-0.5" fill="none" viewBox="0 0 12 12">
      <path d="M2 6h8m0 0L6 2m4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

const rise = (index: number) => ({
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: REVEAL_RISE },
  transition: { delay: index * STAGGER, duration: DURATION.reveal, ease: SIGNATURE_EASE },
});

/**
 * The first screen of the studio: start from nothing, or from one of the
 * curated templates. Templates are full configurations — choosing one lands
 * on the wishes step with everything filled in and every row still editable.
 */
export function StudioIntro({ onBlankStart, onPresetSelect }: StudioIntroProps) {
  const t = useTranslations("studio");
  const tPresets = useTranslations("wizard.intro.presets");

  return (
    <section>
      <motion.div {...rise(0)} className="max-w-2xl">
        <Label>{t("eyebrow")}</Label>
        <h1 className="mt-4 text-heading-lg text-ink">
          <Emphasis text={t("intro.title")} />
        </h1>
        <p className="mt-4 max-w-xl text-lead text-graphite">{t("intro.lead")}</p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
        <motion.button
          {...rise(1)}
          className="group flex min-h-[280px] flex-col justify-between rounded-card border border-ink/70 bg-canvas p-6 text-left transition-[border-color,background-color] duration-state ease-signature hover:border-ink hover:bg-charcoal/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          onClick={onBlankStart}
          type="button"
        >
          <span aria-hidden="true" className="size-2.5 rounded-pill bg-signature" />
          <span>
            <span className="block text-card-title text-ink">{t("intro.blankTitle")}</span>
            <span className="mt-2 block text-body text-graphite">{t("intro.blankLead")}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-nav text-ink">
              {t("intro.start")}
              <Arrow />
            </span>
          </span>
        </motion.button>

        {wizardPresets.map((preset, index) => (
          <motion.button
            key={preset.id}
            {...rise(index + 2)}
            className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-card border border-hairline bg-charcoal p-6 text-left transition-[border-color,transform] duration-state ease-signature hover:border-graphite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            onClick={() => onPresetSelect(preset)}
            type="button"
          >
            {preset.previewImage ? (
              <Image
                alt=""
                className="object-cover transition-transform duration-reveal ease-signature group-hover:scale-[1.03]"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                src={preset.previewImage}
              />
            ) : null}
            <span aria-hidden="true" className="media-shade-deep absolute inset-0" />
            <span className="relative">
              <span className="block font-label text-label uppercase tracking-label text-porcelain/80">
                {t("intro.presetsLabel")}
              </span>
              <span className="mt-2 block text-card-title text-ink">{tPresets(`${preset.id}.label`)}</span>
              <span className="mt-2 block text-body text-porcelain/85">{tPresets(`${preset.id}.description`)}</span>
              <span className="mt-5 inline-flex items-center gap-2 text-nav text-ink">
                {t("intro.start")}
                <Arrow />
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
