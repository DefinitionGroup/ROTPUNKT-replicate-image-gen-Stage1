import React from 'react'
import { motion } from 'motion/react'

interface WizardIntroProps {
  onStart: () => void
}

export const WizardIntro: React.FC<WizardIntroProps> = ({ onStart }) => {
  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center text-center gap-7"
      style={{ minHeight: 360 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.38, type: "spring" }}
    >
      <motion.img
        src="/rotpunkt-kuechen-logo.svg"
        alt="Rotpunkt Küchen Logo"
        className="mb-3 w-28 h-28"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.16, duration: 0.38 }}
      />

      <div className="flex flex-col gap-2 mb-3">
        <h2 className="text-2xl font-extrabold text-white bg-red-500 bg-clip-text tracking-tight drop-shadow-xl">
          Küchen-Konfigurator
        </h2>
        <p className="text-gray-200 tracking-tight text-sm max-w-xl">
          Starten Sie jetzt und gestalten Sie Ihre Traumküche Schritt für Schritt.
        </p>
      </div>

      <motion.button
        onClick={onStart}
        className="cursor-pointer px-8 py-3 rounded-full bg-red-500 text-white text-base font-bold shadow-md border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.97 }}
        autoFocus
      >
        Jetzt starten
      </motion.button>
    </motion.div>
  )
}
