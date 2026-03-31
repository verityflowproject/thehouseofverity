/**
 * next-auth.d.ts — Module augmentation for NextAuth v4
 *
 * Extends the default Session, User, and JWT types so that
 * session.user carries VerityFlow-specific fields on every
 * authenticated request — server components, API routes, and
 * middleware can all access these without casting.
 *
 * Import chain:
 *   next-auth          → Session, User
 *   next-auth/jwt      → JWT
 *   next-auth/adapters → AdapterUser
 */

import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'
import type { Plan } from './models'

// ─── Augment next-auth ────────────────────────────────────────────────────────

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getServerSession`, and `getSession`.
   * All VerityFlow-specific fields are merged into `session.user`
   * so callers never need to cast.
   */
  interface Session {
    user: VerityFlowSessionUser & DefaultSession['user']
  }

  /**
   * The User object returned by an OAuth provider callback or
   * the Credentials provider. Stored in the database via the adapter.
   */
  interface User extends DefaultUser {
    id: string
    plan: Plan
    credits: number
    modelCallsUsed: number
    modelCallsLimit: number
  }
}

// ─── Augment next-auth/jwt ────────────────────────────────────────────────────

declare module 'next-auth/jwt' {
  /**
   * The decoded JWT payload available in `jwt()` callbacks and
   * `getToken()`. VerityFlow fields are written in the `jwt` callback
   * and read in the `session` callback to hydrate `session.user`.
   */
  interface JWT extends DefaultJWT {
    /** UUID v4 matching the user document's `id` field. */
    id: string
    plan: Plan
    credits: number
    modelCallsUsed: number
    modelCallsLimit: number
  }
}

// ─── Shared augmentation helper ───────────────────────────────────────────────

/**
 * The concrete shape of session.user after augmentation.
 * Exported so other modules can import it without depending on next-auth.
 *
 * Matches SessionUser in user.ts exactly — kept in sync manually.
 */
export interface VerityFlowSessionUser {
  /** UUID v4 — guaranteed present after authentication. */
  id: string
  email: string
  name?: string
  image?: string
  /** Billing plan tier. */
  plan: Plan
  /** Current credit balance. */
  credits: number
  /** @deprecated Legacy. Number of model calls consumed in the current billing cycle. */
  modelCallsUsed: number
  /** @deprecated Legacy. Hard cap for the current billing cycle (based on plan). */
  modelCallsLimit: number
}
