import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { googleFitService } from '@/lib/googleFit'

interface HealthState {
  heartRate: number
  sleepHours: number
  stressLevel: number
  steps: number
  connectedDevices: string[]
  connectGoogleFit: () => Promise<void>
  syncGoogleFitData: (healthData: { steps: number; heartRate: number }) => Promise<void>
  loadData: (userId: string) => Promise<void>
  submitData: (data: { 
    heartRate: number, 
    sleepHours: number, 
    stressLevel: number 
  }) => Promise<void>
}

export const useHealthStore = create<HealthState>((set, get) => ({
  heartRate: 0,
  sleepHours: 0,
  stressLevel: 0,
  steps: 0,
  connectedDevices: [],
  
  connectGoogleFit: async () => {
    try {
      const authUrl = await googleFitService.requestAuthorization()
      window.location.href = authUrl
    } catch (error) {
      console.error('Google Fit connection failed:', error)
    }
  },

  syncGoogleFitData: async (healthData) => {
    const user = await supabase.auth.getUser()
    if (!user.data.user?.id) return

    const { error } = await supabase.from('health_metrics').insert({
      user_id: user.data.user.id,
      steps: healthData.steps,
      heart_rate: healthData.heartRate,
      source: 'google_fit',
      timestamp: new Date().toISOString()
    })

    if (!error) {
      set({
        steps: healthData.steps,
        heartRate: healthData.heartRate,
        connectedDevices: [...new Set([...get().connectedDevices, 'google_fit'])]
      })
    }
  },

  loadData: async (userId) => {
    const { data } = await supabase
      .from('health_metrics')
      .select('heart_rate, sleep_hours, stress_level, steps')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      set({
        heartRate: data.heart_rate || 0,
        sleepHours: data.sleep_hours || 0,
        stressLevel: data.stress_level || 0,
        steps: data.steps || 0
      })
    }
  },

  submitData: async (data) => {
    const user = await supabase.auth.getUser()
    if (!user.data.user?.id) return

    await supabase.from('health_metrics').insert({
      user_id: user.data.user.id,
      heart_rate: data.heartRate,
      sleep_hours: data.sleepHours,
      stress_level: data.stressLevel,
      timestamp: new Date().toISOString()
    })

    set({
      heartRate: data.heartRate,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel
    })
  }
}))
