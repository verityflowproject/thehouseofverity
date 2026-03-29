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
 * - free   : Limited monthly model calls (no council sessions)
 * - pro    : Higher limits + council sessions
 * - teams  : Unlimited calls, shared project state, SSO
 */
export type Plan = 'free' | 'pro' | 'teams'

export const PLAN_LABELS: Record<Plan, string> = {
  free:  'Free',
  pro:   'Pro',
  teams: 'Teams',
} as const

/** Default modelCallsLimit per plan per billing cycle. */
export const PLAN_CALL_LIMITS: Record<Plan, number> = {
  free:  50,
  pro:   2_000,
  teams: Infinity,
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
