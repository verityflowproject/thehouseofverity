/**
 * lib/db/supabase-browser.ts — Supabase browser client (anon key)
 *
 * Uses the ANON_KEY and respects Row Level Security.
 * Safe to import in client components and browser code.
 *
 * Usage:
 *   import { supabaseBrowser } from '@/lib/db/supabase-browser'
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Singleton browser client. Calling createBrowserClient multiple times
 * is safe — @supabase/ssr de-duplicates internally — but we cache it
 * ourselves for clarity.
 */
let _client: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowser() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}

/** Convenience alias */
export const supabaseBrowser = getSupabaseBrowser()
