import { defineQuery } from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  ...,
  content[]{
    ...
  }
}`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == "home"][0]{
  ...,
  content[]{
    ...
  }
}`);

export const NAVBAR_QUERY = defineQuery(`
*[_type == "menu" && menuType == "navbar"][0]{
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

export const FOOTER_QUERY = defineQuery(`
*[_type == "menu" && menuType == "footer"][0]{
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
