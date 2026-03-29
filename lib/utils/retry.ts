/**
 * lib/utils/retry.ts — Exponential backoff withRetry wrapper
 *
 * Retries an async function on 429 (rate limit) and 5xx (server error)
 * responses using exponential backoff with full jitter.
 *
 * Full-jitter formula: delay = random(0, min(maxDelay, base * 2^attempt))
 * This prevents thundering-herd when many parallel calls hit rate limits.
 *
 * Usage:
 *   const result = await withRetry(() => callClaudeAPI(prompt), MODEL_ADAPTER_RETRY_CONFIG)
 */

import { isRateLimitError, extractRetryAfterMs, VerityFlowError } from './errors'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RetryConfig {
  /** Maximum number of attempts (including the first). Default: 3. */
  maxAttempts: number
  /**
   * Base delay in milliseconds for the first retry.
   * Subsequent retries grow exponentially. Default: 500ms.
   */
  baseDelayMs: number
  /** Cap on the maximum delay between retries. Default: 30s. */
  maxDelayMs: number
  /**
   * If true, add random full-jitter to each delay.
   * Strongly recommended in production. Default: true.
   */
  jitter: boolean
  /**
   * Custom predicate that returns true if the error should trigger a retry.
   * Defaults to retrying on rate-limit errors and 5xx status codes.
   */
  shouldRetry?: (err: unknown, attempt: number) => boolean
  /**
   * Optional callback fired before each retry sleep.
   * Useful for logging or emitting metrics.
   */
  onRetry?: (opts: {
    attempt:   number
    delayMs:   number
    err:       unknown
  }) => void
}

export interface RetryResult<T> {
  value:    T
  attempts: number
}

// ─── Default retry predicates ────────────────────────────────────────────────────

/**
 * Default retry predicate: retries on 429s and 5xx HTTP errors.
 * Non-retryable VerityFlow errors (e.g. UsageLimitError) are never retried.
 */
function defaultShouldRetry(err: unknown): boolean {
  // Never retry explicitly non-retryable VF errors
  if (err instanceof VerityFlowError && !err.retryable) return false

  // Retry rate limit errors
  if (isRateLimitError(err)) return true

  // Retry on 5xx status codes from various SDK shapes
  if (err !== null && typeof err === 'object') {
    const e = err as Record<string, unknown>
    const status =
      (typeof e['status'] === 'number'   ? e['status'] : 0) ||
      (typeof e['statusCode'] === 'number' ? e['statusCode'] : 0)
    if (status >= 500 && status < 600) return true
    // Fetch Response shape
    if (typeof e['ok'] === 'boolean' && !e['ok']) {
      const fetchStatus = e['status'] as number | undefined
      if (fetchStatus && fetchStatus >= 500) return true
    }
  }

  return false
}

// ─── Core function ────────────────────────────────────────────────────────────────

/**
 * Wraps an async function with exponential-backoff retry logic.
 *
 * @param fn     - The async operation to retry.
 * @param config - Retry configuration (spread MODEL_ADAPTER_RETRY_CONFIG as a base).
 * @returns      A RetryResult<T> with the value and the number of attempts used.
 *
 * @throws The last error when all attempts are exhausted.
 *
 * @example
 *   const { value, attempts } = await withRetry(
 *     () => anthropic.messages.create({...}),
 *     MODEL_ADAPTER_RETRY_CONFIG,
 *   )
 */
export async function withRetry<T>(
  fn:     () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<RetryResult<T>> {
  const cfg: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>> & Pick<RetryConfig, 'shouldRetry' | 'onRetry'> = {
    maxAttempts: config.maxAttempts ?? 3,
    baseDelayMs: config.baseDelayMs ?? 500,
    maxDelayMs:  config.maxDelayMs  ?? 30_000,
    jitter:      config.jitter      ?? true,
    shouldRetry: config.shouldRetry,
    onRetry:     config.onRetry,
  }

  let lastErr: unknown

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      const value = await fn()
      return { value, attempts: attempt }
    } catch (err) {
      lastErr = err

      const isLast = attempt === cfg.maxAttempts
      if (isLast) break

      // Decide whether to retry
      const shouldRetryFn = cfg.shouldRetry ?? defaultShouldRetry
      if (!shouldRetryFn(err, attempt)) break

      // Calculate delay: for rate limits, respect Retry-After; otherwise exponential
      let delayMs: number
      if (isRateLimitError(err)) {
        delayMs = Math.min(
          extractRetryAfterMs(err, cfg.baseDelayMs * 2 ** attempt),
          cfg.maxDelayMs,
        )
      } else {
        // Exponential backoff: base * 2^(attempt-1)
        const exp = cfg.baseDelayMs * 2 ** (attempt - 1)
        delayMs   = Math.min(exp, cfg.maxDelayMs)
      }

      // Full jitter: random in [0, delayMs]
      if (cfg.jitter) {
        delayMs = Math.floor(Math.random() * delayMs)
      }

      cfg.onRetry?.({ attempt, delayMs, err })

      await sleep(delayMs)
    }
  }

  throw lastErr
}

/** Promise-based sleep. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Pre-built retry configurations ───────────────────────────────────────────────

/**
 * Standard retry configuration for AI model adapter calls.
 * 3 attempts, 1s base delay, 30s max, full jitter.
 */
export const MODEL_ADAPTER_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1_000,
  maxDelayMs:  30_000,
  jitter:      true,
  onRetry: ({ attempt, delayMs, err }) => {
    console.warn(
      `[VerityFlow] Model adapter retry #${attempt} in ${delayMs}ms`,
      err instanceof Error ? err.message : String(err),
    )
  },
}

/**
 * Aggressive retry config for transient Redis / DB operations.
 * 5 attempts, 200ms base, 5s max.
 */
export const DB_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 200,
  maxDelayMs:  5_000,
  jitter:      true,
}

/**
 * Conservative retry config for webhook delivery.
 * 7 attempts, 5s base, 5 min max, no jitter.
 */
export const WEBHOOK_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 7,
  baseDelayMs: 5_000,
  maxDelayMs:  300_000,
  jitter:      false,
}
