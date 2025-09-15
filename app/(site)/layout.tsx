import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/Footer";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { NAVBAR_QUERY, FOOTER_QUERY } from "@/sanity/lib/queries";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";

export const metadata: Metadata = {
  title: "Rotpunkt Küchen AI Image Generator",
  description: "Generate your dream kitchen images with AI",
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const { data: navbar } = await sanityFetch({ query: NAVBAR_QUERY });
  const { data: footer } = await sanityFetch({ query: FOOTER_QUERY });

  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {navbar && <Navbar {...navbar} />}
          {children}
          {footer && <Footer data={footer} />}
        </Providers>

        <SanityLive />

        {isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
