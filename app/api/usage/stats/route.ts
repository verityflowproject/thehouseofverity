/**
 * app/api/usage/stats/route.ts — Usage statistics
 *
 * GET: Aggregate user's usage over the last N days
 * Query params:
 * - days: number (default 30, max 90)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { UsageLog } from '@/lib/models/UsageLog'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const days = Math.min(parseInt(daysParam || '30', 10), 90)

    const endDate   = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await UsageLog.find({
      userId:    user.id,
      createdAt: { $gte: startDate, $lte: endDate },
    })

    const totals = {
      totalCalls:    logs.length,
      totalTokens:   logs.reduce((s, l) => s + (l.totalTokens    || 0), 0),
      totalCost:     logs.reduce((s, l) => s + (l.estimatedCostUsd || 0), 0),
      totalDuration: logs.reduce((s, l) => s + (l.durationMs      || 0), 0),
    }

    const byModel: Record<string, { calls: number; tokens: number; cost: number }> = {}
    for (const log of logs) {
      const model = log.aiModel || 'unknown'
      if (!byModel[model]) byModel[model] = { calls: 0, tokens: 0, cost: 0 }
      byModel[model].calls  += 1
      byModel[model].tokens += log.totalTokens    || 0
      byModel[model].cost   += log.estimatedCostUsd || 0
    }

    const byDay: Record<string, { calls: number; tokens: number; cost: number }> = {}
    for (const log of logs) {
      const day = new Date(log.createdAt).toISOString().split('T')[0]
      if (!byDay[day]) byDay[day] = { calls: 0, tokens: 0, cost: 0 }
      byDay[day].calls  += 1
      byDay[day].tokens += log.totalTokens    || 0
      byDay[day].cost   += log.estimatedCostUsd || 0
    }

    return NextResponse.json({
      period: { days, startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      totals,
      modelBreakdown: byModel,
      byDay,
      currentUsage: {
        credits: user.credits ?? 0,
        plan:    user.plan,
        used:    user.modelCallsUsed  || 0,
        limit:   user.modelCallsLimit || 50,
      },
    })
  } catch (error) {
    console.error('[Usage Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage statistics' }, { status: 500 })
  }
}
