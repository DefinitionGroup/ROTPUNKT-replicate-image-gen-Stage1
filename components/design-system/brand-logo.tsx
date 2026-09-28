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
        className={`${large ? "h-[60px]" : "h-[66px]"} w-auto transition-opacity duration-state ease-signature group-hover:opacity-90`}
        height={large ? 60 : 66}
        priority
        src="/rotpunkt-kuechen-logo.svg"
        unoptimized
        width={large ? 380 : 420}
      />
      {!compact && (
        <>
          <span aria-hidden="true" className={`${large ? "h-9" : "h-6"} w-px bg-hairline`} />
          <span className="text-[0.875rem] tracking-[0.02em] text-graphite">Visions</span>
        </>
      )}
    </Link>
  );
}
