/**
 * lib/db/supabase-server.ts — Supabase server-side client (service role)
 *
 * Uses the SERVICE_ROLE_KEY which bypasses Row Level Security.
 * Import this in API routes, server actions, and server components.
 * NEVER send this key to the browser.
 *
 * Usage:
 *   import { supabaseAdmin } from '@/lib/db/supabase-server'
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Admin client — bypasses RLS. For server-side use only.
 * Singleton across hot-reloads via globalThis cache.
 * Lazy-initialized so the module does not throw at build time.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForSupabase = globalThis as unknown as { supabaseAdmin?: any }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): any {
  if (globalForSupabase.supabaseAdmin) return globalForSupabase.supabaseAdmin

  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl)    throw new Error('[VerityFlow] NEXT_PUBLIC_SUPABASE_URL is not set.')
  if (!serviceRoleKey) throw new Error('[VerityFlow] SUPABASE_SERVICE_ROLE_KEY is not set.')

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })

  globalForSupabase.supabaseAdmin = client

  return client
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop]
  },
})

/**
 * Returns a query builder for the given table, typed as `any` to avoid
 * Supabase TS errors when no generated Database type is available.
 * Use this for insert/update/upsert operations in model helpers.
 *
 * @example
 *   await table('vf_users').insert(row).select().single()
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function table(name: string): any {
  return supabaseAdmin.from(name)
}
