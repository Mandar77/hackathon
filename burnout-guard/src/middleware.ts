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

  // FIXED: Allow authenticated users to access /auth/callback, but redirect from other auth pages
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    // Allow access to /auth/callback (this is where we determine where to redirect)
    if (req.nextUrl.pathname === '/auth/callback') {
      console.log('Allowing access to /auth/callback')
      return res
    }
    
    // Redirect away from other auth pages (signin, signup, etc.) since user is already authenticated
    console.log('Redirecting away from auth pages to callback')
    return NextResponse.redirect(new URL('/auth/callback', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)'],
}