import type { NavbarMenuItemProjected } from "@/sanity/sanity.types";

export const internalHref = (item?: NavbarMenuItemProjected): string => {
  if (!item || item.linkType !== "internal") return "/";
  const s = item.slug?.trim();
  if (!s) return "/";
  return s === "home" ? "/" : `/${s}`;
};
