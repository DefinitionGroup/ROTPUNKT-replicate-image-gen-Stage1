"use client";

import { motion, AnimatePresence } from "motion/react";
import ImageGenerator from "./ImageGenerator";
import TickerGallery from "./Ticker";
import KitchenWizard from "./KitchenWizard";
import { IntroCard } from "./IntroCard";
import { useStore } from "@nanostores/react";
import { $pageStep } from "@/store/step";
import { $showWizard } from "@/store/modals";
import { $prompt } from "@/store/prompt";
import { PropsWithChildren } from "react";
import HeroSection from "./Header";

export default function PageContent({ children }: PropsWithChildren) {
  const pageStep = useStore($pageStep)
  const showWizard = useStore($showWizard)

  return (
    <>
      <HeroSection />

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
      {children}
    </>
  );
}
