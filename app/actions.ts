'use server'
import { draftMode } from 'next/headers'

export async function disableDraftMode() {
    const disable = (await draftMode()).disable()
    const delay = new Promise((r) => setTimeout(r, 1000))
    await Promise.allSettled([disable, delay])
}
