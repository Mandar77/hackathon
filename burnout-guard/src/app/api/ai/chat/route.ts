// src/app/api/gmi/chat/route.ts
import { NextResponse } from 'next/server'
import { BURNOUT_COACH_PROMPT } from '@/lib/gmi'

interface GMIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  userContext?: Record<string, unknown>
}

export async function POST(request: Request) {
  const GMI_API_URL = 'https://api.gmi-serving.com/v1/chat/completions'
  const GMI_API_TOKEN = process.env.GMI_API_TOKEN

  if (!GMI_API_TOKEN) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const { messages, userContext } = (await request.json()) as GMIRequest
    
    const gmiResponse = await fetch(GMI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GMI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-Prover-V2-671B",
        messages: [
          {
            role: 'system',
            content: userContext
              ? `${BURNOUT_COACH_PROMPT}\n\nCurrent context: ${JSON.stringify(userContext)}`
              : BURNOUT_COACH_PROMPT
          },
          ...messages
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!gmiResponse.ok) {
      const error = await gmiResponse.text()
      throw new Error(`GMI API Error: ${error}`)
    }

    const data = await gmiResponse.json()
    return NextResponse.json({
      content: data.choices[0]?.message?.content || ''
    })
    
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
