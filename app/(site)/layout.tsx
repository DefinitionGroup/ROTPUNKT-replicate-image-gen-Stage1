import type { Metadata } from "next";
import "../globals.css";

// This layout is now just a passthrough for the [locale] routes
// The actual layout logic is in [locale]/layout.tsx

export const metadata: Metadata = {
  title: "Rotpunkt Küchen AI Image Generator",
  description: "Generate your dream kitchen images with AI",
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
