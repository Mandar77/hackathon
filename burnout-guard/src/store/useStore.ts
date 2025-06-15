import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import { User, WorkPattern, BurnoutScore } from '../types'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface StoreState {
  user: User | null
  workPatterns: WorkPattern[]
  burnoutScore: BurnoutScore | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  fetchWorkPatterns: () => Promise<void>
  updateWorkPattern: (pattern: WorkPattern) => Promise<void>
  calculateBurnoutScore: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  workPatterns: [],
  burnoutScore: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchWorkPatterns: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('work_patterns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ workPatterns: data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateWorkPattern: async (pattern) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('work_patterns')
        .upsert(pattern)

      if (error) throw error
      await get().fetchWorkPatterns() // Refresh the patterns
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  calculateBurnoutScore: async () => {
    set({ isLoading: true, error: null })
    try {
      const { workPatterns } = get()
      
      // Example calculation logic
      const overall = workPatterns.reduce((acc, pattern) => 
        acc + (pattern.stressLevel * 0.4 + 
               (pattern.meetingHours / 8) * 0.3 + 
               (pattern.emailsAfterHours / 10) * 0.3), 0) / workPatterns.length

      const burnoutScore: BurnoutScore = {
        overall,
        workload: overall * 0.4,
        boundaries: overall * 0.3,
        recovery: overall * 0.3
      }

      set({ burnoutScore, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  }
})) 