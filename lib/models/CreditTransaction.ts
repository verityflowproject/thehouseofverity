/**
 * lib/models/CreditTransaction.ts — Credit transaction ledger
 *
 * Records every credit movement: grants, purchases, deductions, refunds.
 * Powers the credits history UI and financial auditing.
 *
 * Relationships (UUID refs):
 *   userId    → User.id
 *   sessionId → orchestrator session UUID (for deductions)
 *   projectId → Project.id (for deductions)
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

// ─── Transaction types ─────────────────────────────────────────────────────────

export type CreditTransactionType =
  | 'signup_grant'       // Free credits on signup
  | 'subscription_grant' // Monthly credits from subscription
  | 'topup_purchase'     // One-time credit pack purchase
  | 'session_deduction'  // Credits used during a council session
  | 'refund'             // Credits refunded (failed session, etc.)
  | 'admin_adjustment'   // Manual adjustment by admin

// ─── Document interface ─────────────────────────────────────────────────────────

export interface ICreditTransaction extends Document {
  readonly id: string
  userId: string
  type: CreditTransactionType
  amount: number                   // Positive for grants, negative for deductions
  balanceAfter: number             // User's credit balance after this transaction
  description: string
  /** For session deductions */
  sessionId?: string
  projectId?: string
  /** Model used (for session deductions) */
  modelUsed?: string
  /** Token counts (for session deductions) */
  inputTokens?: number
  outputTokens?: number
  /** Real USD cost (before margin) */
  realCostUsd?: number
  /** Stripe payment intent ID (for purchases) */
  stripePaymentIntentId?: string
  /** Credit pack ID (for purchases) */
  creditPackId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ICreditTransactionModel extends Model<ICreditTransaction> {
  /** Get paginated transaction history for a user. */
  getHistory(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<ICreditTransaction[]>

  /** Get total credits used today for a user. */
  getDailyUsage(userId: string): Promise<number>

  /** Get session breakdown (all deductions for a session). */
  getSessionBreakdown(sessionId: string): Promise<ICreditTransaction[]>
}

// ─── Schema ──────────────────────────────────────────────────────────────────────

const CreditTransactionSchema = new Schema<ICreditTransaction, ICreditTransactionModel>(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
      immutable: true,
    },
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'signup_grant',
        'subscription_grant',
        'topup_purchase',
        'session_deduction',
        'refund',
        'admin_adjustment',
      ],
      required: [true, 'type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
    },
    balanceAfter: {
      type: Number,
      required: [true, 'balanceAfter is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      maxlength: 500,
    },
    sessionId: {
      type: String,
      sparse: true,
      index: true,
    },
    projectId: {
      type: String,
      sparse: true,
    },
    modelUsed: {
      type: String,
    },
    inputTokens: {
      type: Number,
      min: 0,
    },
    outputTokens: {
      type: Number,
      min: 0,
    },
    realCostUsd: {
      type: Number,
      min: 0,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    creditPackId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

CreditTransactionSchema.index({ userId: 1, createdAt: -1 })
CreditTransactionSchema.index({ userId: 1, type: 1, createdAt: -1 })
CreditTransactionSchema.index({ sessionId: 1, createdAt: 1 })
// TTL: auto-delete after 2 years
CreditTransactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 730 })

// ─── Static methods ──────────────────────────────────────────────────────────

CreditTransactionSchema.statics.getHistory = function (
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<ICreditTransaction[]> {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean()
}

CreditTransactionSchema.statics.getDailyUsage = async function (
  userId: string,
): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [result] = await this.aggregate([
    {
      $match: {
        userId,
        type: 'session_deduction',
        createdAt: { $gte: startOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalUsed: { $sum: { $abs: '$amount' } },
      },
    },
  ])

  return result?.totalUsed ?? 0
}

CreditTransactionSchema.statics.getSessionBreakdown = function (
  sessionId: string,
): Promise<ICreditTransaction[]> {
  return this.find({ sessionId, type: 'session_deduction' })
    .sort({ createdAt: 1 })
    .lean()
}

// ─── Model export ─────────────────────────────────────────────────────────────

export const CreditTransaction: ICreditTransactionModel =
  (models.CreditTransaction as ICreditTransactionModel) ??
  model<ICreditTransaction, ICreditTransactionModel>('CreditTransaction', CreditTransactionSchema)
