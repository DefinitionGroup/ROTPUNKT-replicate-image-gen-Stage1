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
import { Menu as MenuType } from "@/sanity/sanity.types";

type Props = MenuType

// todo: Integrate into Sanity

export default function Navbar({ menuItems }: Props) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
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

  return (
    <div className="fixed top-4 inset-x-0 z-50 px-10 md:px-20  flex justify-center w-full">
      <nav
        className={cn(
          "relative mx-auto w-auto md:w-full max-w-7xl flex gap-6 items-center justify-between rounded-full px-4 md:px-6 py-3 md:py-4 shadow-input bg-white/30 backdrop-blur-sm"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full  hover:bg-black/5 dark:hover:bg-white/5 transition"
          aria-label="Toggle menu"
          aria-controls="mobile-nav"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <TiThMenu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center gap-6 md:gap-8">
          {menuItems && menuItems.map((link) => (
            <Link
              key={link._key}
              className="text-black dark:text-white hover:text-primary transition"
              href={link.externalUrl || `#${link.anchor}`}
              target={link.externalUrl ? "_blank" : "_self"}
            >
              {link.label!}
            </Link>
          ))}

          <SignedIn>
            <Link
              href="/my-images"
              className="text-black dark:text-white hover:text-primary transition"
            >
              Meine Bilder
            </Link>
          </SignedIn>
        </div>

        <div className="hidden md:flex items-center space-x-2 border-l border-neutral-700 pl-4 ml-4 mr-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cursor-pointer px-3 py-1 rounded-full text-sm border border-transparent font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="cursor-pointer px-3 py-1 rounded-full text-sm font-medium bg-gray-100 hover:bg-transparent hover:text-white text-black transition-colors border border-transparent hover:border-white">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>

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
                  X
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
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/about"
                      onClick={closeMenu}
                      className="block text-white text-2xl font-medium tracking-tight"
                    >
                      About
                    </Link>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/services"
                      onClick={closeMenu}
                      className="block text-white text-2xl font-medium tracking-tight"
                    >
                      Services
                    </Link>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/contact"
                      onClick={closeMenu}
                      className="block text-white text-2xl font-medium tracking-tight"
                    >
                      Contact
                    </Link>
                  </motion.li>
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
                </ul>
              </motion.nav>

              <motion.div
                className="px-6 pb-8 pt-4 border-t border-white/10 flex items-center justify-end"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
