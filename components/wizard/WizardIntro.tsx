import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { FaRegCompass } from "react-icons/fa";
import type { WizardPreset } from "./wizardPresets";
import { wizardPresets } from "./wizardPresets";
import { useTranslations } from "next-intl";
import { useRotpunktLogoSrc } from "@/components/theme/useRotpunktLogo";

interface WizardIntroProps {
  onPresetSelect: (preset: WizardPreset) => void;
  onBlankStart: () => void;
  loading?: boolean;
}

export const WizardIntro: React.FC<WizardIntroProps> = ({
  onPresetSelect,
  onBlankStart,
  loading = false,
}) => {
  const t = useTranslations('wizard.intro');
  const tPresets = useTranslations("wizard.intro.presets");
  const logoSrc = useRotpunktLogoSrc();

  return (
    <motion.div
      className="w-full flex flex-col gap-6"
      style={{ minHeight: 360 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, type: "spring" }}
    >
      <div className="flex flex-col items-start gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <img
            src={logoSrc}
            alt="Rotpunkt Küchen Logo"
            className="w-20 h-20 object-contain"
          />
        </motion.div>
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-semibold text-foreground">
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t('description')}
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        className="w-full flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/35 bg-brand-primary-2 p-6 text-left text-white shadow-[0_10px_32px_rgba(220,38,38,0.35)] transition hover:bg-red-600 hover:shadow-[0_16px_40px_rgba(220,38,38,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        whileHover={{ translateY: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={onBlankStart}
        disabled={loading}
      >
        <div className="flex items-center justify-center h-14 w-14 rounded-full border border-white/40 bg-white/10 text-white">
          <FaRegCompass className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-white">
            {t('customCombination')}
          </span>
          <p className="text-xxs text-white/90 leading-relaxed">
            {t('customDescription')}
          </p>
        </div>
      </motion.button>

      <div className="h-px w-full bg-border/70" aria-hidden="true" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wizardPresets.map((preset) => (
          <PresetSelectionCard
            key={preset.id}
            preset={preset}
            label={tPresets(`${preset.id}.label`)}
            description={tPresets(`${preset.id}.description`)}
            disabled={loading}
            onSelect={() => onPresetSelect(preset)}
          />
        ))}
      </div>
    </motion.div>
  );
};

interface PresetSelectionCardProps {
  preset: WizardPreset;
  label: string;
  description: string;
  onSelect: () => void;
  disabled: boolean;
}

function PresetSelectionCard({
  preset,
  label,
  description,
  onSelect,
  disabled,
}: PresetSelectionCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = typeof preset.previewImage === "string";
  const showImage = hasImage && !imageError;

  return (
    <motion.button
      type="button"
      className="group overflow-hidden rounded-2xl border border-border bg-card/80 text-left transition hover:border-brand-primary-2/80 hover:bg-brand-primary-2/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/60"
      whileHover={{ translateY: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="relative h-36 w-full">
        {showImage ? (
          <Image
            src={preset.previewImage!}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
            priority={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-background" />
        )}
        <span className="absolute bottom-3 left-4 text-base font-semibold text-white drop-shadow">
          {label}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xxs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
