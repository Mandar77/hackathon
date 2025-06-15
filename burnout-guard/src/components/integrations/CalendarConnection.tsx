// src/components/integrations/CalendarConnection.tsx
'use client';

import { useState } from 'react';
import { useIntegrations } from '@/hooks/useDatabase';

export default function CalendarConnection() {
  const { integrations, loading, setupIntegration, refetch } = useIntegrations();
  const [isConnecting, setIsConnecting] = useState(false);

  const googleCalendarIntegration = integrations?.find(
    i => i.integration_type === 'calendar' && i.provider_name === 'google'
  );

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      // Call your setup API to get the OAuth URL
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
        // Redirect to Google OAuth
        window.location.href = result.auth_url;
      } else {
        console.error('Failed to get auth URL:', result.error);
        alert('Failed to connect to Google Calendar. Please try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration_type: 'calendar',
          provider: 'google',
          days_back: 7
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Calendar synced successfully!');
        refetch();
      } else {
        alert('Sync failed: ' + result.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;
    
    try {
      // Update integration status to disconnected
      const response = await fetch('/api/integrations/setup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration_type: 'calendar',
          provider: 'google'
        })
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            📅
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-600">
              Connect your calendar to analyze meeting patterns and work-life balance
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {googleCalendarIntegration?.status === 'connected' && (
            <div className="flex items-center text-green-600 mr-4">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              <span className="text-sm">Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        {!googleCalendarIntegration || googleCalendarIntegration.status !== 'connected' ? (
          <button
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        ) : (
          <>
            <button
              onClick={handleSync}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Sync Now
            </button>
            <button
              onClick={handleDisconnect}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {googleCalendarIntegration?.last_sync_at && (
        <p className="text-xs text-gray-500 mt-2">
          Last synced: {new Date(googleCalendarIntegration.last_sync_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}