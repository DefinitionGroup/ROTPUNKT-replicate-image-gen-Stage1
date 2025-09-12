"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "./logo";
import { TiThMenu } from "react-icons/ti";
import { usePathname } from "next/navigation";
import type {
  MenuNavbarProjected,
  NavbarMenuItemProjected,
} from "@/sanity/sanity.types";
import { internalHref } from "@/utils/nav-internal";

type Props = Pick<MenuNavbarProjected, "menuItems">;

export default function Navbar({ menuItems }: Props) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const pathname = usePathname();

  // avoid hydration mismatch from client-only auth state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  // ---------- link helpers ----------
  const hrefFor = (item: NavbarMenuItemProjected) => {
    if (item.linkType === "internal") return internalHref(item);
    if (item.linkType === "external" && item.externalUrl)
      return item.externalUrl;
    if (item.linkType === "anchor" && item.anchor) return `#${item.anchor}`;
    return "/";
  };

  const targetFor = (item: NavbarMenuItemProjected) =>
    item.openInNewTab ? "_blank" : undefined;

  const relFor = (item: NavbarMenuItemProjected) =>
    item.openInNewTab && item.linkType === "external"
      ? "noopener noreferrer"
      : undefined;

  const shouldPrefetch = (item: NavbarMenuItemProjected, href: string) =>
    item.linkType === "internal" && !href.startsWith("#");

  const isActive = (item: NavbarMenuItemProjected, href: string) => {
    if (item.linkType !== "internal") return false;
    const norm = (p: string) => (p !== "/" ? p.replace(/\/+$/, "") : "/");
    return norm(pathname) === norm(href);
  };

  const renderLink = (item: NavbarMenuItemProjected, mobile = false) => {
    const href = hrefFor(item);
    const active = isActive(item, href);

    return (
      <Link
        key={item._key}
        href={href}
        target={targetFor(item)}
        rel={relFor(item)}
        prefetch={shouldPrefetch(item, href)}
        onClick={mobile ? closeMenu : undefined}
        className={
          mobile
            ? cn("block text-white text-2xl font-medium tracking-tight")
            : cn(
                "text-inherit hover:text-primary transition",
                active && "text-primary"
              )
        }
      >
        {item.label}
      </Link>
    );
  };
  // ----------------------------------------

  return (
    <div className="fixed top-4 inset-x-0 z-50 px-10 md:px-20 flex justify-center w-full">
      <nav
        className={cn(
          "relative mx-auto w-auto md:w-full max-w-7xl flex gap-6 items-center justify-between",
          "rounded-full px-4 md:px-6 py-3 md:py-4 shadow-input",
          "bg-white/30 backdrop-blur-sm",
          "text-black dark:text-white"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
          aria-label="Toggle menu"
          aria-controls="mobile-nav"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <TiThMenu className="w-6 h-6" />
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6 md:gap-8">
          {menuItems?.map((item) => renderLink(item))}
          {mounted && (
            <SignedIn>
              <Link
                href="/my-images"
                className="text-inherit hover:text-primary transition"
              >
                Meine Bilder
              </Link>
            </SignedIn>
          )}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center space-x-2 border-l border-neutral-700/30 pl-4 ml-4 mr-4">
          {mounted ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="cursor-pointer px-3 py-1 rounded-full text-sm border border-transparent font-medium text-neutral-400 hover:text-inherit hover:bg-neutral-800/10 dark:hover:bg-white/10 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="cursor-pointer px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-white/10 hover:bg-transparent hover:text-inherit text-black dark:text-white transition-colors border border-transparent hover:border-current">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }}
                />
              </SignedIn>
            </>
          ) : (
            // Placeholder with same dimensions to prevent layout shift
            <div className="flex items-center space-x-2">
              <div className="w-[60px] h-[32px]" />
              <div className="w-[64px] h-[32px]" />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            aria-hidden={!open}
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              aria-label="Close menu"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative h-full w-full flex flex-col"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-2"
                >
                  <Logo />
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  ×
                </button>
              </div>

              <motion.nav
                className="flex-1 px-6 py-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <ul className="space-y-4">
                  {menuItems?.map((item) => (
                    <motion.li key={item._key} variants={itemVariants}>
                      {renderLink(item, true)}
                    </motion.li>
                  ))}
                  {mounted && (
                    <SignedIn>
                      <motion.li variants={itemVariants}>
                        <Link
                          href="/my-images"
                          onClick={closeMenu}
                          className="block text-white text-2xl font-medium tracking-tight"
                        >
                          Meine Bilder
                        </Link>
                      </motion.li>
                    </SignedIn>
                  )}
                </ul>
              </motion.nav>

              <motion.div
                className="px-6 pb-8 pt-4 border-t border-white/10 flex items-center justify-end"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
              >
                {mounted ? (
                  <>
                    <SignedOut>
                      <div className="flex gap-2">
                        <SignInButton mode="modal">
                          <button
                            onClick={closeMenu}
                            className="cursor-pointer px-4 py-2 rounded-full text-base font-medium text-white bg-white/10 hover:bg-white/20"
                          >
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button
                            onClick={closeMenu}
                            className="cursor-pointer px-4 py-2 rounded-full text-base font-medium text-black bg-white hover:bg-white/90"
                          >
                            Sign Up
                          </button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <UserButton
                        appearance={{
                          elements: { userButtonAvatarBox: "w-9 h-9" },
                        }}
                      />
                    </SignedIn>
                  </>
                ) : (
                  // Placeholder for mobile auth section
                  <div className="flex gap-2">
                    <div className="w-[72px] h-[40px] rounded-full bg-white/10" />
                    <div className="w-[72px] h-[40px] rounded-full bg-white" />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
