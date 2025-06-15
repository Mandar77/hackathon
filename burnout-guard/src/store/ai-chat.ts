import { create } from 'zustand'
import { getChatCompletion, generateProactiveMessage as generateProactiveMessageAPI } from '@/lib/gmi'

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
  inputValue: string
  isChatMode: boolean
  retryCount: number
  lastRequestData: { type: 'message' | 'proactive'; data: any } | null
  
  // Actions
  setUserContext: (context: UserContext) => void
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
  inputValue: '',
  isChatMode: false,
  retryCount: 0,
  lastRequestData: null,

  setUserContext: (context) => set({ userContext: context }),
  setInputValue: (value) => set({ inputValue: value }),
  setIsChatMode: (mode) => set({ isChatMode: mode }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  sendMessage: async (message) => {
    if (!message.trim()) return
    
    set({ 
      loading: true, 
      error: null,
      lastRequestData: { type: 'message', data: message }
    })
    
    try {
      // Add user message
      get().addMessage({
        role: 'user', 
        content: message.trim(),
        timestamp: new Date()
      })

      // Get AI response
      const response = await getChatCompletion(
        [{ role: 'user', content: message.trim() }],
        get().userContext
      )

      // Add assistant message
      get().addMessage({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })
      
      set({ retryCount: 0 })
    } catch (error) {
      console.error('Message Error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message',
        retryCount: get().retryCount + 1
      })
    } finally {
      set({ loading: false })
    }
  },

  generateProactiveMessage: async (userId) => {
    set({ 
      loading: true, 
      error: null,
      lastRequestData: { type: 'proactive', data: { userId } }
    })
    
    try {
      const response = await generateProactiveMessageAPI({
        ...get().userContext,
        userId
      })
      
      get().addMessage({
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      })
      
      set({ retryCount: 0 })
    } catch (error) {
      console.error('Proactive Error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate insights',
        retryCount: get().retryCount + 1
      })
    } finally {
      set({ loading: false })
    }
  },

  retryFailedRequest: async () => {
    const { lastRequestData } = get()
    if (!lastRequestData) return

    try {
      if (lastRequestData.type === 'message') {
        await get().sendMessage(lastRequestData.data)
      } else {
        await get().generateProactiveMessage(lastRequestData.data.userId)
      }
    } catch (error) {
      console.error('Retry Failed:', error)
    }
  },

  clearMessages: () => set({ 
    messages: [], 
    error: null,
    lastRequestData: null,
    retryCount: 0
  })
}))
