import { supabase } from '@/lib/supabase/client'
import { getChatCompletion } from '@/lib/gmi'
import { useAiChatStore } from '@/store/ai-chat'

interface Recommendation {
  priority: number
  category: 'work' | 'health' | 'recovery' | 'boundaries'
  title: string
  description: string
  actionSteps: string[]
  dataReferences: string[]
}

export async function getPersonalizedRecommendations(userId: string): Promise<Recommendation[]> {
  // Get latest data from Supabase
  const { data: wellness } = await supabase
    .from('daily_wellness_scores')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const { data: calendar } = await supabase
    .from('calendar_data')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const { data: health } = await supabase
    .from('watch_data')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Construct AI prompt
  const prompt = `As Alex, the burnout prevention coach, analyze this user data and generate 3-5 personalized recommendations:

User Profile:
- Job: ${preferences?.job_role || 'Unknown'}
- Work Hours: ${preferences?.working_hours_start}-${preferences?.working_hours_end}
- Work Style: ${preferences?.work_autonomy || 'Unknown'} autonomy

Recent Work Patterns:
- Meetings: ${calendar?.meeting_count || 0} meetings (${calendar?.total_meeting_minutes || 0} mins)
- Focus Time: ${calendar?.longest_focus_block_minutes || 0} mins longest focus block
- After Hours Work: ${calendar?.after_hours_minutes || 0} mins

Health Metrics:
- Sleep: ${health?.sleep_duration_minutes ? Math.round(health.sleep_duration_minutes/60) : 'Unknown'} hours
- Stress: ${health?.stress_score || 'Unknown'} score
- Recovery: ${health?.recovery_score || 'Unknown'}%

Wellness Scores:
- Burnout Risk: ${wellness?.burnout_risk_score || 'Unknown'}%
- Workload Score: ${wellness?.workload_score || 'Unknown'}%

Generate recommendations that:
1. Reference specific data points
2. Provide actionable steps
3. Consider user preferences
4. Prioritize by burnout risk
5. Use markdown for formatting`

  // Get AI response
  const response = await getChatCompletion([{ role: 'user', content: prompt }])
  
  // Parse JSON response (assuming GMI returns proper JSON)
  try {
    return JSON.parse(response).recommendations
  } catch (error) {
    console.error('Failed to parse AI recommendations:', error)
    return []
  }
}

// Example usage in AI chat store
async function generateProactiveMessage(userId: string) {
  const recommendations = await getPersonalizedRecommendations(userId)
  
  // Format for chat interface
  const message = `Based on your recent activity, I recommend:\n\n${
    recommendations.map(r => `**${r.title}**\n${r.description}\n${r.actionSteps.join('\n')}`).join('\n\n')
  }`
  
  useAiChatStore.getState().addMessage({
    role: 'assistant',
    content: message,
    timestamp: new Date()
  })
}
