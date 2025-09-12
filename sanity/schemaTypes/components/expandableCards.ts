import { defineType, defineField } from "sanity";
import { FaLayerGroup } from "react-icons/fa6";

export default defineType({
  name: "expandableCards",
  title: "Expandable Cards Section",
  type: "object",
  icon: FaLayerGroup,
  fields: [
    defineField({
      name: "items",
      title: "Cards",
      type: "array",
      of: [{ type: "expandableCardItem" }],
      validation: (Rule) => Rule.min(1),
    }),
    
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: `Expandable Cards (${count} items)`,
      };
    },
  },
});
