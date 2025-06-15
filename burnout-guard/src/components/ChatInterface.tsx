// src/components/ChatInterface.tsx
'use client'
import { useAiChatStore } from '@/store/ai-chat'

export default function ChatInterface() {
  const { messages, loading, error, retryCount, retryFailedRequest } = useAiChatStore()

  return (
    <div className="chat-container">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}

      {loading && <div className="loading-indicator">Analyzing your data...</div>}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          {retryCount < 3 && (
            <button 
              onClick={retryFailedRequest}
              className="retry-button"
            >
              Retry ({3 - retryCount} attempts left)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
