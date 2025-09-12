import { defineType, defineField } from "sanity";
import { FaRectangleList } from "react-icons/fa6";
export default defineType({
  name: "heroSection",
  title: "Hero Section",
  type: "object",
  icon: FaRectangleList,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(160),
    }),
    defineField({
      name: "subheadline",
      title: "Subtitle",
      type: "string",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),

    defineField({
      name: "backgroundImage",
      title: "Background Image (Cloudinary)",
      type: "cloudinary.asset", 
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "logoImageUrl",
      title: "Logo Image (Cloudinary) - Optional",
      type: "cloudinary.asset",
      description:
        "Optional override. If empty, the component defaults to /rotpunkt-kuechen-logo.svg",
    }),

    defineField({
      name: "backgroundAlt",
      title: "Background Image Alt Text (optional)",
      type: "string",
      description: "Improves accessibility; if omitted, the component uses subheadline.",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subheadline",
      media: "icon",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Hero Section",
        subtitle,
        media,
      };
    },
  },
});
