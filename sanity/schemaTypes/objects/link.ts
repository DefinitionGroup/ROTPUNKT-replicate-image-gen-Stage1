import { defineType, defineField } from "sanity";

type LinkParent = { linkType?: "internal" | "external" } | undefined;

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      options: {
        list: [
          { title: "Internal page", value: "internal" },
          { title: "External URL", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "page",
      title: "Page",
      type: "reference",
      to: [{ type: "page" }],
      hidden: (ctx) => (ctx.parent as LinkParent)?.linkType !== "internal",
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const t = (ctx.parent as LinkParent)?.linkType;
          if (t === "internal" && !val) return "Select a page for an internal link.";
          return true;
        }),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      hidden: (ctx) => (ctx.parent as LinkParent)?.linkType !== "external",
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const t = (ctx.parent as LinkParent)?.linkType;
          if (t === "external" && !val) return "Provide a URL for an external link.";
          return true;
        }),
    }),
  ],
  preview: {
    select: { linkType: "linkType", pageTitle: "page.title", url: "externalUrl" },
    prepare({ linkType, pageTitle, url }) {
      return {
        title:
          linkType === "internal"
            ? `Internal: ${pageTitle ?? "Select a page"}`
            : `External: ${url ?? "Set URL"}`,
      };
    },
  },
});
