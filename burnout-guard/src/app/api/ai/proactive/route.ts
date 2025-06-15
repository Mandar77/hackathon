import { NextResponse } from 'next/server'
import { generateProactiveMessage } from '@/lib/gmi'

export async function POST(request: Request) {
  try {
    const { context } = await request.json()
    
    const response = await generateProactiveMessage(context)
    
    return NextResponse.json({ 
      success: true,
      content: response
    })
    
  } catch (error) {
    console.error('Proactive Message API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate proactive message'
      },
      { status: 500 }
    )
  }
}
