/**
 * middleware.ts — Next.js middleware for route protection
 *
 * Uses session tokens from cookies (edge-compatible) instead of database calls
 * Protects all non-public routes by checking for NextAuth session cookie.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
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

// Auth routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/signup', '/register']

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie (edge-compatible)
  // NextAuth v5 uses either 'authjs.session-token' or '__Secure-authjs.session-token'
  const sessionToken = request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token')

  // Redirect unauthenticated users to login
  if (!sessionToken) {
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
