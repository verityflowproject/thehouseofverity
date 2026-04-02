/**
 * app/api/usage/reset/route.ts — Monthly usage/billing cycle reset
 *
 * POST: Reset daily credits used, grant monthly subscription credits
 * Protected by cron secret header
 *
 * Query params:
 *   - type: 'daily' | 'monthly' (default: 'monthly')
 */

import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[Usage Reset] CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Usage Reset] Invalid cron secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly'

    if (type === 'daily') {
      const result = await User.updateMany(
        {},
        { dailyCreditsUsed: 0, dailyCreditsResetAt: new Date() },
      )

      console.log(`[Usage Reset] Reset daily credits for ${result.modifiedCount} users`)
      return NextResponse.json({
        success: true,
        type: 'daily',
        usersReset: result.modifiedCount,
        timestamp: new Date().toISOString(),
      })
    }

    const result = await User.updateMany({}, { modelCallsUsed: 0 })

    console.log(`[Usage Reset] Monthly reset for ${result.modifiedCount} users`)
    return NextResponse.json({
      success: true,
      type: 'monthly',
      usersReset: result.modifiedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Usage Reset] Error:', error)
    return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 })
  }
}
