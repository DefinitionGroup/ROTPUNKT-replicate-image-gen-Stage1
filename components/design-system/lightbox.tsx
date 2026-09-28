"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { RoundButton } from "@/components/design-system/pill";
import { DURATION, SIGNATURE_EASE } from "@/lib/motion";

export type LightboxItem = {
  image: string;
  alt: string;
  title?: string;
  description?: string;
};

type LightboxProps = {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
  labels: { close: string; previous: string; next: string };
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * One image as large as the viewport allows, on the dimmed page. Arrow keys
 * and the two round buttons move through the set; Escape and the backdrop
 * close it. Rendered into <body> so a tilted card cannot trap it.
 */
export function Lightbox({ index, items, labels, onChange }: LightboxProps) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && index >= 0 && index < items.length;
  const item = open ? items[index] : null;
  const count = items.length;

  const close = useCallback(() => onChange(null), [onChange]);
  const step = useCallback(
    (delta: number) => {
      if (index === null || count < 2) return;
      onChange((index + delta + count) % count);
    },
    [count, index, onChange]
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [close, open, step]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label={labels.close}
            className="absolute inset-0 bg-canvas/85 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={close}
            transition={{ duration: DURATION.overlay, ease: SIGNATURE_EASE }}
            type="button"
          />
          <motion.figure
            animate={{ opacity: 1, scale: 1 }}
            aria-label={item.title ?? item.alt}
            aria-modal="true"
            className="relative m-0 flex max-h-full w-full max-w-[1400px] flex-col"
            exit={{ opacity: 0, scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.98 }}
            role="dialog"
            transition={{ duration: DURATION.overlay, ease: SIGNATURE_EASE }}
          >
            <div
              className="relative w-full overflow-hidden rounded-card border border-hairline bg-charcoal"
              style={{ aspectRatio: "16 / 10", maxHeight: "calc(100svh - 12rem)" }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key={item.image}
                  transition={{ duration: DURATION.state, ease: SIGNATURE_EASE }}
                >
                  <Image alt={item.alt} className="object-contain" fill priority sizes="100vw" src={item.image} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-start justify-between gap-6">
              <figcaption className="min-w-0">
                {item.title && <p className="m-0 text-card-title text-ink md:text-title">{item.title}</p>}
                {item.description && <p className="m-0 mt-1 text-body text-graphite">{item.description}</p>}
                {count > 1 && (
                  <p className="tnum m-0 mt-2 text-caption text-ash">
                    {index + 1} / {count}
                  </p>
                )}
              </figcaption>
              <div className="flex shrink-0 items-center gap-2">
                {count > 1 && (
                  <>
                    <RoundButton aria-label={labels.previous} onClick={() => step(-1)} tone="outline">
                      <Chevron direction="left" />
                    </RoundButton>
                    <RoundButton aria-label={labels.next} onClick={() => step(1)} tone="outline">
                      <Chevron direction="right" />
                    </RoundButton>
                  </>
                )}
                <RoundButton aria-label={labels.close} onClick={close} ref={closeRef}>
                  <CloseIcon />
                </RoundButton>
              </div>
            </div>
          </motion.figure>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
