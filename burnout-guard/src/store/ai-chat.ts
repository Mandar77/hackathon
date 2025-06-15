import { create } from 'zustand'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserContext {
  [key: string]: unknown
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
  userId?: string
}

interface AiChatState {
  userContext: UserContext
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  retryCount: number
  lastRequestData: { userId: string } | null
  inputValue: string
  isChatMode: boolean
  
  // Actions
  setUserContext: (context: UserContext) => void
  setError: (error: string | null) => void
  setRetryCount: (count: number) => void
  setInputValue: (value: string) => void
  setIsChatMode: (mode: boolean) => void
  addMessage: (message: ChatMessage) => void
  sendMessage: (message: string) => Promise<void>
  generateProactiveMessage: (userId: string) => Promise<void>
  retryFailedRequest: () => Promise<void>
  clearMessages: () => void
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  userContext: {},
  messages: [],
  loading: false,
  error: null,
  retryCount: 0,
  lastRequestData: null,
  inputValue: '',
  isChatMode: false,

  setUserContext: (context) => set({ userContext: context }),
  setError: (error) => set({ error }),
  setRetryCount: (count) => set({ retryCount: count }),
  setInputValue: (value) => set({ inputValue: value }),
  setIsChatMode: (mode) => set({ isChatMode: mode }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  sendMessage: async (message) => {
    if (!message.trim()) return
    
    set({ loading: true, error: null, inputValue: '' })
    try {
      // Add user message
      get().addMessage({
        role: 'user', 
        content: message.trim(),
        timestamp: new Date()
      })

      // Get AI response (implement your API call here)
      const response = "I'm here to help! Here's a personalized suggestion..." // Mock response

      // Add assistant message
      get().addMessage({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  generateProactiveMessage: async (userId) => {
    set({ loading: true, error: null })
    try {
      // Generate proactive message (implement API call)
      const message = "I noticed you've been working hard. Let's schedule a break!" // Mock
      
      get().addMessage({
        role: 'assistant',
        content: message,
        timestamp: new Date()
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  retryFailedRequest: async () => {
    const { lastRequestData } = get()
    if (lastRequestData?.userId) {
      await get().generateProactiveMessage(lastRequestData.userId)
    }
  },

  clearMessages: () => set({ messages: [], error: null })
}))
