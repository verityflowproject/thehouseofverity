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
  // #region agent log
  fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f15820'},body:JSON.stringify({sessionId:'f15820',location:'api/auth/me/route.ts:GET',message:'/api/auth/me reached',data:{urlEnvSet:!!process.env.NEXT_PUBLIC_SUPABASE_URL,anonKeySet:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,serviceKeySet:!!process.env.SUPABASE_SERVICE_ROLE_KEY},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
