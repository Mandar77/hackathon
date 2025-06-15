import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <img src="/burnout-guard-logo.svg" alt="BurnoutGuard" className="h-12 w-auto" />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </header>
  )
}
