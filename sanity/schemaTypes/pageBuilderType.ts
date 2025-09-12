import { defineArrayMember, defineType } from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({ type: 'header' }),
    defineArrayMember({ type: 'richText' }),
    defineArrayMember({ type: 'tickerGallery' }),
    defineArrayMember({ type: 'wizard' }),
    defineArrayMember({ type: 'heroSection' }),
    defineArrayMember({ type: 'mediaHeroSection' }),
    defineArrayMember({ type: 'textHeadlineCombo' }),
    defineArrayMember({ type: 'mediaScrollHighlightSection' }),
    defineArrayMember({ type: 'expandableCards' }),
  ],
})
