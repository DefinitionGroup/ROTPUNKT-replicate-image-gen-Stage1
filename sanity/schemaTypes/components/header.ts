import { BlockElementIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const header = defineType({
  name: 'header',
  title: 'Header',
  type: 'object',
  icon: BlockElementIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule =>
        rule
          .required()
          .min(2)
          .max(120)
          .error('A short, descriptive title (2–120 characters) is required'),
    }),

    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'backgroundImage',
      title: 'Background Image (Cloudinary)',
      type: 'cloudinary.asset',
      validation: rule =>
        rule
          .required()
          .error('Please add a Cloudinary image before publishing')
          .info('Store the original artwork here. Variants (size/format) will be generated at render time with Cloudinary transformations.'),
    }),
  ],
})
