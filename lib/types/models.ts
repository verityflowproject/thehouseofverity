/**
 * models.ts — Core domain enumerations for VerityFlow
 *
 * Defines every model role, task type, plan tier, severity level,
 * and status primitive used across the entire application.
 * All union types are declared as string literals so they are
 * fully tree-shakeable and serialisable over the wire.
 */

// ─── AI Model roles ──────────────────────────────────────────────────────────

/**
 * The five AI model slots in the VerityFlow orchestrator.
 * 'gpt5.4o' is kept as a single string literal to match the OpenAI product
 * name exactly; consumers should use the MODEL_LABELS map for display.
 */
export type ModelRole =
  | 'claude'
  | 'gpt5.4o'
  | 'codestral'
  | 'gemini'
  | 'perplexity'

/** Ordered list of all model roles (useful for iteration / validation). */
export const MODEL_ROLES: readonly ModelRole[] = [
  'claude',
  'gpt5.4o',
  'codestral',
  'gemini',
  'perplexity',
] as const

/** Human-readable display labels for each model role. */
export const MODEL_LABELS: Record<ModelRole, string> = {
  claude:      'Claude 3.5 Sonnet',
  'gpt5.4o':   'GPT-4.5o',
  codestral:   'Codestral',
  gemini:      'Gemini 1.5 Pro',
  perplexity:  'pplx-70b-online',
} as const

/** Brand color (hex) associated with each model role in the design system. */
export const MODEL_COLORS: Record<ModelRole, string> = {
  claude:      '#f97316',
  'gpt5.4o':   '#10b981',
  codestral:   '#f59e0b',
  gemini:      '#3b82f6',
  perplexity:  '#8b5cf6',
} as const

// ─── Task types ──────────────────────────────────────────────────────────────

/**
 * Every type of task the orchestrator can assign to a model.
 *
 * - architecture   : Design decisions — file tree, data models, API surface
 * - implementation : Write or modify production code
 * - research       : Web-grounded lookup (Perplexity-led)
 * - refactor       : Improve existing code without changing external behaviour
 * - review         : Critique and rate another model's output
 * - arbitration    : Break a tie or synthesise conflicting council votes
 */
export type TaskType =
  | 'architecture'
  | 'implementation'
  | 'research'
  | 'refactor'
  | 'review'
  | 'arbitration'

export const TASK_TYPES: readonly TaskType[] = [
  'architecture',
  'implementation',
  'research',
  'refactor',
  'review',
  'arbitration',
] as const

// ─── User / billing plan ─────────────────────────────────────────────────────

/**
 * Subscription plan tiers for VerityFlow accounts.
 *
 * - free    : 50 credits on signup, basic access
 * - starter : Monthly credits, extended limits
 * - pro     : High-volume credits, priority routing
 * - studio  : Maximum credits, unlimited daily usage
 */
export type Plan = 'free' | 'starter' | 'pro' | 'studio'

export const PLAN_LABELS: Record<Plan, string> = {
  free:    'Free',
  starter: 'Starter',
  pro:     'Pro',
  studio:  'Studio',
} as const

/** Default monthly credit allocation per plan. */
export const PLAN_CREDIT_ALLOCATIONS: Record<Plan, number> = {
  free:    0,       // 50 one-time on signup
  starter: 2_500,
  pro:     8_000,
  studio:  20_000,
} as const

/** Daily credit usage limits per plan. */
export const PLAN_DAILY_CREDIT_LIMITS: Record<Plan, number> = {
  free:    90,
  starter: 300,
  pro:     1_500,
  studio:  Infinity,
} as const

/** @deprecated Use PLAN_CREDIT_ALLOCATIONS instead. Kept for backward compat. */
export const PLAN_CALL_LIMITS: Record<Plan, number> = {
  free:    50,
  starter: 2_500,
  pro:     8_000,
  studio:  20_000,
} as const

// ─── Severity levels ─────────────────────────────────────────────────────────

/**
 * Shared severity scale used by flagged issues, review entries,
 * and open questions throughout the system.
 */
export type Severity = 'info' | 'warning' | 'error' | 'critical'

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  info:     0,
  warning:  1,
  error:    2,
  critical: 3,
} as const

// ─── Generic status ───────────────────────────────────────────────────────────

/** Generic async-operation status shared by tasks and council sessions. */
export type OperationStatus =
  | 'pending'
  | 'running'
  | 'voting'
  | 'arbitrating'
  | 'resolved'
  | 'failed'
  | 'cancelled'

// ─── HTTP methods ─────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

// ─── Relation cardinality ─────────────────────────────────────────────────────

export type RelationCardinality = 'one-to-one' | 'one-to-many' | 'many-to-many'

// ─── Priority ─────────────────────────────────────────────────────────────────

export type Priority = 'low' | 'normal' | 'high' | 'critical'
