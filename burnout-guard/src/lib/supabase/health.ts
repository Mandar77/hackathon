import { supabase } from './client'

interface HealthData {
  user_id: string
  heart_rate: number
  sleep_hours: number
  stress_level: number
}

export const submitHealthData = async (data: Omit<HealthData, 'user_id'>) => {
  const user = supabase.auth.getUser()
  return supabase
    .from('health_metrics')
    .insert({ 
      ...data,
      user_id: (await user).data.user?.id,
      timestamp: new Date().toISOString()
    })
}

export const getHealthData = async (userId: string) => {
  const { data } = await supabase
    .from('health_metrics')
    .select('heart_rate, sleep_hours, stress_level')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  return {
    heartRate: data?.heart_rate || 0,
    sleepHours: data?.sleep_hours || 0,
    stressLevel: data?.stress_level || 0
  }
}
