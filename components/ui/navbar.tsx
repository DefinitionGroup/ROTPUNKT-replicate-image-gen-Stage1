"use client";
import React from "react";
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

export default function Navbar() {
  return (
    <div className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50">
      <nav
        className={cn(
          "flex items-center justify-between bg-white/80 rounded-full px-8 py-4 shadow-input"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/about"
            className="text-black dark:text-white hover:text-primary transition"
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-black dark:text-white hover:text-primary transition"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="text-black dark:text-white hover:text-primary transition"
          >
            Contact
          </Link>
          <SignedIn>
            <Link
              href="/my-images"
              className="text-black dark:text-white hover:text-primary transition"
            >
              Meine Bilder
            </Link>
          </SignedIn>
        </div>

        <div className="flex items-center space-x-2 border-l border-neutral-700 pl-4 ml-4 mr-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1 rounded-full text-sm border border-transparent font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 hover:bg-transparent hover:text-white text-black transition-colors border border-transparent hover:border-white">
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
    </div>
  );
}
