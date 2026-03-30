/**
 * app/api/usage/reset/route.ts — Monthly usage reset
 *
 * POST: Reset modelCallsUsed to 0 for all users
 * Protected by cron secret header
 * Called by Vercel monthly cron job
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

    // Reset all users' usage
    const result = await User.updateMany(
      {},
      { modelCallsUsed: 0 }
    )

    console.log(`[Usage Reset] Reset usage for ${result.modifiedCount} users`)

    return NextResponse.json({
      success: true,
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
