// src/lib/gmi.ts
require('dotenv').config();

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

Always prioritize user wellbeing and never provide medical advice. Reply in a friendly, conversational tone. Do not return JSON or code blocks`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGMIAPI(
  messages: ChatMessage[],
  model: string = "deepseek-ai/DeepSeek-Prover-V2-671B"
): Promise<string> {
  const url = 'https://api.gmi-serving.com/v1/chat/completions';
  const token = process.env.GMI_API_TOKEN;
  
  if (!token) {
    throw new Error('GMI_API_TOKEN not found in environment variables');
  }
  
  const requestBody = {
    model: model,
    messages: messages,
    max_tokens: 2000,
    temperature: 0.7
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.';
  } catch (error) {
    console.error('Error calling GMI API:', error);
    throw error;
  }
}

export async function getChatCompletion(
  messages: ChatMessage[],
  userContext?: Record<string, unknown>
): Promise<string> {
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: userContext 
        ? `${BURNOUT_COACH_PROMPT}\n\nCurrent user context: ${JSON.stringify(userContext, null, 2)}`
        : BURNOUT_COACH_PROMPT
    };
    
    return await callGMIAPI([systemMessage, ...messages]);
  } catch (error) {
    console.error('GMI API error:', error);
    return 'I\'m experiencing technical difficulties. Please try again later.';
  }
}

export async function generateProactiveMessage(
  userContext: Record<string, unknown>
): Promise<string> {
  try {
    const prompt = `Based on the following user data, generate a proactive, caring message as their burnout prevention coach.

User Data:
${JSON.stringify(userContext, null, 2)}

Generate a personalized message that:
1. References specific patterns you've noticed
2. Shows genuine concern for their wellbeing
3. Provides 1-2 specific, actionable suggestions
4. Asks a thoughtful follow-up question

Keep it conversational and supportive, around 2-3 sentences. Reply in a friendly, conversational tone. Do not return JSON or code blocks`;

    return await getChatCompletion([
      { role: 'user', content: prompt },
    ], userContext);
  } catch (error) {
    console.error('Error generating proactive message:', error);
    return 'How have you been feeling about your workload recently?';
  }
}

export async function simpleChat(userMessage: string): Promise<string> {
  return await getChatCompletion([
    { role: 'user', content: userMessage }
  ]);
}

export async function contextualChat(
  userMessage: string,
  userContext: Record<string, unknown>
): Promise<string> {
  return await getChatCompletion([
    { role: 'user', content: userMessage }
  ], userContext);
}
