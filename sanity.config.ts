'use client'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { cloudinarySchemaPlugin } from 'sanity-plugin-cloudinary'
import { documentInternationalization } from '@sanity/document-internationalization'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { presentationTool } from 'sanity/presentation'

export default defineConfig({
  basePath: '/studio',
  name: 'default',
  title: 'Rotpunkt Visions',
  apiVersion: apiVersion,
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    visionTool(),
    cloudinarySchemaPlugin(),
    presentationTool({
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_ORIGIN,
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    documentInternationalization({
      supportedLanguages: [
        { id: 'de', title: 'Deutsch' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['page', 'menu'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
