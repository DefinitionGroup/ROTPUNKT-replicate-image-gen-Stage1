"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export const ROTPUNKT_LOGO_DARK_MODE = "/rotpunkt-kuechen-logo.svg";
export const ROTPUNKT_LOGO_LIGHT_MODE = "/rotpunkt-kuechen-logo-dunkel.svg";

export function getRotpunktLogoForTheme(resolvedTheme: "light" | "dark") {
  return resolvedTheme === "light"
    ? ROTPUNKT_LOGO_LIGHT_MODE
    : ROTPUNKT_LOGO_DARK_MODE;
}

export function useRotpunktLogoSrc() {
  const { resolvedTheme } = useTheme();
  return getRotpunktLogoForTheme(resolvedTheme);
}
