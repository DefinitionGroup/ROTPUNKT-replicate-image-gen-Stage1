import "server-only";
import type { Locale } from "@/i18n/config";
import { sanityFetch } from "@/sanity/lib/live";
import { FOOTER_QUERY, HOME_PAGE_QUERY, NAVBAR_QUERY, PAGE_QUERY } from "@/sanity/lib/queries";
import type { ContentLink, HomeContent, LocaleContent, PageContent } from "./types";

/** The hero film is not in the CMS yet; until it is, every locale plays this loop. */
export const HERO_FILM_SRC = "/video/hero-loop.mp4";
export const HERO_POSTER_SRC = "/video/hero-poster.jpg";

type SanityLink = {
  label?: string;
  linkType?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
  resolvedSlug?: string;
  translatedSlug?: string;
};

function toLink(link: SanityLink): ContentLink | null {
  if (!link?.label) return null;
  if (link.linkType === "external" && link.externalUrl) {
    return { label: link.label, href: link.externalUrl, external: true };
  }
  const slug = link.translatedSlug ?? link.resolvedSlug;
  if (!slug) return null;
  const isHome = slug === "home" || slug === "home-en";
  return { label: link.label, href: isHome ? "/" : `/${slug}` };
}

type Block = Record<string, unknown> & { _type: string };

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function assetUrl(asset: unknown): string | undefined {
  return asString((asset as { secure_url?: unknown } | undefined)?.secure_url);
}

/** Maps the blocks the CMS has today onto the content model; missing sections stay undefined. */
function homeFromBlocks(blocks: Block[], locale: Locale, studioLabel: string): HomeContent | null {
  const header = blocks.find((b) => b._type === "header");
  const ticker = blocks.find((b) => b._type === "tickerGallery");
  if (!header) return null;
  const home: HomeContent = {
    hero: {
      title: asString(header.title) ?? "Rotpunkt Visions",
      eyebrow: asString(header.subheadline),
      subline: asString(header.description) ?? "",
      cta: { label: studioLabel, href: "/studio" },
      video: { src: HERO_FILM_SRC, poster: assetUrl(header.backgroundImage) ?? HERO_POSTER_SRC },
    },
  };
  const items = Array.isArray(ticker?.tickerItems) ? (ticker!.tickerItems as Block[]) : [];
  if (items.length > 0) {
    home.gallery = {
      title: asString(ticker?.name) ?? (locale === "de" ? "Inspirationen" : "Inspirations"),
      items: items
        .map((item) => ({
          title: asString(item.title) ?? "",
          description: asString(item.description),
          image: assetUrl(item.imageCloudinary) ?? "",
          alt: asString(item.title),
        }))
        .filter((item) => item.image),
    };
  }
  return home;
}

function pageFromBlocks(slug: string, title: string, blocks: Block[], translations: PageContent["translations"]): PageContent {
  const rich = blocks.find((b) => b._type === "richText");
  if (rich && blocks.length === 1) {
    return { slug, title, kind: "legal", translations, portableText: rich.content as unknown[] };
  }
  const hero = blocks.find((b) => b._type === "mediaHeroSection");
  const headline = blocks.find((b) => b._type === "textHeadlineCombo");
  const cards = blocks.find((b) => b._type === "expandableCards");
  return {
    slug,
    title,
    kind: "about",
    translations,
    hero: hero
      ? {
          heading: asString(hero.heading) ?? title,
          subheading: asString(hero.subheading),
          video: hero.useVideo ? assetUrl(hero.backgroundVideo) : undefined,
          image: assetUrl(hero.backgroundImage),
          alt: asString(hero.imageAlt),
        }
      : undefined,
    headline: headline
      ? {
          eyebrow: asString(headline.eyebrow),
          headline: [asString(headline.headline), asString(headline.highlight) ? `*${asString(headline.highlight)}*` : ""]
            .filter(Boolean)
            .join(" "),
          subhead: asString(headline.subhead),
        }
      : undefined,
    cards: Array.isArray(cards?.items)
      ? (cards!.items as Block[]).map((item) => ({
          title: asString(item.title) ?? "",
          description: asString(item.description),
          body: Array.isArray(item.body)
            ? (item.body as Array<{ children?: Array<{ text?: string }> }>)
                .map((block) => (block.children ?? []).map((c) => c.text ?? "").join(""))
                .join("\n\n")
            : "",
          image: assetUrl(item.image) ?? "",
          alt: asString(item.title),
        }))
      : undefined,
  };
}

function translationsOf(page: { translations?: Array<{ language?: string; slug?: string } | null> }) {
  const result: PageContent["translations"] = {};
  for (const entry of page.translations ?? []) {
    if (entry?.language && entry.slug) result[entry.language as Locale] = entry.slug;
  }
  return result;
}

export async function loadLocaleFromSanity(locale: Locale, studioLabel: string): Promise<LocaleContent> {
  const [{ data: navbar }, { data: footer }, { data: homePage }] = await Promise.all([
    sanityFetch({ query: NAVBAR_QUERY, params: { locale } }),
    sanityFetch({ query: FOOTER_QUERY, params: { locale } }),
    sanityFetch({ query: HOME_PAGE_QUERY, params: { locale } }),
  ]);

  const navItems = ((navbar?.menuItems ?? []) as SanityLink[])
    .map((link) => toLink(link))
    .filter((link): link is ContentLink => Boolean(link));
  const footerColumns = ((footer?.footerColumns ?? []) as Array<{ title?: string; links?: SanityLink[] }>).map(
    (column) => ({
      title: column.title ?? "",
      links: (column.links ?? []).map((l) => toLink(l)).filter((l): l is ContentLink => Boolean(l)),
    })
  );

  const home = homeFromBlocks((homePage?.content ?? []) as Block[], locale, studioLabel) ?? {
    hero: {
      title: "Rotpunkt Visions",
      subline: "",
      cta: { label: studioLabel, href: "/studio" },
      video: { src: HERO_FILM_SRC, poster: HERO_POSTER_SRC },
    },
  };

  return {
    locale,
    nav: { items: navItems, cta: { label: studioLabel, href: "/studio" } },
    footer: {
      columns: footerColumns,
      copyright: footer?.footerCopyright ?? `${new Date().getFullYear()} © Rotpunkt Küchen`,
      note: footer?.footerNote ?? undefined,
    },
    home,
    pages: {},
  };
}

export async function loadPageFromSanity(locale: Locale, slug: string): Promise<PageContent | null> {
  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug, locale } });
  if (!page?.content) return null;
  return pageFromBlocks(slug, page.title ?? slug, page.content as Block[], translationsOf(page));
}
