import { persistentAtom } from '@nanostores/persistent'

export interface WizardState {
  currentStep: number
  selectedOptions: {
    color?: string
    style?: string
    kind?: string
    kitchenLook?: string
    environment?: string
    location?: string
    time?: string
    houseType?: string
    background?: string
    viewpoint?: string
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

export const wizardStore = persistentAtom<WizardState>('kitchen-wizard', initialState, {
  encode: JSON.stringify,
  decode: JSON.parse,
})

// Wizard actions
export const wizardActions = {
  setStep: (step: number) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, currentStep: step, error: '' })
  },

  selectOption: (key: keyof WizardState['selectedOptions'], value: string) => {
    const current = wizardStore.get()
    wizardStore.set({
      ...current,
      selectedOptions: { ...current.selectedOptions, [key]: value },
      error: ''
    })
  },

  setExtraWishes: (wishes: string) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, extraWishes: wishes })
  },

  setError: (error: string) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, error })
  },

  setAuthPrompt: (show: boolean) => {
    const current = wizardStore.get()
    wizardStore.set({ ...current, showAuthPrompt: show })
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

  nextStep: () => {
    const current = wizardStore.get()
    wizardActions.setStep(current.currentStep + 1)
  }
}
