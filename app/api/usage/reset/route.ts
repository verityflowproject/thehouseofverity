/**
 * app/api/usage/reset/route.ts — Monthly usage/billing cycle reset
 *
 * POST: Reset daily credits used, grant monthly subscription credits
 * Protected by cron secret header
 * Should be called monthly (subscription renewal handled by Stripe webhook)
 * and daily (for daily credit limit reset)
 *
 * Query params:
 *   - type: 'daily' | 'monthly' (default: 'monthly')
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('[Usage Reset] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Usage Reset] Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly'

    if (type === 'daily') {
      // Reset daily credit usage counters
      const result = await User.updateMany(
        {},
        {
          dailyCreditsUsed: 0,
          dailyCreditsResetAt: new Date(),
        }
      )

      console.log(`[Usage Reset] Reset daily credits for ${result.modifiedCount} users`)

      return NextResponse.json({
        success: true,
        type: 'daily',
        usersReset: result.modifiedCount,
        timestamp: new Date().toISOString(),
      })
    }

    // Monthly reset: reset model call counters and grant subscription credits
    // NOTE: Subscription credit grants are primarily handled by Stripe webhook (invoice.paid)
    // This endpoint is a safety net and handles legacy modelCallsUsed reset
    const result = await User.updateMany(
      {},
      { modelCallsUsed: 0 }
    )

    console.log(`[Usage Reset] Monthly reset for ${result.modifiedCount} users`)

    return NextResponse.json({
      success: true,
      type: 'monthly',
      usersReset: result.modifiedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Usage Reset] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset usage' },
      { status: 500 }
    )
  }
}
