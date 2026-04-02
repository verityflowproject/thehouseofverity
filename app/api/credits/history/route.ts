/**
 * app/api/credits/history/route.ts — Credit transaction history
 *
 * GET: Returns paginated credit transaction history
 * Query params: ?limit=50&offset=0&type=session_deduction
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import type { CreditTransactionType } from '@/lib/models/CreditTransaction'

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
    const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const type   = searchParams.get('type') as CreditTransactionType | null

    const query: Parameters<typeof CreditTransaction.find>[0] = { userId: user.id }
    if (type) query.type = type

    const [transactions, total] = await Promise.all([
      CreditTransaction.find(query, { limit, offset }),
      CreditTransaction.countDocuments({ userId: user.id, ...(type ? { type } : {}) }),
    ])

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('[Credits History] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch credit history' }, { status: 500 })
  }
}
