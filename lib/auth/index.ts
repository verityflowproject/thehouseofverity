/**
 * lib/auth/index.ts — Auth barrel
 *
 * Import from '@/lib/auth' to access NextAuth handlers and the server-side
 * auth() function without deep path imports.
 *
 * @example
 *   import { auth, signIn, signOut } from '@/lib/auth'
 *   const session = await auth()
 */
import { handlers as authHandlers, auth, signIn, signOut } from './auth'

export { auth, signIn, signOut }
export const handlers = authHandlers

// Re-export GET and POST from handlers for NextAuth v5 route
export const { GET, POST } = authHandlers
