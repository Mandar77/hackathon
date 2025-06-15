import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { steps, heart_rate, sleep_hours, source, user_id } = await request.json()
    
    // Store in Supabase
    const { error } = await supabase
      .from('health_metrics')
      .insert({
        user_id,
        heart_rate,
        sleep_hours,
        steps,
        source,
        timestamp: new Date().toISOString()
      })
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
