/**
 * app/api/auth/[...nextauth]/route.ts — NextAuth v5 route handler
 *
 * Delegates all /api/auth/* requests to the NextAuth handlers exported
 * from the central auth configuration. This file stays deliberately thin.
 *
 * Covered routes (automatically by NextAuth):
 *   GET  /api/auth/providers
 *   GET  /api/auth/session
 *   POST /api/auth/signin/:provider
 *   GET  /api/auth/callback/:provider
 *   POST /api/auth/signout
 *   GET  /api/auth/csrf
 *   GET  /api/auth/verify-request   (email magic link)
 */
export { GET, POST } from '@/lib/auth'
