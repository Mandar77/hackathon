'use client';

import CalendarConnection from '@/components/integrations/CalendarConnection';
import { useAuth } from '@/hooks/useAuth';

export default function TestCalendarPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in first</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Calendar Integration</h1>
      <CalendarConnection />
    </div>
  );
}