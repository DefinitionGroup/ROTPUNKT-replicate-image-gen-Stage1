"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/design-system/brand-logo";
import { Pill, RoundButton } from "@/components/design-system/pill";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Link } from "@/i18n/routing";
import type { ContentLink } from "@/lib/content/types";
import { DURATION, SIGNATURE_EASE, STAGGER } from "@/lib/motion";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      ) : (
        <path d="M4 8h16M4 16h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function NavLink({ item, className, onClick }: { item: ContentLink; className: string; onClick?: () => void }) {
  if (item.external) {
    return (
      <a className={className} href={item.href} onClick={onClick} rel="noreferrer" target="_blank">
        {item.label}
      </a>
    );
  }
  return (
    <Link className={className} href={item.href} onClick={onClick}>
      {item.label}
    </Link>
  );
}

/**
 * The marketing header: transparent over the film, frosted once the page
 * scrolls. Text links and the outlined pill on desktop; on phones a round
 * menu button opens the same links as a full-screen sheet.
 */
export function SiteHeader({ items, cta }: { items: ContentLink[]; cta: ContentLink }) {
  const t = useTranslations("common");
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 24);
  });

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [closeMenu, menuOpen]);

  const desktopLink =
    "inline-flex min-h-11 items-center px-1 text-nav leading-none text-ink transition-colors duration-state ease-signature hover:text-porcelain";
  const sheetLink =
    "inline-flex min-h-12 items-center text-title text-ink transition-colors duration-state ease-signature hover:text-porcelain";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-overlay ease-signature ${
          isScrolled || menuOpen ? "border-hairline bg-canvas/80 backdrop-blur-[20px]" : "border-transparent bg-transparent"
        }`}
      >
        <nav className="signature-container flex h-16 items-center justify-between lg:h-20">
          <BrandLogo />
          <div className="hidden items-center gap-7 lg:flex">
            {items.map((item) => (
              <NavLink className={desktopLink} item={item} key={item.label} />
            ))}
            <SignedIn>
              <Link className={`${desktopLink} text-graphite hover:text-ink`} href="/my-images">
                {t("myImages")}
              </Link>
            </SignedIn>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LanguageToggle className="hidden md:inline-flex" />
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="hidden min-h-11 items-center px-2 text-nav text-graphite transition-colors duration-state ease-signature hover:text-ink md:inline-flex"
                  type="button"
                >
                  {t("signIn")}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="hidden md:flex">
                <UserButton />
              </div>
            </SignedIn>
            <Pill className="hidden md:inline-flex" href={cta.href} variant="secondary">
              {cta.label}
            </Pill>
            <RoundButton
              aria-controls="site-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
              className="lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              ref={closeRef}
              tone="quiet"
            >
              <MenuIcon open={menuOpen} />
            </RoundButton>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex flex-col bg-canvas pt-16 lg:hidden"
            exit={{ opacity: 0 }}
            id="site-menu"
            initial={{ opacity: 0 }}
            transition={{ duration: DURATION.overlay, ease: SIGNATURE_EASE }}
          >
            <nav className="signature-container flex flex-1 flex-col justify-between py-10">
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {items.map((item, index) => (
                  <motion.li
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    key={item.label}
                    transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE, delay: index * STAGGER }}
                  >
                    <NavLink className={sheetLink} item={item} onClick={closeMenu} />
                  </motion.li>
                ))}
                <SignedIn>
                  <motion.li
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: DURATION.reveal, ease: SIGNATURE_EASE, delay: items.length * STAGGER }}
                  >
                    <Link className={`${sheetLink} text-graphite`} href="/my-images" onClick={closeMenu}>
                      {t("myImages")}
                    </Link>
                  </motion.li>
                </SignedIn>
              </ul>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <LanguageToggle />
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex min-h-11 items-center px-2 text-nav text-graphite hover:text-ink" type="button">
                        {t("signIn")}
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
                <Pill className="w-full" href={cta.href} onClick={closeMenu}>
                  {cta.label}
                </Pill>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
