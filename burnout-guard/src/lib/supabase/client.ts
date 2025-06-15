import { createClient } from '@supabase/supabase-js'

// Ensure these are in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)

// Optional: Type definitions for your database
export interface Database {
  public: {
    Tables: {
      health_metrics: {
        Row: {
          id: string
          user_id: string
          heart_rate: number | null
          sleep_hours: number | null
          stress_level: number | null
          timestamp: string
        }
      }
    }
  }
}
