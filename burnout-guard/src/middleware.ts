import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware running for:', req.nextUrl.pathname)
console.log('Session exists:', !!session)
if (session) {
  console.log('User ID:', session.user?.id)
}
  // If user is not signed in and the current path is not /auth/*, redirect to /auth/signin
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    console.log('Redirecting to signin')
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // If user is signed in and the current path is /auth/*, redirect to /dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    console.log('Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)'],
} 