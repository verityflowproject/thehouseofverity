'use client'

/**
 * hooks/use-user.js — Supabase user hook
 *
 * Drop-in replacement for next-auth's useSession().
 * Returns { data, status } where data.user contains the enriched vf_users profile.
 *
 * @example
 *   const { data: session, status } = useUser()
 *   const user = session?.user
 *   const plan = user?.plan ?? 'free'
 */

import { useSupabaseContext } from '@/app/providers'

export function useUser() {
  const { user, status } = useSupabaseContext()
  return {
    data:   user ? { user } : null,
    status,
  }
}
