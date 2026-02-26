"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!enabled || !mounted) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[2147483647] pointer-events-auto"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className={`rounded-xl border border-border/70 bg-card/95 shadow-xl backdrop-blur-md overflow-hidden ${
          isOpen ? "w-[calc(100vw-2rem)] max-w-[36rem]" : "w-auto"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/70 border-b border-border/70">
          <p className="text-xs font-semibold tracking-wide text-foreground">
            Prompt Debug
          </p>
          <button
            type="button"
            onClick={toggleOpen}
            className="rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="prompt-debug-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="p-3"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
}
