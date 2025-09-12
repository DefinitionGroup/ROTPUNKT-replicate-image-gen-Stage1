// schemaTypes/components/BlockComponent.ts
import { LaunchIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Content Block (type: 'block')
 * A reusable Portable Text block definition. Use it inside an array field:
 *
 * defineField({
 *   name: 'content',
 *   title: 'Content',
 *   type: 'array',
 *   of: [{ type: 'contentBlock' }],
 * })
 */
export default defineType({
  name: 'contentBlock',
  title: 'Content Block',
  type: 'block',

  // Available block styles (headings, quotes, etc.)
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'H4', value: 'h4' },
    { title: 'Quote', value: 'blockquote' },
  ],

  // Lists users can create
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],

  // Inline marks: decorators and annotations
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Underline', value: 'underline' },
      { title: 'Strike', value: 'strike-through' },
      { title: 'Code', value: 'code' },
    ],
    annotations: [
      {
        name: 'link',
        title: 'External Link',
        type: 'object',
        icon: LaunchIcon,
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: Rule =>
              Rule.uri({
                allowRelative: false,
                scheme: ['http', 'https', 'mailto', 'tel'],
              }).required(),
          }),
          defineField({
            name: 'openInNewTab',
            title: 'Open in new tab',
            type: 'boolean',
            initialValue: true,
          }),
          defineField({
            name: 'nofollow',
            title: 'Nofollow',
            type: 'boolean',
            initialValue: false,
          }),
        ],
      },
      {
        name: 'internalLink',
        title: 'Internal Link',
        type: 'object',
        fields: [
          defineField({
            name: 'reference',
            title: 'Reference',
            type: 'reference',
            to: [{ type: 'page' }],
            weak: true,
          }),
        ],
      },
    ],
  },
})
