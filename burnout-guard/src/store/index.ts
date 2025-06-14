import { create } from 'zustand'

interface AppState {
  user: any
  workData: any
  burnoutScore: number
  setUser: (user: any) => void
  setBurnoutScore: (score: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  workData: null,
  burnoutScore: 0,
  setUser: (user) => set({ user }),
  setBurnoutScore: (score) => set({ burnoutScore: score }),
}))
