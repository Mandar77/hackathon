import { supabase } from '@/lib/supabase/client'

interface GoogleFitCredentials {
  access_token: string
  refresh_token: string
  expires_in: number
}

export class GoogleFitService {
  private baseUrl = 'https://www.googleapis.com/fitness/v1'
  
  async requestAuthorization(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ')
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/google-fit/callback`,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent'
    })
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }
  
  async exchangeCodeForTokens(code: string): Promise<GoogleFitCredentials> {
    const response = await fetch('/api/google-fit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    
    return response.json()
  }

  async getHealthData(accessToken: string) {
    const endTime = new Date().toISOString()
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [steps, heartRate] = await Promise.all([
      this.getStepsData(accessToken, startTime, endTime),
      this.getHeartRateData(accessToken, startTime, endTime)
    ])

    return {
      steps: steps?.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0,
      heartRate: heartRate?.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0
    }
  }

  private async getStepsData(accessToken: string, startTime: string, endTime: string) {
    return this.fetchFitnessData(accessToken, startTime, endTime, 'com.google.step_count.delta')
  }

  private async getHeartRateData(accessToken: string, startTime: string, endTime: string) {
    return this.fetchFitnessData(accessToken, startTime, endTime, 'com.google.heart_rate.bpm')
  }

  private async fetchFitnessData(accessToken: string, startTime: string, endTime: string, dataType: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/dataset:aggregate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: dataType }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: new Date(startTime).getTime(),
          endTimeMillis: new Date(endTime).getTime()
        })
      })
      return response.json()
    } catch (error) {
      console.error('Error fetching fitness data:', error)
      return null
    }
  }
}

export const googleFitService = new GoogleFitService()
