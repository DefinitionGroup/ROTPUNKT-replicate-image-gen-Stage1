import { defineLive } from 'next-sanity/live'
import { client } from './client'

const serverToken = process.env.SANITY_VIEWER_TOKEN
const browserToken = process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  browserToken,
})
