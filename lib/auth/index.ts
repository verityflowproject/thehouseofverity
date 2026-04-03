/**
 * lib/auth/index.ts — Auth barrel
 *
 * Import from '@/lib/auth' to access session helpers.
 *
 * @example
 *   import { auth } from '@/lib/auth'
 *   const session = await auth()
 */
export { auth, getSession, requireSession } from './auth'
export type { Session, SessionUser } from './auth'
