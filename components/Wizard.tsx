'use client'

import { $showWizard } from "@/app/store/modals"
import { $prompt } from "@/app/store/prompt"
import { $pageStep } from "@/app/store/step"
import { AnimatePresence } from "motion/react"
import ImageGenerator from "./ImageGenerator"
import { IntroCard } from "./IntroCard"
import KitchenWizard from "./KitchenWizard"
import { useStore } from "@nanostores/react"

export default function Wizard() {
  const pageStep = useStore($pageStep)
  const showWizard = useStore($showWizard)


  return (
    <div className="text-center my-8 min-h-[25rem]  flex flex-col items-center justify-center">
      {pageStep === 'intro' && (
        <IntroCard
          onStart={() => $showWizard.set(true)}
        />
      )}
      {pageStep === 'imagegen' && (
        <div className="w-full max-w-3xl mx-auto min-h-[44rem] flex items-center justify-center">
          <ImageGenerator
            onBack={() => {
              $prompt.set(null)
              $pageStep.set('intro')
              $showWizard.set(true)
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {showWizard && (
          <KitchenWizard
            onPromptReady={(prompt) => {
              $prompt.set(prompt)
              $showWizard.set(false)
              $pageStep.set('imagegen')
            }}
            onClose={() => $showWizard.set(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
