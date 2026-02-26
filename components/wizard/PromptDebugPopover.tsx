"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "wizard_prompt_debug_open";

interface PromptDebugPopoverProps {
  enabled: boolean;
  stepLabel: string;
  missingKeys: string[];
  sections: string[];
  fallbackText?: string;
}

export function PromptDebugPopover({
  enabled,
  stepLabel,
  missingKeys,
  sections,
  fallbackText = "Prompt is currently empty.",
}: PromptDebugPopoverProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "0") {
        setIsOpen(false);
      } else if (saved === "1") {
        setIsOpen(true);
      }
    } catch {
      // Ignore storage access errors (private mode, restricted storage).
    }
  }, [enabled]);

  const toggleOpen = () => {
    setIsOpen((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage access errors.
      }
      return next;
    });
  };

  if (!enabled) return null;

  return (
    <div className="fixed top-4 right-4 z-[2147483646] pointer-events-auto">
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="prompt-debug-expanded"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-[calc(100vw-2rem)] max-w-[36rem] rounded-xl border border-border/70 bg-card/95 shadow-xl backdrop-blur-md overflow-hidden"
          >
            <button
              type="button"
              onClick={toggleOpen}
              className="w-full px-3 py-2 text-left text-xs font-semibold tracking-wide text-foreground bg-muted/70 hover:bg-muted transition-colors"
            >
              Prompt Debug
            </button>

            <div className="p-3">
              <p className="text-xs text-muted-foreground text-left">
                Step: <span className="font-medium text-foreground">{stepLabel}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground text-left">
                Missing:{" "}
                <span className="font-medium text-foreground">
                  {missingKeys.length > 0 ? missingKeys.join(", ") : "none"}
                </span>
              </p>

              <div className="mt-3 max-h-[50dvh] overflow-auto rounded-md border border-border/70 bg-background/80 p-3 text-left">
                {sections.length > 0 ? (
                  <div className="space-y-2">
                    {sections.map((section, index) => (
                      <p
                        key={`${index}-${section.slice(0, 24)}`}
                        className="text-sm leading-relaxed text-foreground break-words text-left"
                      >
                        {section}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground text-left">
                    {fallbackText}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="prompt-debug-collapsed"
            type="button"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={toggleOpen}
            className="rounded-full border border-border/70 bg-card/95 px-3 py-2 text-xs font-semibold tracking-wide text-foreground shadow-lg backdrop-blur-md hover:bg-muted/50 transition-colors"
          >
            Prompt Debug
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

