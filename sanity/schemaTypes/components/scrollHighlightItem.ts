import { defineType, defineField } from "sanity";

export default defineType({
  name: "scrollHighlightItem",
  title: "Scroll Highlight Item",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "text",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().min(2),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "text" },
  },
});
