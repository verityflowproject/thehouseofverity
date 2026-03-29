/**
 * lib/db/redis.ts — ioredis client with 'vf:' key prefix and lazy connect
 *
 * Key design choices:
 *   - `keyPrefix: 'vf:'`   — every key stored by VerityFlow is namespaced,
 *                            preventing collisions with other services on the
 *                            same Redis instance.
 *   - `lazyConnect: true`  — the TCP connection is deferred until the first
 *                            command, so importing this module never throws
 *                            even if Redis isn't available yet (important for
 *                            build/cold-start safety).
 *   - Global cache          — mirrors the Mongoose pattern; survives Next.js
 *                            hot reloads in development.
 *
 * Usage:
 *   import { redis } from '@/lib/db/redis'
 *   await redis.set('session:xyz', JSON.stringify(data), 'EX', 3600)
 *   const val = await redis.get('session:xyz')
 *
 * Note: All key arguments you pass are automatically prefixed with 'vf:'.
 * When using scan/keys commands, pass 'vf:*' explicitly if you need to
 * operate across the full namespace.
 */

import Redis, { type RedisOptions } from 'ioredis'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

// ─── Global cache type ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __vf_redis: Redis | undefined
}

// ─── Client options ───────────────────────────────────────────────────────────

const REDIS_OPTS: RedisOptions = {
  /**
   * All keys written by VerityFlow are namespaced under 'vf:'.
   * E.g. redis.set('session:abc', ...) stores as 'vf:session:abc'.
   */
  keyPrefix:    'vf:',

  /**
   * Defer the TCP connection until the first command.
   * Prevents module-import-time failures when Redis is not yet ready.
   */
  lazyConnect:  true,

  /** Reconnect with exponential backoff, max 10 s between attempts. */
  retryStrategy: (times: number) => Math.min(times * 200, 10_000),

  /** Do not crash the process on connection errors; emit 'error' events instead. */
  enableOfflineQueue: true,

  maxRetriesPerRequest: 3,

  connectTimeout: 10_000,
  commandTimeout: 5_000,
}

// ─── Singleton factory ────────────────────────────────────────────────────────

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, REDIS_OPTS)

  client.on('connect', () => {
    console.info('[VerityFlow] Redis connected:', REDIS_URL)
  })

  client.on('error', (err: Error) => {
    // Log but do not throw — offline queue handles retry transparently.
    console.error('[VerityFlow] Redis error:', err.message)
  })

  client.on('reconnecting', () => {
    console.warn('[VerityFlow] Redis reconnecting…')
  })

  return client
}

if (!globalThis.__vf_redis) {
  globalThis.__vf_redis = createRedisClient()
}

/**
 * The ioredis client.
 * All keys are automatically prefixed with `vf:` — no manual namespacing needed.
 */
export const redis: Redis = globalThis.__vf_redis

// ─── TTL constants (seconds) ─────────────────────────────────────────────────

/** Standard TTLs for different cache tiers. */
export const REDIS_TTL = {
  /** Short-lived ephemeral data: active task state, streaming tokens. */
  EPHEMERAL:     60,          // 1 minute
  /** Session and auth tokens. */
  SESSION:       60 * 60 * 24 * 7, // 7 days
  /** ProjectState read-through cache. */
  PROJECT_STATE: 60 * 5,     // 5 minutes
  /** Usage counter sync window. */
  USAGE_WINDOW:  60 * 60,    // 1 hour
  /** Model status / health cache. */
  MODEL_STATUS:  30,          // 30 seconds
} as const

// ─── Key builders ─────────────────────────────────────────────────────────────

/**
 * Canonical Redis key constructors.
 * Each returns a string WITHOUT the 'vf:' prefix (ioredis adds it automatically).
 */
export const RedisKeys = {
  projectState:   (projectId: string)           => `project:${projectId}:state`,
  activeTask:     (projectId: string)           => `project:${projectId}:task`,
  modelStatus:    (model: string)               => `model:${model}:status`,
  usageCounter:   (userId: string)              => `usage:${userId}:calls`,
  sessionTokens:  (sessionId: string)           => `session:${sessionId}:tokens`,
  councilSession: (sessionId: string)           => `council:${sessionId}`,
  rateLimitUser:  (userId: string, route: string) => `rl:${userId}:${route}`,
} as const

export default redis
