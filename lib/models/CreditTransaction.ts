/**
 * lib/models/CreditTransaction.ts — Firestore CreditTransaction helpers
 *
 * Collection: vf_credit_transactions  (document ID = transaction UUID)
 *
 * Indexes needed:
 *   vf_credit_transactions: userId ASC + createdAt DESC
 *   vf_credit_transactions: sessionId ASC + createdAt ASC
 */

import { v4 as uuidv4 } from 'uuid'
import { db, toDate } from '@/lib/db/firestore'

const COL = 'vf_credit_transactions'

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): ICreditTransaction {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as ICreditTransaction
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const CreditTransaction = {
  async create(data: Partial<ICreditTransaction>): Promise<ICreditTransaction> {
    const now = new Date()
    const id  = data.id ?? uuidv4()
    const doc = {
      ...data,
      id,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    }
    await db.collection(COL).doc(id).set(doc)
    return fromDoc(doc, id)
  },

  async find(
    query: Partial<Pick<ICreditTransaction, 'userId' | 'type' | 'sessionId'>>,
    opts: { limit?: number; offset?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<ICreditTransaction[]> {
    let ref: FirebaseFirestore.Query = db.collection(COL)
    if (query.userId)    ref = ref.where('userId',    '==', query.userId)
    if (query.type)      ref = ref.where('type',      '==', query.type)
    if (query.sessionId) ref = ref.where('sessionId', '==', query.sessionId)
    ref = ref.orderBy('createdAt', opts.sort ?? 'desc')
    if (opts.offset) ref = ref.offset(opts.offset)
    if (opts.limit)  ref = ref.limit(opts.limit)
    const snap = await ref.get()
    return snap.docs.map((d) => fromDoc(d.data(), d.id))
  },

  async countDocuments(
    query: Partial<Pick<ICreditTransaction, 'userId' | 'type'>>,
  ): Promise<number> {
    let ref: FirebaseFirestore.Query = db.collection(COL)
    if (query.userId) ref = ref.where('userId', '==', query.userId)
    if (query.type)   ref = ref.where('type',   '==', query.type)
    const snap = await ref.count().get()
    return snap.data().count
  },

  async getHistory(
    userId: string,
    limit:  number = 50,
    offset: number = 0,
  ): Promise<ICreditTransaction[]> {
    return CreditTransaction.find({ userId }, { limit, offset, sort: 'desc' })
  },

  /** Sum of absolute credit amounts for session deductions today. */
  async getDailyUsage(userId: string): Promise<number> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const snap = await db.collection(COL)
      .where('userId', '==', userId)
      .where('type', '==', 'session_deduction')
      .where('createdAt', '>=', startOfDay)
      .get()

    return snap.docs.reduce((sum, doc) => sum + Math.abs(doc.data().amount ?? 0), 0)
  },

  async getSessionBreakdown(sessionId: string): Promise<ICreditTransaction[]> {
    return CreditTransaction.find({ sessionId, type: 'session_deduction' }, { sort: 'asc' })
  },
}

export type ICreditTransactionModel = typeof CreditTransaction
