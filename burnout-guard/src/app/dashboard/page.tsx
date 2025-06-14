'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const mockBurnoutScore = 65 // This will be dynamic later

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Your workplace wellness overview
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Burnout Risk</h3>
              <p className="text-2xl font-bold text-orange-600">{mockBurnoutScore}%</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Meetings Today</h3>
              <p className="text-2xl font-bold">7</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Break Time</h3>
              <p className="text-2xl font-bold">12 min</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold">Stress Level</h3>
              <p className="text-2xl font-bold text-red-500">High</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="text-sm">
                💡 I noticed you have 7 meetings today with no breaks. 
                Would you like me to suggest rescheduling the 2 PM check-in?
              </p>
            </div>
            <Button>Chat with AI</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
