import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { useHealthStore } from '@/store/health'

export default function HealthSync() {
  const { session } = useAuthStore()
  const { submitData } = useHealthStore()

  useEffect(() => {
    if (!session?.user) return

    const channel = supabase
      .channel('realtime-health')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_metrics',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => { // <-- No need for explicit type here, but you can add one if you want
          console.log('New health data:', payload.new)
          submitData({
            heartRate: payload.new.heart_rate,
            sleepHours: payload.new.sleep_hours,
            stressLevel: payload.new.stress_level
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [session, submitData])

  return null
}
