"use client";

import Link from "next/link";
import React from "react";
import { useRotpunktLogoSrc } from "@/components/theme/useRotpunktLogo";

type LinkItem = {
  label: string;
  linkType: "internal" | "external" | "anchor";
  slug?: string;
  externalUrl?: string;
  anchor?: string;
  openInNewTab?: boolean;
};

type FooterColumn = {
  title: string;
  links?: LinkItem[];
};

type FooterData = {
  footerColumns?: FooterColumn[];
  footerCopyright?: string;
  footerNote?: string;
  footerLogo?: {
    secure_url?: string;
    secureUrl?: string;
    url?: string;
    original_url?: string;
    path?: string;
    asset?: {
      secure_url?: string;
      url?: string;
    };
  };
  footerLogoAlt?: string;
};

export default function Footer({
  data,
  currentLocale,
}: {
  data?: FooterData;
  currentLocale?: string;
}) {
  const logoUrl = useRotpunktLogoSrc();

  if (!data) return null;

  const {
    footerColumns = [],
    footerCopyright,
    footerNote,
    footerLogoAlt,
  } = data;

  const hrefFor = (link: LinkItem) => {
    if (link.linkType === "internal" && link.slug) {
      const prefix = currentLocale ? `/${currentLocale}` : "";
      return `${prefix}/${link.slug}`.replace(/\/\/+/g, "/");
    }
    if (link.linkType === "anchor" && link.anchor) return `#${link.anchor}`;
    if (link.linkType === "external" && link.externalUrl)
      return link.externalUrl;
    return "#";
  };

  return (
    <footer className="bg-background text-muted-foreground selection:bg-brand-primary-2 selection:text-brand-secondary-1">
      <div className="mx-auto px-6 lg:px-8 py-16 sm:py-24 lg:py-32 max-w-7xl">
        <div className="xl:gap-8 border-border/70 xl:grid xl:grid-cols-3 mt-8 pt-8 border-t">
          <div className="px-4 py-2">
            <Link href="/" aria-label="Rotpunkt Küchen">
              <img
                src={logoUrl}
                alt={footerLogoAlt ?? "Rotpunkt Küchen"}
                className="w-20 sm:w-22 md:w-24 lg:w-28 h-auto inline-block"
              />
            </Link>

            {footerNote ? (
              <p className="mt-6 text-sm text-muted-foreground max-w-xs">
                {footerNote}
              </p>
            ) : null}
          </div>

          {/* Columns */}
          <div className="gap-8 grid grid-cols-1 xl:col-span-2 mt-6 xl:mt-0 px-4">
            <div className="md:gap-8 md:grid md:grid-cols-4">
              {footerColumns.map((column, index) => (
                <div key={index} className={index > 0 ? "mt-8 md:mt-0" : ""}>
                  <h3 className="font-semibold text-sm text-foreground">
                    {column.title}
                  </h3>
                  <ul role="list" className="space-y-4 mt-6">
                    {column.links?.map((link, linkIndex: number) => {
                      const href = hrefFor(link);
                      const isExternal = link.linkType === "external";
                      const target =
                        isExternal && link.openInNewTab ? "_blank" : undefined;
                      const rel = target ? "noopener noreferrer" : undefined;

                      return (
                        <li key={linkIndex}>
                          <Link
                            href={href}
                            target={target}
                            rel={rel}
                            className="text-muted-foreground text-sm hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:flex md:justify-between md:items-center border-border/70 mt-12 pt-8 border-t">
          <div className="mt-6 md:mt-0 text-muted-foreground text-sm">
            {footerCopyright ? (
              <span>&copy; {footerCopyright}</span>
            ) : (
              <span>&copy; {new Date().getFullYear()} Rotpunkt Küchen</span>
            )}
          </div>


        </div>
      </div>
    </footer>
  );
}
