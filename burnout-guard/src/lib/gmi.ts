// burnout-guard\src\lib\gmi.ts
// Load environment variables
require('dotenv').config();

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

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Base GMI API function
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
    "model": model,
    "messages": messages,
    "max_tokens": 2000,
    "temperature": 0.7
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

// Enhanced chat completion with burnout coach context
export async function getChatCompletion(
  messages: ChatMessage[],
  userContext?: Record<string, unknown>
): Promise<string>  {
  try {
    // Add context to the system message if available
    const systemMessage: ChatMessage = {
    role: 'system',
    content: userContext 
    ? `${BURNOUT_COACH_PROMPT}\n\nCurrent user context: ${JSON.stringify(userContext, null, 2)}`
    : BURNOUT_COACH_PROMPT
};
    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];
    
    return await callGMIAPI(allMessages);
  } catch (error) {
    console.error('GMI API error:', error);
    return 'I\'m experiencing some technical difficulties. Please try again in a moment.';
  }
}

// Generate proactive burnout prevention messages
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

Keep it conversational and supportive, around 2-3 sentences.`;

    const messages: ChatMessage[] = [
  { role: 'system', content: BURNOUT_COACH_PROMPT },
  { role: 'user', content: prompt }
];

    return await callGMIAPI(messages);
  } catch (error) {
    console.error('Error generating proactive message:', error);
    return 'I\'m checking in on you. How has your week been going?';
  }
}

// Simple chat function for basic conversations
export async function simpleChat(
  userMessage: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  return await getChatCompletion(messages);
}

// Advanced chat with full context
export async function contextualChat(
  userMessage: string,
  userContext: Record<string, unknown>
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  return await getChatCompletion(messages, userContext);
}

// Example usage functions
async function exampleUsage() {
  console.log('=== Simple Chat Example ===');
  const response1 = await simpleChat("Tell me a good time to sleep");
  console.log('Response:', response1);
  
  console.log('\n=== Contextual Chat Example ===');
  const userContext = {
    workPatterns: {
      averageWorkHours: 55,
      meetingsPerDay: 8,
      afterHoursEmails: 15
    },
    healthMetrics: {
      sleepHours: 5.5,
      stressLevel: 8,
      energyLevel: 3
    },
    burnoutScore: 7.2,
    recentActivity: "Working late 4 nights this week"
  };
  
  const response2 = await contextualChat("I'm feeling really exhausted lately", userContext);
  console.log('Contextual Response:', response2);
  
  console.log('\n=== Proactive Message Example ===');
  const proactiveMsg = await generateProactiveMessage(userContext);
  console.log('Proactive Message:', proactiveMsg);
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}

// // Export all functions for use in other files
// module.exports = {
//   getChatCompletion,
//   generateProactiveMessage,
//   simpleChat,
//   contextualChat,
//   BURNOUT_COACH_PROMPT
// };

// export {
//   getChatCompletion,
//   generateProactiveMessage,
//   simpleChat,
//   contextualChat,
//   BURNOUT_COACH_PROMPT
// };