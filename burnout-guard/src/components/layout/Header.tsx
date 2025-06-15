'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Header() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <img src="/burnout-guard-logo.svg" alt="BurnoutGuard" className="h-12 w-auto" />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
