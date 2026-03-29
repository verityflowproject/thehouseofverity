/**
 * lib/utils/index.ts — Utility barrel
 *
 * Import from '@/lib/utils' to access all utility modules.
 */

// Error hierarchy + serializer + rate-limit detector
export {
  VerityFlowError,
  ModelAdapterError,
  RateLimitError,
  UsageLimitError,
  ProjectStateError,
  VersionConflictError,
  FirewallBlockError,
  serializeError,
  isRateLimitError,
  extractRetryAfterMs,
} from './errors'
export type { SerializedError } from './errors'

// Retry wrapper
export {
  withRetry,
  MODEL_ADAPTER_RETRY_CONFIG,
  DB_RETRY_CONFIG,
  WEBHOOK_RETRY_CONFIG,
} from './retry'
export type { RetryConfig, RetryResult } from './retry'

// Token counter
export {
  MODEL_CONTEXT_LIMITS,
  MODEL_MAX_OUTPUT_TOKENS,
  estimateTokens,
  estimateObjectTokens,
  buildContextBudget,
  fitsBudget,
  truncateToFitBudget,
  truncateObjectToFit,
  calculateBudget,
} from './token-counter'
export type { ContextBudgetSummary } from './token-counter'

// Project state read/write layer
export {
  getProjectState,
  setProjectState,
  initProjectState,
  mergeProjectState,
  appendReviewEntry,
  appendOpenQuestion,
  resolveOpenQuestion,
  sliceStateForModel,
  acquireStateLock,
  releaseStateLock,
  withStateLock,
} from './project-state'
