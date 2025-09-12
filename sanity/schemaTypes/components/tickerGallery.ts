import { ImagesIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const tickerGallery = defineType({
  name: 'tickerGallery',
  title: 'Ticker Gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Internal name to identify this gallery in Studio and queries.',
      validation: rule =>
        rule.required().error('Give this gallery a clear name (e.g., “Homepage Hero”)'),
    }),

    defineField({
      name: 'tickerItems',
      title: 'Ticker Items',
      type: 'array',
      of: [
        defineArrayMember({ type: 'tickerItem' }),
      ],
      description: 'Ordered list of images to display. Drag to reorder.',
      validation: rule =>
        rule
          .required()
          .min(1)
          .error('Add at least one image to this gallery'),

    }),
  ],
})
