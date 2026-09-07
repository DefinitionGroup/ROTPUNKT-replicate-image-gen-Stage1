"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/design-system/label";
import { Pill } from "@/components/design-system/pill";
import type { WizardSelectionItem } from "@/components/wizard/useWizardSelectionSummary";
import { DURATION, SIGNATURE_EASE } from "@/lib/motion";

type RailProps = {
  items: WizardSelectionItem[];
  currentStep: number;
  totalSteps: number;
  extraWishes: string;
  prompt: string;
  missingCount: number;
  isSignedIn: boolean;
  stage: "configure" | "result";
  onJumpToStep: (index: number) => void;
  onJumpToFinal: () => void;
  onSubmit: () => void;
  onRequireAuth: () => void;
  onEdit: () => void;
  onReset: () => void;
  className?: string;
};

function Dot({ state }: { state: "active" | "done" | "open" }) {
  return (
    <span
      aria-hidden="true"
      className={`size-1.5 shrink-0 rounded-pill transition-colors duration-state ease-signature ${
        state === "active" ? "bg-signature" : state === "done" ? "bg-ink" : "bg-hairline"
      }`}
    />
  );
}

function progressOf(currentStep: number, totalSteps: number) {
  const stages = totalSteps + 1;
  const stage = Math.min(Math.max(currentStep + 1, 0), stages);
  return (stage / stages) * 100;
}

/**
 * The list of decisions. Every row is the step it came from, so a wrong
 * choice is one click from being changed. The red line at the top is the
 * only progress indicator; the rows themselves say what is still open.
 */
export function StudioRail({
  className = "",
  currentStep,
  extraWishes,
  isSignedIn,
  items,
  missingCount,
  onEdit,
  onJumpToFinal,
  onJumpToStep,
  onRequireAuth,
  onReset,
  onSubmit,
  prompt,
  stage,
  totalSteps,
}: RailProps) {
  const t = useTranslations("studio.rail");
  const isComplete = missingCount === 0;
  const isOnFinalStep = currentStep >= totalSteps;
  const activeIndex = stage === "result" ? -1 : currentStep;

  const primaryAction = (() => {
    if (stage === "result") {
      return (
        <Pill className="w-full" onClick={onEdit} type="button" variant="secondary">
          {t("edit")}
        </Pill>
      );
    }
    if (!isComplete) {
      return <p className="text-caption text-graphite">{t("incomplete", { count: missingCount })}</p>;
    }
    if (!isOnFinalStep) {
      return (
        <Pill className="w-full" onClick={onJumpToFinal} type="button" variant="secondary">
          {t("toWishes")}
        </Pill>
      );
    }
    if (!isSignedIn) {
      return (
        <Pill className="w-full" onClick={onRequireAuth} type="button">
          {t("signIn")}
        </Pill>
      );
    }
    return (
      <Pill className="w-full" onClick={onSubmit} type="button">
        {t("generate")}
      </Pill>
    );
  })();

  return (
    <aside aria-label={t("title")} className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <Label>{t("title")}</Label>
        <span className="tnum text-caption text-graphite">
          {t("step", { current: Math.min(currentStep + 1, totalSteps + 1), total: totalSteps + 1 })}
        </span>
      </div>
      <div className="mt-3 h-px w-full overflow-hidden bg-hairline">
        <motion.div
          animate={{ width: `${progressOf(currentStep, totalSteps)}%` }}
          className="h-px bg-signature"
          initial={false}
          transition={{ duration: DURATION.overlay, ease: SIGNATURE_EASE }}
        />
      </div>

      <ol className="mt-6 flex flex-col border-t border-ink">
        {items.map((item) => {
          const state = item.stepIndex === activeIndex ? "active" : item.selectedLabel ? "done" : "open";
          return (
            <li className="border-b border-hairline" key={item.key}>
              <button
                aria-current={state === "active" ? "step" : undefined}
                className="group flex min-h-[52px] w-full items-center justify-between gap-4 py-3 text-left transition-colors duration-state ease-signature"
                onClick={() => onJumpToStep(item.stepIndex)}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Dot state={state} />
                  <span className={`truncate text-nav ${state === "active" ? "text-ink" : "text-graphite group-hover:text-ink"}`}>
                    {item.title}
                  </span>
                </span>
                <span className={`max-w-[48%] truncate text-caption ${item.selectedLabel ? "text-porcelain" : "text-ash"}`}>
                  {item.selectedLabel ?? t("open")}
                </span>
              </button>
            </li>
          );
        })}
        <li className="border-b border-hairline">
          <button
            aria-current={activeIndex === totalSteps ? "step" : undefined}
            className="group flex min-h-[52px] w-full items-center justify-between gap-4 py-3 text-left"
            onClick={onJumpToFinal}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Dot state={activeIndex === totalSteps ? "active" : extraWishes ? "done" : "open"} />
              <span className={`truncate text-nav ${activeIndex === totalSteps ? "text-ink" : "text-graphite group-hover:text-ink"}`}>
                {t("wishes")}
              </span>
            </span>
            <span className={`max-w-[48%] truncate text-caption ${extraWishes ? "text-porcelain" : "text-ash"}`}>
              {extraWishes || t("wishesEmpty")}
            </span>
          </button>
        </li>
      </ol>

      <div className="mt-6 flex flex-col gap-3">
        {primaryAction}
        {currentStep >= 0 && (
          <button
            className="self-start text-caption text-graphite underline-offset-4 transition-colors duration-state ease-signature hover:text-ink hover:underline"
            onClick={onReset}
            type="button"
          >
            {t("reset")}
          </button>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-caption text-graphite">
          <summary className="cursor-pointer select-none hover:text-ink">{t("prompt")}</summary>
          <p className="mt-3 whitespace-pre-wrap break-words font-mono text-xxs leading-relaxed text-ash">{prompt}</p>
        </details>
      )}
    </aside>
  );
}

/**
 * The narrow-screen counterpart: the same steps as a scrolling row of chips
 * above the stage. Same dots, same jumps, no labels for the chosen values.
 */
export function StudioStepStrip({
  className = "",
  currentStep,
  items,
  onJumpToFinal,
  onJumpToStep,
  totalSteps,
}: Pick<RailProps, "items" | "currentStep" | "totalSteps" | "onJumpToStep" | "onJumpToFinal" | "className">) {
  const t = useTranslations("studio.rail");
  const chips = [
    ...items
      .filter((item, index, all) => all.findIndex((other) => other.stepIndex === item.stepIndex) === index)
      .map((item) => ({
        key: item.key,
        title: item.title,
        index: item.stepIndex,
        done: items.filter((other) => other.stepIndex === item.stepIndex).every((other) => other.selectedLabel),
      })),
    { key: "wishes", title: t("wishes"), index: totalSteps, done: false },
  ];

  return (
    <div className={`-mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <ol className="flex w-max gap-2">
        {chips.map((chip) => {
          const active = chip.index === currentStep;
          return (
            <li key={chip.key}>
              <button
                aria-current={active ? "step" : undefined}
                className={`inline-flex h-9 items-center gap-2 rounded-pill border px-3 text-caption transition-colors duration-state ease-signature ${
                  active ? "border-ink text-ink" : "border-hairline text-graphite hover:text-ink"
                }`}
                onClick={() => (chip.index === totalSteps ? onJumpToFinal() : onJumpToStep(chip.index))}
                type="button"
              >
                <Dot state={active ? "active" : chip.done ? "done" : "open"} />
                {chip.title}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
