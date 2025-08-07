import { atom } from "nanostores";

type PageSteps = 'intro' | 'imagegen'

export const $pageStep = atom<PageSteps>('intro')
