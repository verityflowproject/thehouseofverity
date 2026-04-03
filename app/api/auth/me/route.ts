/**
 * app/api/auth/me/route.ts — Current user profile endpoint
 *
 * GET: Returns the enriched vf_users profile for the authenticated user.
 * Used by the client-side Supabase context to hydrate the user state.
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ user: session.user })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
