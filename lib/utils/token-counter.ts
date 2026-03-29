/**
 * lib/utils/token-counter.ts — Lightweight character-based token estimator
 *
 * No tiktoken / wasm dependency — runs in any Next.js runtime including Edge.
 * Accuracy: within ~10-15% of actual tokenisation for English prose and code.
 *
 * Rule of thumb: 1 token ≈ 4 characters (GPT-4 BPE, Cl100k_base).
 * Code tends to be denser; we use a slightly higher ratio of 3.8 for accuracy.
 *
 * Per-model context limits (June 2025 published figures):
 *   claude      : 200,000 tokens (Claude 3.5 Sonnet)
 *   gpt5.4o     : 128,000 tokens (GPT-4o)
 *   codestral   :  32,768 tokens (Codestral latest)
 *   gemini      : 1,048,576 tokens (Gemini 1.5 Pro — 1M)
 *   perplexity  : 127,072 tokens (pplx-70b-online)
 *
 * The safe threshold is 75% of the limit so the model has headroom
 * for its own output tokens.
 */

import type { ModelRole } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Characters per token for the character-based estimator. */
const CHARS_PER_TOKEN = 3.8

/** Fraction of the context window reserved for prompt content. */
const SAFE_CONTEXT_THRESHOLD = 0.75

/**
 * Published context-window limits in tokens for each VerityFlow model role.
 * Gemini 1.5 Pro supports up to 1,048,576 tokens (1M).
 */
export const MODEL_CONTEXT_LIMITS: Record<ModelRole, number> = {
  claude:      200_000,
  'gpt5.4o':   128_000,
  codestral:    32_768,
  gemini:    1_048_576,
  perplexity:  127_072,
} as const

/**
 * Maximum output tokens each model can produce per request.
 * Used by adapters to set the max_tokens / max_output_tokens parameter.
 */
export const MODEL_MAX_OUTPUT_TOKENS: Record<ModelRole, number> = {
  claude:      8_192,
  'gpt5.4o':   4_096,
  codestral:   4_096,
  gemini:     32_768,
  perplexity:  4_096,
} as const

// ─── Core estimator ──────────────────────────────────────────────────────────────

/**
 * Estimate the number of tokens in a string.
 * Uses a character-count heuristic calibrated against GPT-4 tokenisation.
 *
 * @example
 *   estimateTokens('Hello, world!')  // → ~3 tokens
 *   estimateTokens(largePrompt)      // accurate within ±15%
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Estimate the token count of an object after JSON serialization.
 * Useful for estimating how much of a ProjectState slice costs.
 */
export function estimateObjectTokens(obj: unknown): number {
  try {
    return estimateTokens(JSON.stringify(obj) ?? '')
  } catch {
    return 0
  }
}

/**
 * Return the safe token budget for a given model:
 * 75% of the model’s context limit (reserving 25% for output tokens).
 *
 * @example
 *   buildContextBudget('codestral') // → 24,576  (75% of 32,768)
 *   buildContextBudget('gemini')    // → 786,432 (75% of 1,048,576)
 */
export function buildContextBudget(
  model:     ModelRole,
  threshold: number = SAFE_CONTEXT_THRESHOLD,
): number {
  return Math.floor((MODEL_CONTEXT_LIMITS[model] ?? 4_096) * threshold)
}

/**
 * Check whether `text` fits within the safe context window of `model`.
 *
 * @param text      - The combined prompt + injected context string.
 * @param model     - The target model role.
 * @param threshold - Context fraction to use (default 0.75).
 * @returns true if the text fits within 75% of the model’s context window.
 */
export function fitsBudget(
  text:      string,
  model:     ModelRole,
  threshold: number = SAFE_CONTEXT_THRESHOLD,
): boolean {
  return estimateTokens(text) <= buildContextBudget(model, threshold)
}

/**
 * Truncate `text` so it fits within `maxTokens`.
 * Truncation is character-based (no sentence splitting) — safe for code and JSON.
 * A truncation marker is appended so models know the context is incomplete.
 */
export function truncateToFitBudget(
  text:      string,
  maxTokens: number,
  marker     = '\n\n[...context truncated to fit context window...]',
): string {
  const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN) - marker.length
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + marker
}

/**
 * Truncate a serialized object to fit within a model’s safe context budget.
 * Returns the (possibly truncated) JSON string.
 */
export function truncateObjectToFit(
  obj:   unknown,
  model: ModelRole,
): string {
  const json   = JSON.stringify(obj, null, 2) ?? '{}'
  const budget = buildContextBudget(model)
  return truncateToFitBudget(json, budget)
}

// ─── Multi-part budget calculator ────────────────────────────────────────────────

export interface ContextBudgetSummary {
  model:           ModelRole
  contextLimit:    number
  safeBudget:      number
  promptTokens:    number
  stateTokens:     number
  totalTokens:     number
  remainingTokens: number
  fits:            boolean
  usagePercent:    number
}

/**
 * Calculate how much of the safe context window a prompt + state slice use.
 *
 * @example
 *   const summary = calculateBudget('claude', userPrompt, stateSlice)
 *   if (!summary.fits) { truncateObjectToFit(stateSlice, 'claude') }
 */
export function calculateBudget(
  model:       ModelRole,
  promptText:  string,
  stateSlice?: unknown,
): ContextBudgetSummary {
  const contextLimit   = MODEL_CONTEXT_LIMITS[model]
  const safeBudget     = buildContextBudget(model)
  const promptTokens   = estimateTokens(promptText)
  const stateTokens    = stateSlice ? estimateObjectTokens(stateSlice) : 0
  const totalTokens    = promptTokens + stateTokens
  const remainingTokens = safeBudget - totalTokens

  return {
    model,
    contextLimit,
    safeBudget,
    promptTokens,
    stateTokens,
    totalTokens,
    remainingTokens,
    fits:         totalTokens <= safeBudget,
    usagePercent: Math.round((totalTokens / safeBudget) * 100),
  }
}
