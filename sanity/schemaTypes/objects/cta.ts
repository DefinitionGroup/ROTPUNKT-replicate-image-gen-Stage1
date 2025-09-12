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
  ],
  preview: {
    select: {
      text: "text",
      linkType: "link.linkType",
      pageTitle: "link.page.title",
      url: "link.externalUrl",
    },
    prepare({ text, linkType, pageTitle, url }) {
      const dest =
        linkType === "internal"
          ? pageTitle ?? "Page"
          : url ?? "URL";
      return { title: text ?? "CTA", subtitle: dest };
    },
  },
});
