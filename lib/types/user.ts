/**
 * user.ts — User profile, session payload, and billing types
 *
 * These interfaces back the NextAuth session, the MongoDB user
 * collection, and the billing/usage dashboard.
 */

import type { Plan } from './models'

// ─── User profile ─────────────────────────────────────────────────────────────

/**
 * Full user document as stored in MongoDB.
 * The `id` field is a UUID v4 string (not MongoDB ObjectId).
 */
export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly image?: string
  readonly plan: Plan
  /** Current credit balance. */
  readonly credits: number
  /** Credits consumed today (resets at midnight). */
  readonly dailyCreditsUsed: number
  /** When the daily counter was last reset. */
  readonly dailyCreditsResetAt: string
  /** @deprecated Use credits. Legacy model call tracking. */
  readonly modelCallsUsed: number
  /** @deprecated Use plan credit allocation. Legacy model call limit. */
  readonly modelCallsLimit: number
  /** ISO timestamp of the start of the current billing cycle. */
  readonly billingCycleStart: string
  /** ISO timestamp of the end of the current billing cycle. */
  readonly billingCycleEnd: string
  readonly createdAt: string
  readonly updatedAt: string
  /** IDs of all projects this user owns or has been invited to. */
  readonly projectIds: string[]
  /** OAuth provider used to authenticate. */
  readonly provider?: 'github' | 'google' | 'email'
  /** Provider-specific user ID (kept for de-duplication on re-login). */
  readonly providerAccountId?: string
  readonly emailVerified?: boolean
}

// ─── Session user payload ─────────────────────────────────────────────────────

/**
 * The subset of UserProfile that is encoded into the NextAuth
 * JWT and hydrated into every session.user object.
 *
 * Keep this small — it is serialised into an HTTP cookie.
 */
export interface SessionUser {
  /** UUID v4 matching UserProfile.id. */
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly image?: string
  readonly plan: Plan
  /** Current credit balance. */
  readonly credits: number
  /** @deprecated Legacy field. */
  readonly modelCallsUsed: number
  /** @deprecated Legacy field. */
  readonly modelCallsLimit: number
}

// ─── Billing / usage ─────────────────────────────────────────────────────────

/**
 * A single model-call usage record written after every successful
 * model response. Used to populate the usage dashboard and enforce limits.
 */
export interface ModelCallRecord {
  readonly id: string
  readonly userId: string
  readonly projectId: string
  readonly model: import('./models').ModelRole
  readonly taskType: import('./models').TaskType
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  readonly estimatedCostUsd: number
  readonly creditsUsed: number
  readonly latencyMs: number
  readonly timestamp: string
}

/**
 * Aggregated usage stats returned by the billing API for
 * a given user in a given billing period.
 */
export interface UsageSummary {
  readonly userId: string
  readonly periodStart: string
  readonly periodEnd: string
  readonly totalCalls: number
  readonly totalTokens: number
  readonly totalCostUsd: number
  readonly totalCreditsUsed: number
  readonly callsByModel: Record<import('./models').ModelRole, number>
  readonly tokensByModel: Record<import('./models').ModelRole, number>
  readonly callsByTaskType: Record<import('./models').TaskType, number>
  readonly remainingCredits: number
  readonly usagePercent: number
}

// ─── Credit transaction types ────────────────────────────────────────────────

export interface CreditTransactionRecord {
  readonly id: string
  readonly userId: string
  readonly type: 'signup_grant' | 'subscription_grant' | 'topup_purchase' | 'session_deduction' | 'refund' | 'admin_adjustment'
  readonly amount: number
  readonly balanceAfter: number
  readonly description: string
  readonly sessionId?: string
  readonly projectId?: string
  readonly modelUsed?: string
  readonly inputTokens?: number
  readonly outputTokens?: number
  readonly realCostUsd?: number
  readonly stripePaymentIntentId?: string
  readonly creditPackId?: string
  readonly createdAt: string
}

// ─── Team / org ───────────────────────────────────────────────────────────────

/**
 * A VerityFlow team — available on the 'studio' plan.
 * Multiple users share a pool of credits and project state.
 */
export interface Team {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly ownerId: string
  readonly memberIds: string[]
  readonly credits: number
  readonly plan: 'studio'
  readonly createdAt: string
  readonly updatedAt: string
}

export interface TeamMembership {
  readonly userId: string
  readonly teamId: string
  readonly role: 'owner' | 'admin' | 'member' | 'viewer'
  readonly joinedAt: string
}
