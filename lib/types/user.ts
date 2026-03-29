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
  readonly modelCallsUsed: number
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
  readonly modelCallsUsed: number
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
  readonly callsByModel: Record<import('./models').ModelRole, number>
  readonly tokensByModel: Record<import('./models').ModelRole, number>
  readonly callsByTaskType: Record<import('./models').TaskType, number>
  readonly remainingCalls: number
  readonly usagePercent: number
}

// ─── Team / org ───────────────────────────────────────────────────────────────

/**
 * A VerityFlow team — only available on the 'teams' plan.
 * Multiple users share a pool of model calls and project state.
 */
export interface Team {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly ownerId: string
  readonly memberIds: string[]
  readonly modelCallsLimit: number
  readonly modelCallsUsed: number
  readonly plan: 'teams'
  readonly createdAt: string
  readonly updatedAt: string
}

export interface TeamMembership {
  readonly userId: string
  readonly teamId: string
  readonly role: 'owner' | 'admin' | 'member' | 'viewer'
  readonly joinedAt: string
}
