'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntegrations } from '@/hooks/useDatabase';

export default function ConnectCalendar() {
  const { integrations, loading } = useIntegrations();
  const [isConnecting, setIsConnecting] = useState(false);

  const calendarIntegration = integrations?.find(
    i => i.integration_type === 'calendar' && i.provider_name === 'google'
  );

  const isConnected = calendarIntegration?.status === 'connected';

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/integrations/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration_type: 'calendar',
          provider: 'google'
        })
      });

      const result = await response.json();

      if (result.success && result.auth_url) {
        window.location.href = result.auth_url;
      } else {
        console.error('Failed to get auth URL:', result.error);
        alert('Failed to connect. Please try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="text-3xl">📅</span>
        Connect Calendar
      </h3>

      {!isConnected ? (
        <div className="space-y-6">
          <p className="text-gray-600">
            Connect your Google Calendar to get AI-powered insights on your meeting patterns and work-life balance.
          </p>
          
          {/* Google Logo and Connect Button */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-3 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Connect Google Calendar</span>
                  <span className="text-lg">🚀</span>
                </span>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Your data is secure and private
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
              <h4 className="text-lg font-bold text-green-800 mb-2">Calendar Connected!</h4>
              <p className="text-green-600 text-sm">
                Your Google Calendar is successfully connected
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last synced:</span>
            <span>
              {calendarIntegration?.last_sync_at
                ? new Date(calendarIntegration.last_sync_at).toLocaleString()
                : 'Never'}
            </span>
          </div>

          <Button
            onClick={() => {
              // Add sync functionality here
              console.log('Manual sync triggered');
            }}
            variant="outline"
            className="w-full border-green-300 text-green-600 hover:bg-green-50"
          >
            Sync Now
          </Button>
        </div>
      )}
    </Card>
  );
}