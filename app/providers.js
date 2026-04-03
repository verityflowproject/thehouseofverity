'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/db/supabase-browser'

// ─── Context ──────────────────────────────────────────────────────────────────

export const SupabaseContext = createContext({
  user:   null,
  status: 'loading', // 'loading' | 'authenticated' | 'unauthenticated'
})

export function useSupabaseContext() {
  return useContext(SupabaseContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function Providers({ children }) {
  const [user, setUser]     = useState(null)
  const [status, setStatus] = useState('loading')

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setStatus('authenticated')
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  useEffect(() => {
    const supabase = getSupabaseBrowser()

    // Hydrate from the existing session (if any)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
      } else {
        setStatus('unauthenticated')
      }
    })

    // Keep the user state in sync with auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile()
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SupabaseContext.Provider value={{ user, status }}>
      {children}
    </SupabaseContext.Provider>
  )
}
