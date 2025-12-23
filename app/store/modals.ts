import { atom } from "nanostores";

// Use regular atom instead of persistentAtom to avoid SSR hydration issues
// Wizard modal visibility shouldn't persist across page refreshes anyway
export const $showWizard = atom(false)
