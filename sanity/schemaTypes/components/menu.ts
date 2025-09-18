/* eslint-disable ts/no-unsafe-member-access */
import { MenuIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  icon: MenuIcon,

  fields: [
    defineField({
      name: 'menuType',
      title: 'Menu Type',
      type: 'string',
      options: {
        list: [
          { title: 'Navbar', value: 'navbar' },
          { title: 'Footer', value: 'footer' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),

    // Added: logo for navbar
    defineField({
      name: 'navbarLogo',
      title: 'Navbar Logo (Cloudinary)',
      type: 'cloudinary.asset',
      description: 'Optional logo used in the navbar (leave empty to use default).',
      hidden: ({ document }) => document?.menuType !== 'navbar',
    }),
    defineField({
      name: 'navbarLogoAlt',
      title: 'Navbar Logo Alt Text',
      type: 'string',
      description: 'Alt text for the navbar logo (accessibility).',
      hidden: ({ document }) => document?.menuType !== 'navbar',
      validation: Rule => Rule.max(160),
    }),

    // NAVBAR FIELDS
    defineField({
      name: 'menuItems',
      title: 'Navbar Items',
      type: 'array',
      of: [
        defineField({
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External URL', value: 'external' },
                  { title: 'Anchor/Section', value: 'anchor' },
                ],
                layout: 'radio',
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'page',
              title: 'Page',
              type: 'reference',
              to: [{ type: 'page' }],
              hidden: ({ parent }) => parent?.linkType !== 'internal',
            }),
            defineField({
              name: 'externalUrl',
              title: 'External URL',
              type: 'url',
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
            defineField({
              name: 'anchor',
              title: 'Anchor ID',
              type: 'string',
              hidden: ({ parent }) => parent?.linkType !== 'anchor',
            }),
            defineField({
              name: 'openInNewTab',
              title: 'Open in new tab?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              linkType: 'linkType',
              pageTitle: 'page.title',
              externalUrl: 'externalUrl',
              anchor: 'anchor',
            },
            prepare(value) {
              const { title, linkType, pageTitle, externalUrl, anchor } = value as {
                title: string
                linkType: string
                pageTitle: string
                externalUrl?: string
                anchor?: string
              }

              let subtitle = ''
              if (linkType === 'internal') {
                subtitle = `Page: ${pageTitle || ''}`
              }
              if (linkType === 'external') subtitle = externalUrl!
              if (linkType === 'anchor') subtitle = `#${anchor}`
              return {
                title,
                subtitle,
                media: () => '🔗',
              }
            },
          },
        }),
      ],
      hidden: ({ document }) => document?.menuType !== 'navbar',
    }),

    // FOOTER FIELDS
    // Added: logo for footer
    defineField({
      name: 'footerLogo',
      title: 'Footer Logo (Cloudinary)',
      type: 'cloudinary.asset',
      description: 'Optional logo used in the footer (leave empty to use default).',
      hidden: ({ document }) => document?.menuType !== 'footer',
    }),
    defineField({
      name: 'footerLogoAlt',
      title: 'Footer Logo Alt Text',
      type: 'string',
      description: 'Alt text for the footer logo (accessibility).',
      hidden: ({ document }) => document?.menuType !== 'footer',
      validation: Rule => Rule.max(160),
    }),

    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        defineField({
          name: 'footerColumn',
          title: 'Footer Column',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineField({
                  name: 'link',
                  title: 'Link',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: Rule => Rule.required(),
                    }),
                    defineField({
                      name: 'linkType',
                      title: 'Link Type',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Internal Page', value: 'internal' },
                          { title: 'External URL', value: 'external' },
                          { title: 'Anchor/Section', value: 'anchor' },
                        ],
                        layout: 'radio',
                      },
                      validation: Rule => Rule.required(),
                    }),
                    defineField({
                      name: 'page',
                      title: 'Page',
                      type: 'reference',
                      to: [{ type: 'page' }],
                      hidden: ({ parent }) => parent?.linkType !== 'internal',
                    }),
                    defineField({
                      name: 'externalUrl',
                      title: 'External URL',
                      type: 'url',
                      hidden: ({ parent }) => parent?.linkType !== 'external',
                    }),
                    defineField({
                      name: 'anchor',
                      title: 'Anchor ID',
                      type: 'string',
                      hidden: ({ parent }) => parent?.linkType !== 'anchor',
                    }),
                    defineField({
                      name: 'openInNewTab',
                      title: 'Open in new tab?',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      linkType: 'linkType',
                      pageTitle: 'page.title',
                      externalUrl: 'externalUrl',
                      anchor: 'anchor',
                    },
                    prepare(value) {
                      const { title, linkType, pageTitle, externalUrl, anchor } = value as {
                        title: string
                        linkType: string
                        pageTitle: string
                        externalUrl?: string
                        anchor?: string
                      }

                      let subtitle = ''
                      if (linkType === 'internal') {
                        subtitle = `Page: ${pageTitle || ''}`
                      }
                      if (linkType === 'external') subtitle = externalUrl!
                      if (linkType === 'anchor') subtitle = `#${anchor}`

                      return {
                        title,
                        subtitle,
                        media: () => '🔗',
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              linkCount: 'links.length',
            },
            prepare(value) {
              const { title, linkCount } = value as { title: string, linkCount?: number }
              return {
                title,
                subtitle: `${linkCount ?? 0} links`,
                media: () => '📂',
              }
            },
          },
        }),
      ],
      hidden: ({ parent }) => parent?.menuType !== 'footer',
    }),

    // FOOTER COPYRIGHT TEXT
    defineField({
      name: 'footerCopyright',
      title: 'Footer Copyright',
      type: 'string',
      hidden: ({ document }) => document?.menuType !== 'footer',
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'text',
      hidden: ({ document }) => document?.menuType !== 'footer',
    }),
  ],
  preview: {
    select: { menuType: 'menuType' },
    prepare({ menuType }) {
      return {
        title: menuType === 'navbar' ? 'Navbar Menu' : 'Footer Menu',
      }
    },
  },
})
