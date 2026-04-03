/**
 * app/api/health/route.ts — Health check endpoint
 *
 * Pings Supabase to verify system health.
 * Returns 200 if healthy, 503 if degraded.
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase-server'

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    services: {
      supabase: 'ok' as 'ok' | 'error',
    },
  }

  try {
    const { error } = await supabaseAdmin
      .from('vf_users')
      .select('id')
      .limit(1)

    if (error) throw error
    status.services.supabase = 'ok'
  } catch (error) {
    console.error('[Health] Supabase check failed:', error)
    status.services.supabase = 'error'
  }

  const isHealthy = status.services.supabase === 'ok'
  return NextResponse.json(status, { status: isHealthy ? 200 : 503 })
}
