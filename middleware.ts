/**
 * middleware.ts — Next.js middleware for route protection
 *
 * Protects all non-public routes by checking for NextAuth session.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users away from auth pages to /dashboard.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/api/health',
  '/api/billing/webhook',
]

// Auth routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/signup']

/**
 * Check if a path matches any of the patterns
 */
function isPublicRoute(path: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(path)) return true

  // NextAuth routes
  if (path.startsWith('/api/auth/')) return true

  // Next.js static assets
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check session
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
