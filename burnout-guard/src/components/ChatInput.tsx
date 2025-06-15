'use client'
import { shallow } from 'zustand/shallow'
import { Button } from '@/components/ui/button'
import { useAiChatStore } from '@/store/ai-chat'

interface ChatInputProps {
  disabled?: boolean
}

export default function ChatInput({ disabled = false }: ChatInputProps) {
  // Destructure with explicit types to avoid "unknown" errors
  const inputValue = useAiChatStore((state) => state.inputValue)
  const setInputValue = useAiChatStore((state) => state.setInputValue)
  const sendMessage = useAiChatStore((state) => state.sendMessage)
  const loading = useAiChatStore((state) => state.loading)

  // If you want to use shallow for multiple values, use this pattern:
  // const { inputValue, setInputValue, sendMessage, loading } = useAiChatStore(
  //   (state) => ({
  //     inputValue: state.inputValue,
  //     setInputValue: state.setInputValue,
  //     sendMessage: state.sendMessage,
  //     loading: state.loading,
  //   }),
  //   shallow
  // )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = inputValue?.trim()
    if (message && !loading && !disabled) {
      await sendMessage(message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <textarea
          value={inputValue || ''}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message to Alex..."
          disabled={disabled || loading}
          className="w-full p-3 border-2 border-purple-200 rounded-xl resize-none focus:border-purple-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />
      </div>
      <Button
        type="submit"
        disabled={!inputValue?.trim() || loading || disabled}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Send'
        )}
      </Button>
    </form>
  )
}
