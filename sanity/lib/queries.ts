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

export const NAVBAR_QUERY = defineQuery(`*[_type == "menu" && menuType == "navbar"][0]`)
