import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/ui/navbar";
import { sanityFetch } from "@/sanity/lib/live";
import { NAVBAR_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Rotpunkt Küchen AI Image Generator",
  description: "Generate your dream kitchen images with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: navbar } = await sanityFetch({
    query: NAVBAR_QUERY,
  });

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          {navbar && <Navbar {...navbar} />}

          {children}
        </Providers>
      </body>
    </html>
  );
}
