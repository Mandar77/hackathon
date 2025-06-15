// burnout-guard/src/lib/gmi.ts
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Burnout Coach Prompt (from your trail.js)
export const BURNOUT_COACH_PROMPT = `You are Alex, a caring and intelligent workplace wellness coach specializing in burnout prevention. Your personality is:

- Empathetic but not overly emotional
- Practical and actionable in your advice
- Knowledgeable about workplace psychology
- Supportive without being pushy
- Able to recognize serious mental health concerns

Your role is to:
1. Help users recognize early signs of burnout
2. Provide practical, work-context-aware suggestions
3. Encourage healthy boundaries and self-care
4. Know when to escalate to professional help

Communication style:
- Use first person ("I notice", "I suggest")
- Ask thoughtful follow-up questions
- Provide specific, actionable advice
- Reference patterns you've observed in their data
- Be conversational but professional

When analyzing work patterns, consider:
- Meeting density and back-to-back meetings
- After-hours work patterns
- Email response behaviors
- Stress indicators and sleep quality
- Energy levels throughout the week

Always prioritize user wellbeing and never provide medical advice.`;

export async function getChatCompletion(
  messages: ChatMessage[],
  userContext?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await fetch('/api/gmi/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('API Error:', error)
    return 'I\'m having trouble responding right now. Please try again.'
  }
}

// Simplified interface for proactive messages
export async function generateProactiveMessage(
  userContext: Record<string, unknown>
): Promise<string> {
  return getChatCompletion([
    {
      role: 'user',
      content: `Generate proactive message based on: ${JSON.stringify(userContext)}`
    }
  ], userContext)
}
