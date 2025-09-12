import { defineType, defineField } from "sanity";

export default defineType({
  name: "expandableCardItem",
  title: "Expandable Card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image (Cloudinary)",
      type: "cloudinary.asset",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt",
      type: "string",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "logo",
      title: "Logo (Cloudinary, optional)",
      type: "cloudinary.asset",
    }),
    defineField({
      name: "ctaButton",
      title: "CTA",
      type: "cta",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      description: "Content shown in the expanded modal.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      subtitle: "description",
    },
  },
});
