import Image from "next/image";
import { Link } from "@/i18n/routing";

type BrandLogoProps = {
  className?: string;
  /** Hides the "Visions" suffix on tight surfaces. */
  compact?: boolean;
  label?: string;
  /** `lg` doubles the wordmark for the header bars; the footer keeps `md`. */
  size?: "md" | "lg";
};

/** The Rotpunkt wordmark (white variant, red dot) plus the product suffix. Every surface is dark. */
export function BrandLogo({ className = "", compact = false, label = "Rotpunkt Visions Startseite", size = "md" }: BrandLogoProps) {
  const large = size === "lg";
  return (
    <Link
      aria-label={label}
      className={`group inline-flex items-center gap-4 whitespace-nowrap text-ink ${className}`}
      href="/"
    >
      <Image
        alt="Rotpunkt"
        className={`${large ? "h-11" : "h-[22px]"} w-auto transition-opacity duration-state ease-signature group-hover:opacity-90`}
        height={large ? 44 : 22}
        priority
        src="/rotpunkt-kuechen-logo.svg"
        unoptimized
        width={large ? 280 : 140}
      />
      {!compact && (
        <>
          <span aria-hidden="true" className={`${large ? "h-7" : "h-[18px]"} w-px bg-hairline`} />
          <span className="text-[0.875rem] tracking-[0.02em] text-graphite">Visions</span>
        </>
      )}
    </Link>
  );
}
