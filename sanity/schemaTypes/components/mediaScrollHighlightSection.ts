import { defineType, defineField } from "sanity";
import { FaScroll } from "react-icons/fa6";

type UseVideoParent = { useVideo?: boolean } | undefined;

export default defineType({
  name: "mediaScrollHighlightSection",
  title: "Media + Scroll Highlight Section",
  type: "object",
  icon: FaScroll,
  fields: [
    defineField({
      name: "useVideo",
      title: "Use Video",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "backgroundImage",
      title: "Background Image (Cloudinary)",
      type: "cloudinary.asset",
      hidden: (ctx) => !!(ctx.parent as UseVideoParent)?.useVideo,
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const parent = ctx.parent as UseVideoParent;
          if (!parent?.useVideo && !val) return "Image is required when Use Video is OFF";
          return true;
        }),
    }),

    defineField({
      name: "backgroundVideo",
      title: "Background Video (Cloudinary)",
      type: "cloudinary.asset",
      description: "Provide a Cloudinary video when Use Video is ON.",
      hidden: (ctx) => !(ctx.parent as UseVideoParent)?.useVideo,
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const parent = ctx.parent as UseVideoParent;
          if (parent?.useVideo && !val) return "Video is required when Use Video is ON";
          return true;
        }),
    }),

    defineField({
      name: "imageAlt",
      title: "Background Alt Text",
      type: "string",
      description: "Improves accessibility",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "items",
      title: "Scroll Items",
      type: "array",
      of: [{ type: "scrollHighlightItem" }],
      validation: (Rule) => Rule.min(1),
    }),

    // defineField({
    //   name: "enableParallax",
    //   title: "Enable Parallax",
    //   type: "boolean",
    //   initialValue: true,
    // }),

    // defineField({
    //   name: "overlayOpacity",
    //   title: "Overlay Opacity",
    //   type: "number",
    //   initialValue: 0.5,
    //   description: "0.0 – 1.0 (black overlay strength)",
    //   validation: (Rule) => Rule.min(0).max(1),
    // }),

    defineField({
      name: "padY",
      title: "Vertical Padding",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
        ],
        layout: "radio",
      },
      initialValue: "lg",
    }),
  ],
  preview: {
    select: { media: "backgroundImage", useVideo: "useVideo", count: "items.length" },
    prepare({ media, useVideo, count }) {
      return {
        title: `Media + Scroll Highlight (${count ?? 0} items)`,
        subtitle: useVideo ? "Video background" : "Image background",
        media,
      };
    },
  },
});
