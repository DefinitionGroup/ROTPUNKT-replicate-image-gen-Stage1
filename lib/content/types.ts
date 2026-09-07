import type { Locale } from "@/i18n/config";

export type ContentLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type WordToken = { text: string; serif?: boolean };

export type HeroContent = {
  eyebrow?: string;
  /** Headline; the one serif word is marked *like this*. */
  title: string;
  subline: string;
  cta: ContentLink;
  filmLabel?: string;
  badge?: string;
  video: { src: string; poster?: string };
};

export type ManifestContent = {
  label?: string;
  statement: WordToken[];
  paragraphs: string[];
  image: string;
  alt: string;
  caption?: string;
  cta?: ContentLink;
};

export type PromiseItem = {
  id: string;
  label: string;
  title: string;
  body: string;
  detail: string[];
};

export type PromisesContent = {
  label?: string;
  title: string;
  intro: string;
  items: PromiseItem[];
  cta?: ContentLink;
};

export type GalleryItem = {
  title: string;
  description?: string;
  image: string;
  alt?: string;
};

export type GalleryContent = {
  label?: string;
  title: string;
  intro?: string;
  items: GalleryItem[];
  cta?: ContentLink;
};

export type StudioStage = { id: string; label: string; title: string; body: string };
export type StudioStep = { label: string; title: string; body: string };

export type StudioTeaserContent = {
  label?: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  stages: StudioStage[];
  steps: StudioStep[];
  cta: ContentLink;
  explainerLabel: string;
  explainerTitle: string;
  explainerIntro: string;
  note?: string;
};

export type ClosingContent = {
  title: string;
  body: string;
  cta: ContentLink;
};

export type HomeContent = {
  hero: HeroContent;
  manifest?: ManifestContent;
  promises?: PromisesContent;
  gallery?: GalleryContent;
  studio?: StudioTeaserContent;
  closing?: ClosingContent;
};

export type AboutCard = {
  title: string;
  description?: string;
  body: string;
  image: string;
  alt?: string;
  cta?: ContentLink;
};

export type PageContent = {
  slug: string;
  title: string;
  kind: "about" | "legal";
  /** Slug of the same page in other locales, for the language switcher. */
  translations?: Partial<Record<Locale, string>>;
  hero?: {
    heading: string;
    subheading?: string;
    video?: string;
    image?: string;
    alt?: string;
  };
  headline?: {
    eyebrow?: string;
    headline: string;
    subhead?: string;
  };
  cards?: AboutCard[];
  /** Long-form text (legal pages) as markdown ... */
  markdown?: string;
  /** ... or, from Sanity, as Portable Text blocks. */
  portableText?: unknown[];
};

export type LocaleContent = {
  locale: Locale;
  nav: { items: ContentLink[]; cta: ContentLink };
  footer: {
    columns: { title: string; links: ContentLink[] }[];
    copyright: string;
    note?: string;
  };
  home: HomeContent;
  pages: Record<string, PageContent>;
};

export type SiteContent = Record<Locale, LocaleContent>;
