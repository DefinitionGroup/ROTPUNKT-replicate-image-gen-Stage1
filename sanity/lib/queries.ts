import { defineQuery } from "next-sanity";

// Page query with optional language filter
// Falls back to any document if no language-specific version exists
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && (language == $locale || !defined(language))][0]{
  ...,
  content[]{
    ...
  }
}`);

// Home page query with optional language filter
export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == "home" && (language == $locale || !defined(language))][0]{
  ...,
  content[]{
    ...
  }
}`);

// Navbar query with optional language filter
export const NAVBAR_QUERY = defineQuery(`
*[_type == "menu" && menuType == "navbar" && (language == $locale || !defined(language))][0]{
  navbarLogo,
  // projected direct URL (use secure_url when available)
  "navbarLogoUrl": navbarLogo.secure_url,
  navbarLogoAlt,
  menuItems[]{
    _key,
    label,
    linkType,
    "slug": select(linkType == "internal" => page->slug.current),
    externalUrl,
    anchor,
    openInNewTab
  }
}
`);

// Footer query with optional language filter
export const FOOTER_QUERY = defineQuery(`
*[_type == "menu" && menuType == "footer" && (language == $locale || !defined(language))][0]{
  footerLogo,
  // projected direct URL (use secure_url when available)
  "footerLogoUrl": footerLogo.secure_url,
  footerLogoAlt,
  footerColumns[]{
    title,
    links[]{
      label,
      linkType,
      "slug": select(linkType == "internal" => page->slug.current),
      externalUrl,
      anchor,
      openInNewTab
    }
  },
  footerCopyright,
  footerNote
}
`);
