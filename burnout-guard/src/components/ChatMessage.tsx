'use client'
import { formatDistanceToNow } from 'date-fns'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
          🤖
        </div>
      )}
      
      <div className={`max-w-md p-4 rounded-2xl ${
        isUser 
          ? 'bg-purple-500 text-white' 
          : 'bg-white border-l-4 border-indigo-400'
      }`}>
        <div className="text-sm font-medium mb-1">
          {isUser ? 'You' : 'Alex'}
        </div>
        <div className="text-sm">{content}</div>
        <div className="text-xs mt-2 opacity-70">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  )
}
