/**
 * lib/models/CreditTransaction.ts — Supabase CreditTransaction helpers
 *
 * Table: vf_credit_transactions  (id = UUID)
 * Public API is unchanged from the Firestore version.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreditTransactionType =
  | 'signup_grant'
  | 'subscription_grant'
  | 'topup_purchase'
  | 'session_deduction'
  | 'refund'
  | 'admin_adjustment'

export interface ICreditTransaction {
  readonly id:     string
  userId:          string
  type:            CreditTransactionType
  amount:          number
  balanceAfter:    number
  description:     string
  sessionId?:      string
  projectId?:      string
  modelUsed?:      string
  inputTokens?:    number
  outputTokens?:   number
  realCostUsd?:    number
  stripePaymentIntentId?: string
  creditPackId?:   string
  createdAt:       Date
  updatedAt:       Date
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): ICreditTransaction {
  return {
    id:                    row.id                      as string,
    userId:                row.user_id                 as string,
    type:                  row.type                    as CreditTransactionType,
    amount:                row.amount                  as number,
    balanceAfter:          row.balance_after           as number,
    description:           (row.description            as string) ?? '',
    sessionId:             row.session_id              as string | undefined,
    projectId:             row.project_id              as string | undefined,
    modelUsed:             row.model_used              as string | undefined,
    inputTokens:           row.input_tokens            as number | undefined,
    outputTokens:          row.output_tokens           as number | undefined,
    realCostUsd:           row.real_cost_usd           as number | undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id as string | undefined,
    creditPackId:          row.credit_pack_id          as string | undefined,
    createdAt:             new Date(row.created_at as string),
    updatedAt:             new Date(row.updated_at as string),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const CreditTransaction = {
  async create(data: Partial<ICreditTransaction>): Promise<ICreditTransaction> {
    const now = new Date()
    const row: Record<string, unknown> = {
      user_id:                 data.userId,
      type:                    data.type,
      amount:                  data.amount,
      balance_after:           data.balanceAfter,
      description:             data.description ?? '',
      session_id:              data.sessionId,
      project_id:              data.projectId,
      model_used:              data.modelUsed,
      input_tokens:            data.inputTokens,
      output_tokens:           data.outputTokens,
      real_cost_usd:           data.realCostUsd,
      stripe_payment_intent_id: data.stripePaymentIntentId,
      credit_pack_id:          data.creditPackId,
      created_at:              data.createdAt ?? now,
      updated_at:              data.updatedAt ?? now,
    }
    if (data.id) row['id'] = data.id

    const { data: created, error } = await table('vf_credit_transactions').insert(row).select().single()

    if (error || !created) throw new Error(`Failed to create credit transaction: ${error?.message}`)
    return fromRow(created)
  },

  async find(
    query: Partial<Pick<ICreditTransaction, 'userId' | 'type' | 'sessionId'>>,
    opts: { limit?: number; offset?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<ICreditTransaction[]> {
    let q = supabaseAdmin.from('vf_credit_transactions').select('*')

    if (query.userId)    q = q.eq('user_id',    query.userId)
    if (query.type)      q = q.eq('type',       query.type)
    if (query.sessionId) q = q.eq('session_id', query.sessionId)

    q = q.order('created_at', { ascending: opts.sort === 'asc' })
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1)
    else if (opts.limit) q = q.limit(opts.limit)

    const { data, error } = await q
    if (error || !data) return []
    return data.map(fromRow)
  },

  async countDocuments(
    query: Partial<Pick<ICreditTransaction, 'userId' | 'type'>>,
  ): Promise<number> {
    let q = supabaseAdmin
      .from('vf_credit_transactions')
      .select('*', { count: 'exact', head: true })

    if (query.userId) q = q.eq('user_id', query.userId)
    if (query.type)   q = q.eq('type',    query.type)

    const { count, error } = await q
    if (error) return 0
    return count ?? 0
  },

  async getHistory(
    userId: string,
    limit  = 50,
    offset = 0,
  ): Promise<ICreditTransaction[]> {
    return CreditTransaction.find({ userId }, { limit, offset, sort: 'desc' })
  },

  async getDailyUsage(userId: string): Promise<number> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { data } = await supabaseAdmin
      .from('vf_credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'session_deduction')
      .gte('created_at', startOfDay.toISOString())

    if (!data) return 0
    return (data as Array<Record<string, unknown>>).reduce(
      (sum, row) => sum + Math.abs((row.amount as number) ?? 0),
      0,
    )
  },

  async getSessionBreakdown(sessionId: string): Promise<ICreditTransaction[]> {
    return CreditTransaction.find({ sessionId, type: 'session_deduction' }, { sort: 'asc' })
  },
}

export type ICreditTransactionModel = typeof CreditTransaction
