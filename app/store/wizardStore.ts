import { atom, onMount } from 'nanostores'

export interface WizardState {
  currentStep: number
  selectedOptions: {
    color?: string
    handle?: string
    style?: string
    kind?: string
    kitchenLook?: string
    environment?: string
    time?: string
    background?: string
    viewpoint?: string
    floor?: string
    accessories?: string[]
  }
  extraWishes: string
  showAuthPrompt: boolean
  error: string
}

const initialState: WizardState = {
  currentStep: -1,
  selectedOptions: {},
  extraWishes: '',
  showAuthPrompt: false,
  error: ''
}

const STORAGE_KEY = 'kitchen-wizard'

// Use regular atom to avoid SSR issues with persistentAtom
export const wizardStore = atom<WizardState>(initialState)

// Handle persistence on client side only
if (typeof window !== 'undefined') {
  // Hydrate from localStorage on mount
  onMount(wizardStore, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        wizardStore.set(parsed)
      }
    } catch {
      // Ignore localStorage errors
    }

    // Subscribe to changes and persist
    const unsubscribe = wizardStore.subscribe((value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // Ignore localStorage errors
      }
    })

    return unsubscribe
  })
}

// Wizard actions
export const wizardActions = {
  setStep: (step: number) => {
    const current = wizardStore.get()
    const targetStep = Number.isFinite(step) ? Math.max(-1, Math.trunc(step)) : current.currentStep
    wizardStore.set({ ...current, currentStep: targetStep, error: '' })
  },

  selectOption: (key: keyof WizardState['selectedOptions'], value: string) => {
    const current = wizardStore.get()
    wizardStore.set({
      ...current,
      selectedOptions: { ...current.selectedOptions, [key]: value },
      error: ''
    })
  },

  toggleMultiOption: (key: 'accessories', value: string) => {
    const current = wizardStore.get()
    const currentValues = current.selectedOptions[key] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    wizardStore.set({
      ...current,
      selectedOptions: { ...current.selectedOptions, [key]: newValues },
      error: ''
    })
  },

  setExtraWishes: (wishes: string) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, extraWishes: wishes, error: '' })
  },

  setError: (error: string) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, error })
  },

  setAuthPrompt: (show: boolean) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, showAuthPrompt: show })
  },

  applyPreset: (payload: { options: Partial<WizardState['selectedOptions']>; extraWishes?: string }) => {
    const current = wizardStore.get()
    wizardStore.set({
      ...current,
      currentStep: Math.max(0, current.currentStep),
      selectedOptions: { ...current.selectedOptions, ...payload.options },
      extraWishes: payload.extraWishes ?? current.extraWishes,
      showAuthPrompt: false,
      error: ''
    })
  },

  reset: () => {
    wizardStore.set(initialState)
  },

  goBack: () => {
    const current = wizardStore.get()
    if (current.showAuthPrompt) {
      wizardActions.setAuthPrompt(false)
      wizardActions.setStep(current.currentStep)
    } else if (current.currentStep > -1) {
      wizardActions.setStep(current.currentStep === 0 ? -1 : current.currentStep - 1)
    }
  },

  nextStep: (maxStep?: number) => {
    const current = wizardStore.get()
    const candidate = current.currentStep + 1
    const clamped = typeof maxStep === 'number' ? Math.min(candidate, maxStep) : candidate
    wizardActions.setStep(clamped)
  }
}
