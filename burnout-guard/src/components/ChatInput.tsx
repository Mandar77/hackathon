'use client'
import { Button } from '@/components/ui/button'
import { useAiChatStore } from '@/store/ai-chat'

export default function ChatInput({ disabled = false }: { disabled?: boolean }) {
  const { inputValue, setInputValue, sendMessage, loading } = useAiChatStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !loading && !disabled) {
      await sendMessage(inputValue)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message to Alex..."
          disabled={disabled || loading}
          className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none disabled:opacity-50"
        />
      </div>
      <Button
        type="submit"
        disabled={!inputValue.trim() || loading || disabled}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl"
      >
        {loading ? 'Sending...' : 'Send'}
      </Button>
    </form>
  )
}
