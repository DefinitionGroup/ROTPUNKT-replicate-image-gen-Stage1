"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export const ROTPUNKT_LOGO_DARK_MODE = "/rotpunkt-kuechen-logo.svg";
export const ROTPUNKT_LOGO_LIGHT_MODE = "/rotpunkt-kuechen-logo-dunkel.svg";
const ROTPUNKT_FILENAME_DARK = "rotpunkt-kuechen-logo.svg";
const ROTPUNKT_FILENAME_LIGHT = "rotpunkt-kuechen-logo-dunkel.svg";

type ResolveLogoOptions = {
  fallbackToThemeLogo?: boolean;
  fallbackSrc?: string;
};

export function getRotpunktLogoForTheme(resolvedTheme: "light" | "dark") {
  return resolvedTheme === "light"
    ? ROTPUNKT_LOGO_LIGHT_MODE
    : ROTPUNKT_LOGO_DARK_MODE;
}

function normalizeLogoPath(src: string): string {
  return src.split("#")[0].split("?")[0].toLowerCase();
}

function isRotpunktDefaultLogo(src: string): boolean {
  const normalized = normalizeLogoPath(src);
  return (
    normalized.endsWith(ROTPUNKT_FILENAME_DARK) ||
    normalized.endsWith(ROTPUNKT_FILENAME_LIGHT)
  );
}

export function resolveRotpunktLogoSrc(
  src: string | undefined,
  resolvedTheme: "light" | "dark",
  options: ResolveLogoOptions & { fallbackToThemeLogo: true }
): string;
export function resolveRotpunktLogoSrc(
  src: string | undefined,
  resolvedTheme: "light" | "dark",
  options: ResolveLogoOptions & { fallbackSrc: string }
): string;
export function resolveRotpunktLogoSrc(
  src: string | undefined,
  resolvedTheme: "light" | "dark",
  options?: ResolveLogoOptions
): string | undefined;
export function resolveRotpunktLogoSrc(
  src: string | undefined,
  resolvedTheme: "light" | "dark",
  options?: ResolveLogoOptions
) {
  const themedLogo = getRotpunktLogoForTheme(resolvedTheme);
  if (!src) {
    if (options?.fallbackSrc) return options.fallbackSrc;
    return options?.fallbackToThemeLogo ? themedLogo : undefined;
  }
  return isRotpunktDefaultLogo(src) ? themedLogo : src;
}

export function useRotpunktLogoSrc() {
  const { resolvedTheme } = useTheme();
  return getRotpunktLogoForTheme(resolvedTheme);
}

export function useThemeAwareRotpunktLogo(
  src: string | undefined,
  options: ResolveLogoOptions & { fallbackToThemeLogo: true }
): string;
export function useThemeAwareRotpunktLogo(
  src: string | undefined,
  options: ResolveLogoOptions & { fallbackSrc: string }
): string;
export function useThemeAwareRotpunktLogo(
  src?: string,
  options?: ResolveLogoOptions
): string | undefined;
export function useThemeAwareRotpunktLogo(
  src?: string,
  options?: ResolveLogoOptions
) {
  const { resolvedTheme } = useTheme();
  return resolveRotpunktLogoSrc(src, resolvedTheme, options);
}
