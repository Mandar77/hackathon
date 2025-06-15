import { create } from 'zustand'

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
  userId?: string
}

interface AiChatState {
  userContext: UserContext
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  retryCount: number
  lastRequestData: { userId: string } | null
  setUserContext: (context: UserContext) => void
  setError: (error: string | null) => void
  setRetryCount: (count: number) => void
  addMessage: (message: ChatMessage) => void
  generateProactiveMessage: (userId: string) => Promise<void>
  retryFailedRequest: () => Promise<void>
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  userContext: {},
  messages: [],
  loading: false,
  error: null,
  retryCount: 0,
  lastRequestData: null,

  // Context management
  setUserContext: (context) => set({ userContext: context }),

  // Error handling
  setError: (error) => set({ error }),
  setRetryCount: (count) => set({ retryCount: count }),

  // Message handling
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  // Proactive message generation
  generateProactiveMessage: async (userId) => {
    set({ loading: true, error: null, lastRequestData: { userId } })
    try {
      // Add your message generation logic here
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ loading: false })
    }
  },

  // Retry functionality
  retryFailedRequest: async () => {
    const { lastRequestData } = get()
    if (lastRequestData?.userId) {
      await get().generateProactiveMessage(lastRequestData.userId)
    }
  }
}))
