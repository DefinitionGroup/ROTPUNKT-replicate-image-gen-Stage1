import Image from "next/image";
import { Link } from "@/i18n/routing";

type BrandLogoProps = {
  className?: string;
  /** Hides the "Visions" suffix on tight surfaces. */
  compact?: boolean;
  label?: string;
};

/** The Rotpunkt wordmark (white variant, red dot) plus the product suffix. Every surface is dark. */
export function BrandLogo({ className = "", compact = false, label = "Rotpunkt Visions Startseite" }: BrandLogoProps) {
  return (
    <Link
      aria-label={label}
      className={`group inline-flex items-center gap-4 whitespace-nowrap text-ink ${className}`}
      href="/"
    >
      <Image
        alt="Rotpunkt"
        className="h-[22px] w-auto transition-opacity duration-state ease-signature group-hover:opacity-90"
        height={22}
        priority
        src="/rotpunkt-kuechen-logo.svg"
        unoptimized
        width={140}
      />
      {!compact && (
        <>
          <span aria-hidden="true" className="h-[18px] w-px bg-hairline" />
          <span className="text-[0.875rem] tracking-[0.02em] text-graphite">Visions</span>
        </>
      )}
    </Link>
  );
}
