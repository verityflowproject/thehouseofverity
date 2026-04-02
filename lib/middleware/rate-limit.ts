/**
 * lib/middleware/rate-limit.ts — Sliding-window rate limiter
 *
 * Provides per-user, per-plan rate limiting for the orchestrator and
 * other sensitive API routes.
 *
 * Architecture:
 *   - In-memory sliding-window counters keyed by userId
 *   - Two windows: per-minute and per-hour
 *   - Limits are derived from the user's plan tier
 *   - Returns standard RateLimit headers (RFC 9110)
 *
 * Production note: For multi-instance deployments, replace the in-memory
 * store with a Redis-backed implementation (same interface). The function
 * signatures are intentionally identical so the swap is non-breaking.
 *
 * Future BYO enterprise tier: pass `source: 'user_byo'` to apply
 * orchestration-only limits instead of managed-platform limits.
 */

import type { Plan } from '@/lib/types'

// ─── Rate limit config per plan ───────────────────────────────────────────────

export interface PlanRateLimits {
  readonly perMinute:  number   // Max requests per 60-second window
  readonly perHour:    number   // Max requests per 3600-second window
}

export const PLAN_RATE_LIMITS: Record<Plan, PlanRateLimits> = {
  free:    { perMinute:  5, perHour:  30  },
  starter: { perMinute: 15, perHour: 100  },
  pro:     { perMinute: 30, perHour: 300  },
  studio:  { perMinute: 60, perHour: 9999 },
} as const

// ─── In-memory sliding-window store ───────────────────────────────────────────

interface WindowEntry {
  /** ISO timestamps of each request in this window. */
  timestamps: number[]
}

const minuteStore = new Map<string, WindowEntry>()
const hourStore   = new Map<string, WindowEntry>()

/** Prune timestamps older than `windowMs` from an entry. */
function pruneWindow(entry: WindowEntry, windowMs: number, now: number): void {
  const cutoff = now - windowMs
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
}

/** Count requests and advance the counter for a given store and window. */
function checkWindow(
  store: Map<string, WindowEntry>,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): { allowed: boolean; count: number; resetAt: number } {
  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  pruneWindow(entry, windowMs, now)

  const count   = entry.timestamps.length
  const resetAt = now + windowMs - (count > 0 ? now - entry.timestamps[0] : 0)

  if (count >= limit) {
    return { allowed: false, count, resetAt }
  }

  entry.timestamps.push(now)
  return { allowed: true, count: count + 1, resetAt }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitResult {
  /** Whether the request is allowed to proceed. */
  allowed:             boolean
  /** Current request count in the per-minute window. */
  minuteCount:         number
  /** Per-minute limit for this plan. */
  minuteLimit:         number
  /** Current request count in the per-hour window. */
  hourCount:           number
  /** Per-hour limit for this plan. */
  hourLimit:           number
  /** Unix ms when the most-restrictive window resets. */
  resetAtMs:           number
  /** Seconds until the most-restrictive window resets (for Retry-After header). */
  retryAfterSeconds:   number
  /** Human-readable message for the 429 response body. */
  message:             string
}

/**
 * Check whether a request from `userId` on `plan` should be allowed.
 *
 * Call this at the top of any route handler before executing work.
 * If `allowed` is false, return a 429 response using `buildRateLimitResponse`.
 *
 * @param userId - The authenticated user's ID
 * @param plan   - The user's current plan ('free' | 'starter' | 'pro' | 'studio')
 * @returns RateLimitResult with allow/deny decision and header values
 */
export function checkRateLimit(userId: string, plan: Plan): RateLimitResult {
  const now    = Date.now()
  const limits = PLAN_RATE_LIMITS[plan] ?? PLAN_RATE_LIMITS.free

  const minuteResult = checkWindow(minuteStore, userId, limits.perMinute, 60_000,      now)
  const hourResult   = checkWindow(hourStore,   userId, limits.perHour,   3_600_000,   now)

  const allowed  = minuteResult.allowed && hourResult.allowed
  const resetAtMs = Math.max(minuteResult.resetAt, hourResult.resetAt)

  let message = ''
  if (!minuteResult.allowed) {
    message = `Rate limit exceeded. Your ${plan} plan allows ${limits.perMinute} requests per minute. Please wait a moment before retrying.`
  } else if (!hourResult.allowed) {
    message = `Hourly rate limit exceeded. Your ${plan} plan allows ${limits.perHour} requests per hour. Please wait before retrying or upgrade your plan.`
  }

  return {
    allowed,
    minuteCount:       minuteResult.count,
    minuteLimit:       limits.perMinute,
    hourCount:         hourResult.count,
    hourLimit:         limits.perHour,
    resetAtMs,
    retryAfterSeconds: Math.ceil((resetAtMs - now) / 1000),
    message,
  }
}

/**
 * Build a standard set of rate-limit response headers from a RateLimitResult.
 *
 * Include these on every response (not just 429s) for client-side dashboards.
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit-Minute':     String(result.minuteLimit),
    'X-RateLimit-Remaining-Minute': String(Math.max(0, result.minuteLimit - result.minuteCount)),
    'X-RateLimit-Limit-Hour':       String(result.hourLimit),
    'X-RateLimit-Remaining-Hour':   String(Math.max(0, result.hourLimit - result.hourCount)),
    'X-RateLimit-Reset':            String(Math.ceil(result.resetAtMs / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(result.retryAfterSeconds) }),
  }
}
