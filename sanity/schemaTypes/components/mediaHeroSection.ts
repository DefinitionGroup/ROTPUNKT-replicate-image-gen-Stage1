import { defineType, defineField } from "sanity";
import { FaImage } from "react-icons/fa6";

type UseVideoParent = { useVideo?: boolean } | undefined;

export default defineType({
  name: "mediaHeroSection",
  title: "Media Hero Section",
  type: "object",
  icon: FaImage,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(160),
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
      validation: (Rule) => Rule.max(200),
    }),

    defineField({
      name: "useVideo",
      title: "Use Video",
      type: "boolean",
      initialValue: false,
    }),

    // IMAGE (shown when NOT using video)
    defineField({
      name: "backgroundImage",
      title: "Background Image (Cloudinary)",
      type: "cloudinary.asset",
      hidden: (ctx) => {
        const parent = ctx.parent as UseVideoParent;
        return !!parent?.useVideo;
      },
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const parent = ctx?.parent as UseVideoParent;
          if (!parent?.useVideo && !val) {
            return "Image is required when Use Video is OFF";
          }
          return true;
        }),
    }),

    // VIDEO (shown when using video)
    defineField({
      name: "backgroundVideo",
      title: "Background Video (Cloudinary)",
      type: "cloudinary.asset",
      description: "Provide a Cloudinary video when Use Video is ON.",
      hidden: (ctx) => {
        const parent = ctx.parent as UseVideoParent;
        return !parent?.useVideo;
      },
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const parent = ctx?.parent as UseVideoParent;
          if (parent?.useVideo && !val) {
            return "Video is required when Use Video is ON";
          }
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
      name: "additionalContent",
      title: "Additional Content",
      type: "array",
      of: [{ type: "cta" }, { type: "richText" }],
      description: "Optional additional content such as buttons or rich text",
      validation: (Rule) => Rule.max(3),
    }),

    // defineField({
    //   name: "overlayOpacity",
    //   title: "Overlay Opacity",
    //   type: "number",
    //   initialValue: 0.5,
    //   description: "0.0 – 1.0 (black overlay strength)",
    //   validation: (Rule) => Rule.min(0).max(1),
    // }),

    // defineField({
    //   name: "animation",
    //   title: "Staggered Slide-Up",
    //   type: "object",
    //   options: { collapsible: true, collapsed: true },
    //   fields: [
    //     defineField({ name: "delay", type: "number", initialValue: 0.1 }),
    //     defineField({ name: "staggerDelay", type: "number", initialValue: 0.1 }),
    //     defineField({ name: "duration", type: "number", initialValue: 0.5 }),
    //     defineField({ name: "distance", type: "number", initialValue: 80 }),
    //   ],
    // }),
  ],
  preview: {
    select: {
      title: "heading",
      subtitle: "subheading",
      media: "backgroundImage",
    },
    prepare({ title, subtitle, media }) {
      return { title: title || "Media Hero Section", subtitle, media };
    },
  },
});
