import { persistentAtom } from "@nanostores/persistent";

export const $showWizard = persistentAtom('showWizard', false, {
  encode: JSON.stringify,
  decode: JSON.parse,
})
