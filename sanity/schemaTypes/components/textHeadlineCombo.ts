import { defineType, defineField } from "sanity";
import { FaHeading } from "react-icons/fa6";

export default defineType({
  name: "textHeadlineCombo",
  title: "Text · Headline Combo",
  type: "object",
  icon: FaHeading,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the headline.",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(200),
    }),
    defineField({
      name: "highlight",
      title: "Highlight (appended)",
      type: "string",
      description: "Optional word appended with gradient styling.",
    }),
    defineField({
      name: "subhead",
      title: "Subhead",
      type: "text",
      rows: 3,
      description: "Supporting line below the headline.",
    }),

    // 👇 All styling options live inside one collapsible object
    defineField({
      name: "style",
      title: "Styles",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "align",
          title: "Alignment",
          type: "string",
          options: {
            list: [
              { title: "Left", value: "left" },
              { title: "Center", value: "center" },
              { title: "Right", value: "right" },
            ],
            layout: "radio",
          },
          initialValue: "left",
        }),
        defineField({
          name: "size",
          title: "Size",
          type: "string",
          options: {
            list: [
              { title: "XL", value: "xl" },
              { title: "LG", value: "lg" },
              { title: "MD", value: "md" },
              { title: "SM", value: "sm" },
            ],
            layout: "radio",
          },
          initialValue: "xl",
        }),
        defineField({
          name: "animate",
          title: "Animate",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "spacing",
          title: "Vertical Spacing",
          type: "string",
          options: {
            list: [
              { title: "Tight", value: "tight" },
              { title: "Normal", value: "normal" },
              { title: "Loose", value: "loose" },
            ],
            layout: "radio",
          },
          initialValue: "normal",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      eyebrow: "eyebrow",
      headline: "headline",
      highlight: "highlight",
      subhead: "subhead",
    },
    prepare({ eyebrow, headline, highlight, subhead }) {
      return {
        title: [eyebrow && `${eyebrow} —`, headline, highlight && highlight]
          .filter(Boolean)
          .join(" "),
        subtitle: subhead,
      };
    },
  },
});
