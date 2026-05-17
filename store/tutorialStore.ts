'use client'

import { create } from 'zustand'
import { TUTORIAL_STEPS } from '@/lib/game/tutorialSteps'

interface TutorialState {
  currentStepIndex: number
  isStepCompleted: boolean
  mistakesMade: number
  // increments whenever the user clicks a wrong piece — triggers shake animation
  wrongClickSignal: number

  goToStep: (index: number) => void
  nextStep: () => void
  prevStep: () => void
  completeStep: () => void
  recordMistake: () => void
  reset: () => void
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  currentStepIndex: 0,
  isStepCompleted: false,
  mistakesMade: 0,
  wrongClickSignal: 0,

  goToStep: (index) =>
    set({ currentStepIndex: index, isStepCompleted: false, mistakesMade: 0 }),

  nextStep: () => {
    const next = get().currentStepIndex + 1
    if (next < TUTORIAL_STEPS.length) {
      set({ currentStepIndex: next, isStepCompleted: false, mistakesMade: 0 })
    }
  },

  prevStep: () => {
    const prev = get().currentStepIndex - 1
    if (prev >= 0) {
      set({ currentStepIndex: prev, isStepCompleted: false, mistakesMade: 0 })
    }
  },

  completeStep: () => set({ isStepCompleted: true }),

  recordMistake: () =>
    set((s) => ({ mistakesMade: s.mistakesMade + 1, wrongClickSignal: s.wrongClickSignal + 1 })),

  reset: () =>
    set({ currentStepIndex: 0, isStepCompleted: false, mistakesMade: 0, wrongClickSignal: 0 }),
}))
