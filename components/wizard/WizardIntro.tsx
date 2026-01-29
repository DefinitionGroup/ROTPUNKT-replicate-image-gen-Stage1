import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { FaRegCompass } from "react-icons/fa";
import type { WizardPreset } from "./wizardPresets";
import { wizardPresets } from "./wizardPresets";
import { useTranslations } from "next-intl";

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
            src="/rotpunkt-kuechen-logo.svg"
            alt="Rotpunkt Küchen Logo"
            className="w-20 h-20 object-contain"
          />
        </motion.div>
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-semibold text-brand-secondary-1">
            {t('title')}
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wizardPresets.map((preset) => (
          <PresetSelectionCard
            key={preset.label}
            preset={preset}
            disabled={loading}
            onSelect={() => onPresetSelect(preset)}
          />
        ))}

        <motion.button
          type="button"
          className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-gray-700 bg-gray-950/80 p-6 text-left transition hover:border-brand-primary-2/80 hover:bg-brand-primary-2/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/60"
          whileHover={{ translateY: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onBlankStart}
          disabled={loading}
        >
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-brand-primary-2/10 text-brand-primary-2">
            <FaRegCompass className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-brand-secondary-1">
              {t('customCombination')}
            </span>
            <p className="text-xxs text-gray-300 leading-relaxed">
              {t('customDescription')}
            </p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

interface PresetSelectionCardProps {
  preset: WizardPreset;
  onSelect: () => void;
  disabled: boolean;
}

function PresetSelectionCard({ preset, onSelect, disabled }: PresetSelectionCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = typeof preset.previewImage === "string";
  const showImage = hasImage && !imageError;

  return (
    <motion.button
      type="button"
      className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/80 text-left transition hover:border-brand-primary-2/80 hover:bg-brand-primary-2/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-2/60"
      whileHover={{ translateY: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="relative h-36 w-full">
        {showImage ? (
          <Image
            src={preset.previewImage!}
            alt={preset.label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
            priority={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span className="absolute bottom-3 left-4 text-base font-semibold text-white drop-shadow">
          {preset.label}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xxs text-gray-300 leading-relaxed">
          {preset.description}
        </p>
      </div>
    </motion.button>
  );
}
