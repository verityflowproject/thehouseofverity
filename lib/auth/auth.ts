/**
 * lib/auth/auth.ts — Supabase Auth server helpers
 *
 * Replaces NextAuth v5. Use getSession() in API routes and server components
 * as a drop-in replacement for the former auth() call.
 *
 * Cookie-aware Supabase client reads the session from Next.js request cookies,
 * then enriches it with the vf_users profile fetched via the admin client.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/db/supabase-server'
import type { Plan } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  /** vf_users.id — the application-level UUID */
  id: string
  /** auth.users.id — the Supabase Auth UUID */
  authUserId: string
  email: string
  name?: string
  image?: string
  plan: Plan
  credits: number
  modelCallsUsed: number
  modelCallsLimit: number
}

export interface Session {
  user: SessionUser
}

// ─── Cookie-aware Supabase client ─────────────────────────────────────────────

function createAuthClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll can fail in Server Components (read-only cookie context).
          }
        },
      },
    },
  )
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function rowToSessionUser(
  row: Record<string, unknown>,
  authUserId: string,
): SessionUser {
  return {
    id:              row.id as string,
    authUserId,
    email:           row.email as string,
    name:            row.name  as string | undefined,
    image:           row.image as string | undefined,
    plan:            (row.plan as Plan) ?? 'free',
    credits:         (row.credits          as number) ?? 0,
    modelCallsUsed:  (row.model_calls_used  as number) ?? 0,
    modelCallsLimit: (row.model_calls_limit as number) ?? 50,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Retrieve the current session from request cookies.
 * Returns null when the user is not authenticated.
 *
 * Drop-in replacement for the former NextAuth auth() call.
 *
 * @example
 *   const session = await getSession()
 *   if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = createAuthClient()
    const {
      data: { session: authSession },
      error,
    } = await supabase.auth.getSession()

    if (error || !authSession?.user) return null

    const { data: profile } = await supabaseAdmin
      .from('vf_users')
      .select('*')
      .eq('auth_user_id', authSession.user.id)
      .single()

    if (!profile) return null

    return { user: rowToSessionUser(profile, authSession.user.id) }
  } catch {
    return null
  }
}

/**
 * Alias for getSession() — matches the former NextAuth auth() call signature
 * so that API routes can `import { auth } from '@/lib/auth'` unchanged.
 */
export const auth = getSession

/**
 * Like getSession() but throws an error with message 'UNAUTHORIZED' if
 * no valid session exists. Use at the top of protected API handlers.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}
