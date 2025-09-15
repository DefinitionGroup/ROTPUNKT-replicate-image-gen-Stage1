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
