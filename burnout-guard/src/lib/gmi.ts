// src/lib/gmi.ts
require('dotenv').config();

export const BURNOUT_COACH_PROMPT = `You are Alex, a caring workplace wellness coach specializing in burnout prevention. Use this approach:

1. FIRST analyze these key metrics:
- Meeting frequency: {meetings}
- Break time: {breaks} mins
- After-hours work: {afterHoursWork} hrs
- Heart rate: {heartRate} BPM
- Sleep: {sleepHours} hrs
- Stress level: {stressLevel}/10

2. THEN provide:
- 1 specific observation
- 2 actionable suggestions
- 1 open-ended question

Communication rules:
- Use natural, conversational English
- No markdown or code blocks
- Keep responses under 150 words
- Prioritize empathy and practicality

If you need more context, ask clarifying questions. Always use friendly and supportive language. Do not use technical jargon or complex terms.
Also do not use any markdown formatting, just plain text responses.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type { ChatMessage }

export function cleanAIResponse(raw: string): string {
  // Remove JSON code blocks if present
  const cleaned = raw.replace(/``````/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.response) {
      let result = parsed.response;
      if (parsed.suggestions) {
        result += '\n\nSuggestions:\n' + 
          parsed.suggestions.map((s: string) => `• ${s}`).join('\n');
      }
      return result;
    }
    return cleaned;
  } catch {
    return cleaned;
  }
}

async function callGMIAPI(
  messages: ChatMessage[],
  model: string = "deepseek-ai/DeepSeek-Prover-V2-671B"
): Promise<string> {
  const url = 'https://api.gmi-serving.com/v1/chat/completions';
  const token = process.env.GMI_API_TOKEN;
  
  if (!token) throw new Error('GMI_API_TOKEN not configured');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API request failed');
    
    return cleanAIResponse(data.choices[0]?.message?.content || '');
  } catch (error) {
    console.error('GMI API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function getChatCompletion(
  messages: ChatMessage[],
  context?: Record<string, unknown>
): Promise<string> {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: context
        ? BURNOUT_COACH_PROMPT.replace(/{(\w+)}/g, (_, key) => context[key]?.toString() || 'N/A')
        : BURNOUT_COACH_PROMPT
    };

    return await callGMIAPI([systemMessage, ...messages]);
  } catch (error) {
    console.error('Chat Error:', error);
    return "I'm having trouble responding right now. Please try again later.";
  }
}

export async function generateProactiveMessage(context: Record<string, unknown>): Promise<string> {
  try {
    const prompt = `Generate proactive wellness advice based on:
- Recent work patterns
- Health metrics
- Historical burnout risk factors

Format requirements:
- Start with a empathetic observation
- Provide 2 specific recommendations 
- End with an open question
- Use natural conversation style
- Avoid technical terms`;

    return await getChatCompletion([
      { role: 'user', content: prompt }
    ], context);
  } catch (error) {
    console.error('Proactive Message Error:', error);
    return "How are you feeling about your current workload?";
  }
}
