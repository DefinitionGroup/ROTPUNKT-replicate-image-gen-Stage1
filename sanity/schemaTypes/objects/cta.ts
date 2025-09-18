import { defineType, defineField } from "sanity";

export default defineType({
  name: "cta",
  title: "CTA",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(80),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      validation: (Rule) => Rule.required(),
    }),
    // Added variant selector to mirror button component variants
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Destructive", value: "destructive" },
          { title: "Outline", value: "outline" },
          { title: "Secondary", value: "secondary" },
          { title: "Ghost", value: "ghost" },
          { title: "Link", value: "link" },
          { title: "Red", value: "red" },
          { title: "Red CTA", value: "redCta" },
          { title: "Red Outline", value: "redOutline" },
          { title: "Close", value: "close" },
          { title: "Wizard Option", value: "wizardOption" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    // Added size selector to mirror button component sizes
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Small", value: "sm" },
          { title: "Large", value: "lg" },
          { title: "Icon", value: "icon" },
          { title: "Red (project)", value: "red" },
          { title: "CTA (project)", value: "cta" },
          { title: "Back (project)", value: "back" },
          { title: "Close (project)", value: "close" },
          { title: "Wizard Option (project)", value: "wizardOption" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      text: "text",
      linkType: "link.linkType",
      pageTitle: "link.page.title",
      url: "link.externalUrl",
      variant: "variant",
      size: "size",
    },
    prepare({ text, linkType, pageTitle, url, variant, size }) {
      const dest =
        linkType === "internal" ? pageTitle ?? "Page" : url ?? "URL";
      const variantLabel = variant ? ` (${variant})` : "";
      const sizeLabel = size ? ` [${size}]` : "";
      return { title: text ?? "CTA", subtitle: `${dest}${variantLabel}${sizeLabel}` };
    },
  },
});
