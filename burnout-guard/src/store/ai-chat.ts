import { create } from 'zustand'
import { 
  contextualChat,
  generateProactiveMessage,
  BURNOUT_COACH_PROMPT 
} from '@/lib/gmi'
import { useAuthStore } from '@/store/auth'
import { useHealthStore } from '@/store/health'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UserContext {
  workPatterns?: {
    meetings: number
    breaks: number
    afterHoursWork: number
  }
  healthMetrics?: {
    heartRate: number
    sleepHours: number
    stressLevel: number
  }
  recentActivity?: string
  burnoutScore?: number
  userId?: string
}

interface AiChatState {
  userContext: UserContext
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  setUserContext: (context: UserContext) => void
  addMessage: (message: ChatMessage) => void
  sendMessage: (message: string) => Promise<void>
  generateProactiveMessage: () => Promise<void>
  initializeContext: () => Promise<void>
  getEnrichedContext: () => Promise<UserContext> // Add this to the interface
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  userContext: {},
  messages: [],
  loading: false,
  error: null,

  setUserContext: (context) => set({ userContext: context }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  sendMessage: async (message) => {
    set({ loading: true, error: null })
    try {
      get().addMessage({ role: 'user', content: message })
      const fullContext = await get().getEnrichedContext()
      const response = await contextualChat(message, fullContext as Record<string, unknown>)
      get().addMessage({ role: 'assistant', content: response })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
      get().addMessage({
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now."
      })
    } finally {
      set({ loading: false })
    }
  },

  generateProactiveMessage: async () => {
    set({ loading: true, error: null })
    try {
      const fullContext = await get().getEnrichedContext()
      const message = await generateProactiveMessage(fullContext as Record<string, unknown>)
      get().addMessage({ role: 'assistant', content: message })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  initializeContext: async () => {
    const { session } = useAuthStore.getState()
    if (!session?.user) return

    const health = useHealthStore.getState()
    set((state) => ({
      userContext: {
        ...state.userContext,
        healthMetrics: {
          heartRate: health.heartRate,
          sleepHours: health.sleepHours,
          stressLevel: health.stressLevel
        }
      }
    }))
  },

  // Implement the getEnrichedContext method
  getEnrichedContext: async () => {
    const { userContext } = get()
    const { session } = useAuthStore.getState()
    
    return {
      ...userContext,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        lastSignIn: session.user.last_sign_in_at
      } : null,
      systemPrompt: BURNOUT_COACH_PROMPT
    }
  }
}))
