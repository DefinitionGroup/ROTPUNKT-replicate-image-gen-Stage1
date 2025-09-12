import { defineField, defineType } from 'sanity'

export const tickerItem = defineType({
  name: 'tickerItem',
  title: 'Ticker Item',
  type: 'object',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Use a short, descriptive title that helps distinguish this image in lists and previews.',
      validation: rule =>
        rule
          .required()
          .min(2)
          .max(120)
          .error('A short, descriptive title (2–120 characters) is required'),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'imageCloudinary',
      title: 'Image (Cloudinary)',
      type: 'cloudinary.asset',
      validation: rule =>
        rule
          .required()
          .error('Please add a Cloudinary image before publishing')
          .info('Store the original artwork here. Variants (size/format) will be generated at render time with Cloudinary transformations.'),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'imageCloudinary.url',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection as { title: string, subtitle: string, media: string }
      return {
        title,
        subtitle: subtitle?.length > 90 ? `${subtitle.slice(0, 90)}…` : subtitle,
        media: (<img src={media} alt={subtitle} />),
      }
    },
  },
})
