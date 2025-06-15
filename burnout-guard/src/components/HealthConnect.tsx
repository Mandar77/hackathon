'use client'
import { useHealthStore } from '@/store/health'
import { Button } from '@/components/ui/button'

export default function HealthConnect() {
  const { connectGoogleFit, connectedDevices } = useHealthStore()
  
  const isGoogleFitConnected = connectedDevices.includes('google_fit')
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">Connect Health Devices</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-xl">
          <div className="flex items-center gap-3">
            <img src="/google-fit.png" className="w-8 h-8" alt="Google Fit" />
            <span>Google Fit</span>
          </div>
          {isGoogleFitConnected ? (
            <span className="text-green-600 text-sm">✅ Connected</span>
          ) : (
            <Button onClick={connectGoogleFit} size="sm">
              Connect
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-xl">
          <div className="flex items-center gap-3">
            <img src="/apple-health.png" className="w-8 h-8" alt="Apple Health" />
            <span>Apple Health</span>
          </div>
          <a 
            href="https://apps.apple.com/app/your-ios-app"
            target="_blank"
            className="text-blue-600 text-sm hover:underline"
          >
            📱 Download iOS App
          </a>
        </div>
      </div>
    </div>
  )
}
