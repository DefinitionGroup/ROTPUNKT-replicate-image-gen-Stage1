import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rotpunkt Visions",
  description: "Ihre Rotpunkt Küche, visualisiert: konfigurieren, erzeugen, geprüft ansehen.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

/*
 * DESIGN CONTRACT — rotpunkt-visions.de redesign, 3 September 2026
 * THESIS: the film is the fold; the configurator is the product. One black stage,
 *   one red action per view, one italic serif word per headline. No cards in the hero.
 * OWN-WORLD: black canvas, charcoal planes, hairline strokes, graphite copy, white
 *   structure, signature red #E30613; Manrope 300/400/500 + Instrument Serif italic;
 *   pills and 10 px cards; frosted glass badges; one easing, four durations.
 * STORY: a kitchen buyer sees the hands-on film, reads one sentence, understands the
 *   promise (real Rotpunkt material, verified images) and steps into /studio.
 * FIRST VIEWPORT: full-bleed looping film under a gradient, headline bottom-left,
 *   primary pill "Küche visualisieren" beside "Den Film ansehen", glass badge right.
 * FORM: shared with rotpunkt Signature (RDDOT-3Dwebsite) and the Refero "Sequel"
 *   reference; direction pinned by the brief, no concept roll.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
 *   review, the verdict, and DESIGN.md.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" data-scroll-behavior="smooth" lang="de" suppressHydrationWarning>
      <head>
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          strategy="beforeInteractive"
          data-cbid="3dadf7ea-3074-4369-9ff3-fa95a8cb52c2"
          data-blockingmode="auto"
          type="text/javascript"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
