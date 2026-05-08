import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const uid = request.cookies.get('aahanik-uid')?.value
  const onboarded = request.cookies.get('aahanik-onboarded')?.value

  // Allow static/API paths through
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname === '/manifest.json' ||
    pathname.endsWith('-sw.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

  // Public: login page
  if (pathname.startsWith('/login')) {
    if (uid && onboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Not logged in → login
  if (!uid) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in but not onboarded → onboarding
  if (!onboarded && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Already onboarded → skip onboarding page
  if (onboarded && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Root → dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon.*\\.png|icon.*\\.svg|manifest\\.json|.*-sw\\.js).*)',
  ],
}
