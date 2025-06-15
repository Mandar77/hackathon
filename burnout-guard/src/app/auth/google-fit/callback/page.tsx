'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { googleFitService } from '@/lib/googleFit'
import { useHealthStore } from '@/store/health'

export default function GoogleFitCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { syncGoogleFitData } = useHealthStore()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Google Fit authorization error:', error)
        router.push('/dashboard?error=google-fit')
        return
      }

      if (code) {
        try {
          const tokens = await googleFitService.exchangeCodeForTokens(code)
          const healthData = await googleFitService.getHealthData(tokens.access_token)
          await syncGoogleFitData(healthData)
          router.push('/dashboard?success=google-fit-connected')
        } catch (error) {
          console.error('Google Fit connection failed:', error)
          router.push('/dashboard?error=google-fit-failed')
        }
      }
    }

    handleAuth()
  }, [searchParams, router, syncGoogleFitData])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Connecting to Google Fit...</p>
      </div>
    </div>
  )
}
