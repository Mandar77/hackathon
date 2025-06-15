import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  session: Session | null
  user: Session['user'] | null
  setSession: (session: Session | null) => void
  initializeAuth: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  
  setSession: (session) => set({ 
    session,
    user: session?.user ?? null
  }),

  initializeAuth: () => {
    // Async IIFE for initial session check
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null })
    })()

    // Auth state listener setup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        set({ 
          session,
          user: session?.user ?? null
        })
      }
    )

    // Return cleanup function
    return () => subscription?.unsubscribe()
  }
}))
