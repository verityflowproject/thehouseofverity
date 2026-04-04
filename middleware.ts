/**
 * middleware.ts — Next.js middleware for route protection
 *
 * Uses Supabase SSR helpers to refresh the session cookie on every request,
 * then protects private routes by checking whether a valid session exists.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/db/supabase-middleware'

// ─── Route lists ─────────────────────────────────────────────────────────────

// Routes that anyone (authenticated or not) may visit.
// NOTE: /dashboard is intentionally NOT here — it requires authentication.
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/api/health',
  '/api/billing/webhook',
  '/privacy',
  '/terms',
  '/cookies',
  '/pricing',
  '/faq',
  '/about',
  '/blog',
  '/contact',
  '/docs',
  '/changelog',
  '/status',
  '/compare',
]

// Auth pages that authenticated users should be bounced away from.
const AUTH_ROUTES = ['/login', '/signup', '/register']

function isPublicRoute(path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true
  if (path.startsWith('/api/auth/'))  return true
  if (path.startsWith('/blog/'))      return true
  if (path.startsWith('/docs/'))      return true
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('/favicon.ico') ||
    path.includes('/robots.txt') ||
    path.includes('/sitemap.xml')
  ) {
    return true
  }
  return false
}

function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.includes(path)
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build base response early so Supabase can set/refresh session cookies.
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Always call getSession() so Supabase can refresh expired tokens.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect logged-in users away from auth pages before the public-route check
  // so this logic is never skipped by an early return.
  if (session && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isPublicRoute(pathname)) {
    return response
  }

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
