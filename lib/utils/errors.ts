/**
 * lib/utils/errors.ts — Structured error class hierarchy
 *
 * All VerityFlow errors extend VerityFlowError, which carries:
 *   - code       : machine-readable error code (e.g. 'MODEL_ADAPTER_ERROR')
 *   - statusCode : HTTP status to return (defaults to 500)
 *   - retryable  : whether the caller should retry this operation
 *
 * Serializer and rate-limit detector included at the bottom.
 */

// ─── Base error ───────────────────────────────────────────────────────────────

export class VerityFlowError extends Error {
  /** Machine-readable error code. */
  readonly code:       string
  /** HTTP status code to return to the client. */
  readonly statusCode: number
  /** Whether the operation that produced this error is safe to retry. */
  readonly retryable:  boolean
  /** Optional structured details for logging / debugging. */
  readonly details?:   Record<string, unknown>

  constructor(
    message: string,
    opts: {
      code:        string
      statusCode?: number
      retryable?:  boolean
      details?:    Record<string, unknown>
    },
  ) {
    super(message)
    this.name       = this.constructor.name
    this.code       = opts.code
    this.statusCode = opts.statusCode  ?? 500
    this.retryable  = opts.retryable   ?? false
    this.details    = opts.details
    // Preserve stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// ─── ModelAdapterError ───────────────────────────────────────────────────────

/**
 * Thrown when a call to an AI model adapter fails.
 * Carries the model that failed and the upstream HTTP status if available.
 */
export class ModelAdapterError extends VerityFlowError {
  readonly model:            string
  readonly upstreamStatus?:  number
  readonly upstreamBody?:    string

  constructor(
    message: string,
    opts: {
      model:           string
      upstreamStatus?: number
      upstreamBody?:   string
      retryable?:      boolean
      details?:        Record<string, unknown>
    },
  ) {
    super(message, {
      code:       'MODEL_ADAPTER_ERROR',
      statusCode: opts.upstreamStatus === 429 ? 429 : 502,
      retryable:  opts.retryable ?? (opts.upstreamStatus === 429 || (opts.upstreamStatus ?? 0) >= 500),
      details:    opts.details,
    })
    this.model          = opts.model
    this.upstreamStatus = opts.upstreamStatus
    this.upstreamBody   = opts.upstreamBody
  }
}

// ─── RateLimitError ──────────────────────────────────────────────────────────

/**
 * Thrown when an upstream API or our own rate limiter returns 429.
 * The `retryAfterMs` field tells the retry layer how long to wait.
 */
export class RateLimitError extends VerityFlowError {
  /** Milliseconds to wait before retrying (derived from Retry-After header). */
  readonly retryAfterMs: number
  readonly source:       'upstream' | 'internal'

  constructor(
    message: string,
    opts: {
      retryAfterMs?: number
      source?:       'upstream' | 'internal'
      details?:      Record<string, unknown>
    } = {},
  ) {
    super(message, {
      code:       'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      retryable:  true,
      details:    opts.details,
    })
    this.retryAfterMs = opts.retryAfterMs ?? 60_000
    this.source       = opts.source       ?? 'upstream'
  }
}

// ─── UsageLimitError ─────────────────────────────────────────────────────────

/**
 * Thrown when a user has exhausted their plan’s monthly model call quota.
 * Not retryable — the user must upgrade or wait for the reset.
 */
export class UsageLimitError extends VerityFlowError {
  readonly userId:           string
  readonly plan:             string
  readonly modelCallsUsed:   number
  readonly modelCallsLimit:  number

  constructor(
    opts: {
      userId:          string
      plan:            string
      modelCallsUsed:  number
      modelCallsLimit: number
    },
  ) {
    super(
      `Usage limit reached: ${opts.modelCallsUsed}/${opts.modelCallsLimit} model calls used on the ${opts.plan} plan.`,
      {
        code:       'USAGE_LIMIT_EXCEEDED',
        statusCode: 402,   // Payment Required — prompt to upgrade
        retryable:  false,
        details:    opts,
      },
    )
    this.userId          = opts.userId
    this.plan            = opts.plan
    this.modelCallsUsed  = opts.modelCallsUsed
    this.modelCallsLimit = opts.modelCallsLimit
  }
}

// ─── ProjectStateError ─────────────────────────────────────────────────────────

/**
 * Thrown by the project-state layer when an operation cannot complete:
 * version conflict, document not found, corrupt state, etc.
 */
export class ProjectStateError extends VerityFlowError {
  readonly projectId: string

  constructor(
    message: string,
    opts: {
      projectId:  string
      code?:      string
      retryable?: boolean
      details?:   Record<string, unknown>
    },
  ) {
    super(message, {
      code:       opts.code ?? 'PROJECT_STATE_ERROR',
      statusCode: 409,
      retryable:  opts.retryable ?? false,
      details:    opts.details,
    })
    this.projectId = opts.projectId
  }
}

/** Thrown specifically when an optimistic concurrency conflict is detected. */
export class VersionConflictError extends ProjectStateError {
  readonly expectedVersion: number
  readonly actualVersion:   number

  constructor(opts: {
    projectId:       string
    expectedVersion: number
    actualVersion:   number
  }) {
    super(
      `Version conflict on project ${opts.projectId}: expected v${opts.expectedVersion}, got v${opts.actualVersion}`,
      {
        projectId: opts.projectId,
        code:      'VERSION_CONFLICT',
        retryable: true,   // caller should re-fetch and retry
        details:   opts,
      },
    )
    this.expectedVersion = opts.expectedVersion
    this.actualVersion   = opts.actualVersion
  }
}

// ─── FirewallBlockError ─────────────────────────────────────────────────────────

/**
 * Thrown when a model or API call is blocked by a content-safety firewall,
 * output filter, or policy violation.
 * Not retryable with the same prompt — the caller must modify the request.
 */
export class FirewallBlockError extends VerityFlowError {
  readonly model:    string
  readonly category: string

  constructor(opts: {
    model:     string
    category?: string
    details?:  Record<string, unknown>
  }) {
    super(
      `Request blocked by content safety firewall (model: ${opts.model}, category: ${opts.category ?? 'unspecified'})`,
      {
        code:       'FIREWALL_BLOCKED',
        statusCode: 403,
        retryable:  false,
        details:    opts.details,
      },
    )
    this.model    = opts.model
    this.category = opts.category ?? 'unspecified'
  }
}

// ─── Serializer ────────────────────────────────────────────────────────────────

export interface SerializedError {
  message:    string
  code:       string
  statusCode: number
  retryable:  boolean
  details?:   Record<string, unknown>
}

/**
 * Converts any thrown value to a consistent { message, code, statusCode }
 * envelope suitable for JSON API responses and log aggregation.
 *
 * @example
 *   } catch (err) {
 *     const e = serializeError(err)
 *     return NextResponse.json({ ok: false, error: e }, { status: e.statusCode })
 *   }
 */
export function serializeError(err: unknown): SerializedError {
  if (err instanceof VerityFlowError) {
    return {
      message:    err.message,
      code:       err.code,
      statusCode: err.statusCode,
      retryable:  err.retryable,
      details:    err.details,
    }
  }

  if (err instanceof Error) {
    return {
      message:    err.message,
      code:       'INTERNAL_ERROR',
      statusCode: 500,
      retryable:  false,
    }
  }

  return {
    message:    'An unknown error occurred',
    code:       'UNKNOWN_ERROR',
    statusCode: 500,
    retryable:  false,
  }
}

// ─── Rate-limit detector ────────────────────────────────────────────────────────

type AnyApiResponse = {
  status?:  number
  message?: string
  error?:   string | { message?: string; code?: string }
  code?:    string | number
  type?:    string
}

/**
 * Detects whether any error-shaped value is a rate-limit error from various
 * upstream APIs (Anthropic, OpenAI, Mistral, Google, Perplexity, etc.).
 *
 * Checks:
 *   1. HTTP status 429
 *   2. Error code strings: 'rate_limit_exceeded', 'RATE_LIMIT_EXCEEDED', etc.
 *   3. Message substrings: 'rate limit', 'too many requests'
 *   4. Error type strings: 'rate_limit_error'
 */
export function isRateLimitError(err: unknown): boolean {
  if (err instanceof RateLimitError) return true

  if (err instanceof ModelAdapterError) {
    return err.upstreamStatus === 429
  }

  if (err instanceof VerityFlowError) {
    return err.statusCode === 429 || err.code === 'RATE_LIMIT_EXCEEDED'
  }

  // Inspect raw API response shapes
  if (err !== null && typeof err === 'object') {
    const e = err as AnyApiResponse

    // HTTP status field
    if (e.status === 429) return true

    // Error code strings (OpenAI, Anthropic, Mistral patterns)
    const RATE_CODES = [
      'rate_limit_exceeded',
      'RATE_LIMIT_EXCEEDED',
      'rate_limit',
      'RateLimitError',
      'resource_exhausted',  // Google Gemini
      '429',
    ]
    if (typeof e.code === 'string' && RATE_CODES.includes(e.code)) return true

    // Type field (Anthropic: { type: 'rate_limit_error' })
    if (typeof e.type === 'string' && e.type.toLowerCase().includes('rate_limit')) return true

    // Message substring check
    const msg = typeof e.message === 'string'
      ? e.message.toLowerCase()
      : typeof e.error === 'string'
        ? e.error.toLowerCase()
        : (e.error as { message?: string } | undefined)?.message?.toLowerCase() ?? ''

    if (
      msg.includes('rate limit') ||
      msg.includes('too many requests') ||
      msg.includes('quota exceeded') ||
      msg.includes('requests per minute') ||
      msg.includes('requests per second') ||
      msg.includes('ratelimit')
    ) return true
  }

  return false
}

/**
 * Extracts the Retry-After delay (in ms) from an error, response headers,
 * or falls back to a sensible default.
 */
export function extractRetryAfterMs(
  err: unknown,
  fallbackMs = 60_000,
): number {
  if (err instanceof RateLimitError) return err.retryAfterMs

  if (err !== null && typeof err === 'object') {
    // Some SDK errors expose retry_after (seconds)
    const e = err as Record<string, unknown>
    const raw = e['retryAfter'] ?? e['retry_after'] ?? e['retryAfterSec']
    if (typeof raw === 'number' && raw > 0) return raw * 1_000
    if (typeof raw === 'string') {
      const parsed = parseFloat(raw)
      if (!isNaN(parsed)) return parsed * 1_000
    }
  }

  return fallbackMs
}
