import { defineArrayMember } from 'sanity'

export const pageBuilderMembers = [
  defineArrayMember({ type: 'header' }),
  defineArrayMember({ type: 'richText' }),
  defineArrayMember({ type: 'tickerGallery' }),
  defineArrayMember({ type: 'wizard' }),
  defineArrayMember({ type: 'heroSection' }),
  defineArrayMember({ type: 'mediaHeroSection' }),
  defineArrayMember({ type: 'textHeadlineCombo' }),
  defineArrayMember({ type: 'mediaScrollHighlightSection' }),
  defineArrayMember({ type: 'expandableCards' }),
]
