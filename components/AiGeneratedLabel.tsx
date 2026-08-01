"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type AiGeneratedLabelProps = {
  className?: string;
  variant?: "inline" | "overlay";
};

export default function AiGeneratedLabel({
  className = "",
  variant = "overlay",
}: AiGeneratedLabelProps) {
  const t = useTranslations("aiDisclosure");
  const isOverlay = variant === "overlay";

  return (
    <div
      role="note"
      aria-label={`${t("label")}. ${t("description")}`}
      title={t("description")}
      className={`${
        isOverlay
          ? "inline-flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-2 py-1.5 text-white shadow-lg backdrop-blur-sm"
          : "inline-flex max-w-full items-center justify-center gap-2.5 rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-foreground shadow-sm backdrop-blur-sm"
      } ${className}`}
    >
      <span className="inline-flex shrink-0 rounded-full bg-white p-0.5">
        <Image
          src="/UI/eu-ai-generated.svg"
          width={126}
          height={40}
          alt=""
          aria-hidden="true"
          unoptimized
          className="h-auto w-[72px]"
        />
      </span>
      <span className="text-left text-[10px] font-semibold leading-tight tracking-[0.01em] sm:text-[11px]">
        {t("label")}
      </span>
    </div>
  );
}
