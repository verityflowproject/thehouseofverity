/**
 * app/api/usage/economics/route.ts — Internal unit economics endpoint
 *
 * GET: Compute P50/P90/P99 cost and latency percentiles across all usage logs.
 *
 * Protected by CRON_SECRET (admin/internal use only).
 * Used to monitor real unit economics, verify margin health, and detect
 * cost anomalies as usage grows.
 *
 * Query params:
 *   - days:   number (default 30, max 90)
 *   - userId: string (optional, filter to one user for debugging)
 *
 * Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { computeEconomics } from '@/lib/utils/economics'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Admin-only: require cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[Economics] CRON_SECRET not configured')
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const userId    = searchParams.get('userId') ?? undefined
    const days      = Math.min(parseInt(daysParam ?? '30', 10), 90)

    const report = await computeEconomics({ days, userId })

    return NextResponse.json(report)
  } catch (error) {
    console.error('[Economics] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compute economics' },
      { status: 500 },
    )
  }
}
