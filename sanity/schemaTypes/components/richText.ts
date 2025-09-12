import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'richText',
  title: 'Rich Text',
  type: 'object',
  icon: DocumentTextIcon,

  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'contentBlock' }],
    }),
  ],
  preview: {
    select: { },
    prepare() {
      return { title: 'Rich Text' }
    },
  },
})
