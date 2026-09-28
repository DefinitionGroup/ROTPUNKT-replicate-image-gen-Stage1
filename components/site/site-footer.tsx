import { BrandLogo } from "@/components/design-system/brand-logo";
import { Label } from "@/components/design-system/label";
import { Link } from "@/i18n/routing";
import type { LocaleContent } from "@/lib/content/types";

/** Hairline-topped foot: wordmark, link columns, a quiet note, the copyright line. */
export function SiteFooter({ footer }: { footer: LocaleContent["footer"] }) {
  return (
    <footer className="signature-container mt-24 border-t border-hairline pb-12 pt-8 md:mt-32 md:pt-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
        <BrandLogo compact />
        <div className="grid grid-cols-2 gap-6 md:flex md:gap-16">
          {footer.columns.map((column) => (
            <div className="flex flex-col gap-2.5" key={column.title}>
              <Label className="mb-1">{column.title}</Label>
              {column.links.map((link) =>
                link.external ? (
                  <a
                    className="inline-flex min-h-8 items-center text-[0.875rem] text-graphite transition-colors duration-state ease-signature hover:text-porcelain"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    className="inline-flex min-h-8 items-center text-[0.875rem] text-graphite transition-colors duration-state ease-signature hover:text-porcelain"
                    href={link.href}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
        {footer.note && <Label>{footer.note}</Label>}
      </div>
      <p className="m-0 mt-10 text-caption text-ash">{footer.copyright}</p>
    </footer>
  );
}
