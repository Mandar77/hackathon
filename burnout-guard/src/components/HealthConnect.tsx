'use client'
import { useHealthStore } from '@/store/health'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HealthConnect() {
  const { connectGoogleFit, connectedDevices } = useHealthStore()
  
  const isGoogleFitConnected = connectedDevices.includes('google_fit')
  
  return (
    <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="text-3xl">❤️</span>
        Connect Health Devices
      </h3>

      {!isGoogleFitConnected ? (
        <div className="space-y-6">
          <p className="text-gray-600">
            Connect your health devices to get AI-powered insights on your wellness patterns and stress levels.
          </p>
          
          {/* Google Fit Logo and Connect Button */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md">
              <img src="/google-fit.png" className="w-8 h-8" alt="Google Fit" />
            </div>
            
            <Button
              onClick={connectGoogleFit}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <span>Connect Google Fit</span>
                <span className="text-lg">🚀</span>
              </span>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Your health data is secure and private
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-green-50 rounded-2xl border border-green-200">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="text-lg font-bold text-green-800 mb-2">Google Fit Connected!</h4>
              <p className="text-green-600 text-sm">
                Your health data is being synced automatically
              </p>
            </div>
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
      )}
    </Card>
  )
}
