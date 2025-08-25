import React from 'react'
import { motion } from 'framer-motion'
import { FaArrowLeft } from 'react-icons/fa'

interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onClose?: () => void
  canGoBack: boolean
  loading?: boolean
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onClose,
  canGoBack,
  loading = false
}) => {
  return (
    <header className="relative flex flex-row items-center justify-between w-full px-8">
      <button
        onClick={onBack}
        disabled={!canGoBack || loading}
        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border border-red-400 bg-transparent text-red-400 text-sm font-medium shadow hover:bg-red-500/10 transition-all
          ${
            !canGoBack || loading
              ? "opacity-0 cursor-not-allowed pointer-events-none"
              : "hover:scale-105"
          }
        `}
        tabIndex={canGoBack ? 0 : -1}
        style={{ minWidth: 108 }}
        aria-label="Zurück zum vorherigen Schritt"
      >
        <FaArrowLeft className="text-base" />
        Zurück
      </button>

      <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 gap-1">
        {currentStep >= 0 && (
          <>
            <div className="h-2 w-64 rounded-full bg-gray-800 overflow-hidden">
              <motion.div
                className="h-2 rounded-full bg-red-500"
                initial={false}
                animate={{
                  width: `${
                    ((Math.min(currentStep, totalSteps) + 1) / (totalSteps + 1)) * 100
                  }%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {`Schritt ${Math.min(currentStep + 1, totalSteps + 1)} / ${totalSteps + 1}`}
            </span>
          </>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="cursor-pointer ml-3 text-gray-500 hover:text-red-400 text-3xl font-bold"
          aria-label="Wizard schließen"
          tabIndex={0}
        >
          ×
        </button>
      )}
    </header>
  )
}
