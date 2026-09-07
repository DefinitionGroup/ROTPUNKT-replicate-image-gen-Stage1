"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/design-system/brand-logo";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Link } from "@/i18n/routing";

/**
 * The header for the application surface (/studio, gallery): wordmark home,
 * one contextual back link, language, account. Solid black, never frosted —
 * it sits on the stage, not over a film.
 */
export function AppHeader({ action }: { action?: { href: string; label: string } }) {
  const t = useTranslations("common");
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-canvas/90 backdrop-blur-[20px]">
      <div className="signature-container flex h-16 items-center justify-between gap-4">
        <BrandLogo compact />
        <div className="flex items-center gap-1 md:gap-3">
          {action && (
            <Link
              className="group inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-nav leading-none text-graphite transition-colors duration-state ease-signature hover:text-ink"
              href={action.href}
            >
              <svg aria-hidden="true" className="size-3 transition-transform duration-state ease-signature group-hover:-translate-x-0.5" fill="none" viewBox="0 0 12 12">
                <path d="M10 6H2m0 0 4-4M2 6l4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
              </svg>
              {action.label}
            </Link>
          )}
          <LanguageToggle className="hidden sm:inline-flex" />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex min-h-11 items-center px-2 text-nav text-graphite transition-colors duration-state ease-signature hover:text-ink" type="button">
                {t("signIn")}
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link className="hidden min-h-11 items-center px-2 text-nav text-graphite hover:text-ink sm:inline-flex" href="/my-images">
              {t("myImages")}
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
