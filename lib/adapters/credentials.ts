/**
 * lib/adapters/credentials.ts — Credential resolution layer
 *
 * Single source of truth for obtaining API keys used by model adapters.
 * Currently always returns platform-managed keys (managed-only mode).
 *
 * Future enterprise BYO key support:
 *   When the optional enterprise tier is added, this function can:
 *   1. Accept a `userId` parameter
 *   2. Look up user-provided keys from an encrypted Firestore collection
 *   3. Fall back to platform keys if no user key is configured
 *   4. Return `source: 'user_byo'` so the billing layer applies
 *      reduced markup (orchestration fee only, no model API markup)
 *
 * Adapters should call `resolveCredentials(model)` instead of reading
 * `process.env` directly so this abstraction boundary is preserved.
 *
 * Usage:
 *   import { resolveCredentials } from './credentials'
 *   const { apiKey } = resolveCredentials('claude')
 */

import type { ModelRole } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModelCredentials {
  /** The API key to use when calling this model's provider. */
  readonly apiKey:  string
  /**
   * Origin of the key.
   * - 'platform'  : VerityFlow's own managed key (current default)
   * - 'user_byo'  : User-supplied key (future enterprise tier)
   */
  readonly source:  'platform' | 'user_byo'
  /**
   * Whether credits should be deducted at full rate.
   * - platform  : full markup applies (raw API cost + platform value)
   * - user_byo  : orchestration fee only (no API markup)
   */
  readonly applyFullMarkup: boolean
}

// ─── Env key mapping ─────────────────────────────────────────────────────────

const PLATFORM_ENV_KEYS: Record<ModelRole, string> = {
  claude:      'ANTHROPIC_API_KEY',
  'gpt5.4o':   'OPENAI_API_KEY',
  codestral:   'MISTRAL_API_KEY',
  gemini:      'GOOGLE_AI_API_KEY',
  perplexity:  'PERPLEXITY_API_KEY',
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolve the API credentials for a given model.
 *
 * Phase 1 (now): always returns platform-managed keys.
 * Phase 2 (future): accepts optional userId; if the user has a BYO key
 *   configured for this model, returns that instead with reduced markup.
 *
 * @param model   - The model role to resolve credentials for
 * @param _userId - Reserved for future BYO enterprise tier (currently unused)
 * @returns ModelCredentials with apiKey and markup metadata
 */
export function resolveCredentials(
  model: ModelRole,
  _userId?: string,
): ModelCredentials {
  const envKey = PLATFORM_ENV_KEYS[model]
  const apiKey = process.env[envKey] ?? ''

  if (!apiKey) {
    console.warn(`[VerityFlow] Platform API key not set for model "${model}" (env: ${envKey})`)
  }

  return {
    apiKey,
    source:          'platform',
    applyFullMarkup: true,
  }
}

/**
 * Check whether a model's platform API key is configured.
 * Useful for health checks and startup validation.
 */
export function isPlatformKeyConfigured(model: ModelRole): boolean {
  const envKey = PLATFORM_ENV_KEYS[model]
  return Boolean(process.env[envKey])
}
