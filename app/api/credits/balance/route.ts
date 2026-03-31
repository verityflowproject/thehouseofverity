/**
 * app/api/credits/balance/route.ts — Get user credit balance
 *
 * GET: Returns current credit balance, daily usage, plan info
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import { getPlanConfig } from '@/lib/credit-costs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoose()

    const user = await User.findOne({ email: session.user.email }).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const planConfig = getPlanConfig(user.plan as string)
    const dailyUsage = await CreditTransaction.getDailyUsage(user.id as string)

    return NextResponse.json({
      credits: user.credits ?? 0,
      plan: user.plan,
      planLabel: planConfig.label,
      dailyCreditsUsed: dailyUsage,
      dailyCreditLimit: planConfig.dailyCreditLimit === Infinity ? -1 : planConfig.dailyCreditLimit,
      monthlyCredits: planConfig.monthlyCredits,
      maxProjects: planConfig.maxProjects,
    })
  } catch (error) {
    console.error('[Credits Balance] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 },
    )
  }
}
