// src/store/ai-chat.ts
import { create } from 'zustand';
// import { contextualChat, generateProactiveMessage } from '@/lib/gmi';
import {
  contextualChat,
  generateProactiveMessage,
  BURNOUT_COACH_PROMPT
} from '@/lib/gmi';
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatState {
  userContext: Record<string, unknown>;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  setUserContext: (context: Record<string, unknown>) => void;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (message: string) => Promise<void>;
  generateProactiveMessage: () => Promise<void>;
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
    set({ loading: true, error: null });
    try {
      // Add user message immediately
      get().addMessage({ role: 'user', content: message });
      
      // Get current context (ensure it's always an object)
      const context = get().userContext || {};
      
      // Get AI response
      const response = await contextualChat(message, context);
      
      // Add assistant message
      get().addMessage({ role: 'assistant', content: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      get().addMessage({
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now."
      });
    } finally {
      set({ loading: false });
    }
  },
  
  generateProactiveMessage: async () => {
    set({ loading: true, error: null });
    try {
      // Get current context (ensure it's always an object)
      const context = get().userContext || {};
      
      // Generate proactive message
      const message = await generateProactiveMessage(context);
      
      // Add assistant message
      get().addMessage({ role: 'assistant', content: message });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  }
}));
