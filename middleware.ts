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
  '/dashboard',
]

const AUTH_ROUTES = ['/login', '/signup', '/register']

function isPublicRoute(path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true
  if (path.startsWith('/api/auth/'))  return true
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

  if (isPublicRoute(pathname)) {
    return response
  }

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
