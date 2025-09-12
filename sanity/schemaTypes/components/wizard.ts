import { SparklesIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const wizard = defineType({
  name: 'wizard',
  title: 'Wizard',
  type: 'object',
  icon: SparklesIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Wizard',
    }),
  ],
})
