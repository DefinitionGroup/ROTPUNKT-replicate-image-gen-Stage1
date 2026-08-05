"use client";

import { useTranslations } from "next-intl";

type AiGeneratedLabelProps = {
  className?: string;
};

export default function AiGeneratedLabel({
  className = "",
}: AiGeneratedLabelProps) {
  const t = useTranslations("aiDisclosure");

  return (
    <span
      role="note"
      aria-label={`${t("label")}. ${t("description")}`}
      title={t("description")}
      className={`inline-flex max-w-[calc(100%-1rem)] items-center rounded bg-black/45 px-1.5 py-1 text-[9px] font-medium leading-none tracking-wide text-white/80 shadow-sm backdrop-blur-[2px] ${className}`}
    >
      {t("label")}
    </span>
  );
}
