/**
 * lib/credit-costs.ts — Centralized VerityFlow Credit & Pricing Configuration
 *
 * Single source of truth for:
 *   - Model costs (input/output per token)
 *   - Margin multiplier
 *   - Credit unit value
 *   - Plan tier definitions (credits, daily limits, prices)
 *   - Credit pack definitions
 *   - Hard token limits per orchestrator role
 *   - Smart routing thresholds
 *
 * NEVER hardcode pricing anywhere else in the codebase.
 * Always import from this file.
 */

import type { Plan } from '@/lib/types/models'

// ─── Margin & Credit Unit ────────────────────────────────────────────────────

/** Platform margin multiplier applied to real cost when converting to credits. */
export const MARGIN_MULTIPLIER = 2.0

/** USD value of a single credit (based on $10 = 1,200 credits). */
export const CREDIT_UNIT_VALUE = 10 / 1200 // ≈ $0.008333

/** Credits granted to new users on signup (free tier). */
export const SIGNUP_FREE_CREDITS = 50

// ─── Model Costs (USD per token) ─────────────────────────────────────────────

export interface ModelPricing {
  readonly input: number   // USD per input token
  readonly output: number  // USD per output token
  readonly label: string   // Human-readable name
}

export const MODEL_COSTS: Record<string, ModelPricing> = {
  claude_sonnet: {
    input: 0.003,
    output: 0.015,
    label: 'Claude Sonnet',
  },
  gemini_flash: {
    input: 0.0001,
    output: 0.0004,
    label: 'Gemini Flash',
  },
  'gpt5.4o': {
    input: 0.0025,
    output: 0.010,
    label: 'GPT-5.4o',
  },
  codestral: {
    input: 0.0003,
    output: 0.0009,
    label: 'Codestral',
  },
  perplexity: {
    input: 0.001,
    output: 0.001,
    label: 'Perplexity Sonar Pro',
  },
} as const

// ─── Model Role → Cost Key Mapping ──────────────────────────────────────────

/** Maps orchestrator model roles to their cost lookup keys. */
export const MODEL_ROLE_TO_COST_KEY: Record<string, string> = {
  claude:      'claude_sonnet',
  'gpt5.4o':   'gpt5.4o',
  codestral:   'codestral',
  gemini:      'gemini_flash',
  perplexity:  'perplexity',
}

// ─── Credit Deduction Formula ────────────────────────────────────────────────

/**
 * Calculate the number of credits to deduct for a model call.
 *
 * Formula: credits_used = real_cost_usd * MARGIN_MULTIPLIER / CREDIT_UNIT_VALUE
 *
 * @param modelRole - The model role key (e.g., 'claude', 'gpt5.4o')
 * @param inputTokens - Number of input/prompt tokens
 * @param outputTokens - Number of output/completion tokens
 * @returns Number of credits to deduct (rounded up to nearest integer)
 */
export function calculateCreditsUsed(
  modelRole: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costKey = MODEL_ROLE_TO_COST_KEY[modelRole] ?? 'gpt5.4o'
  const pricing = MODEL_COSTS[costKey] ?? MODEL_COSTS['gpt5.4o']

  const realCostUsd =
    (inputTokens * pricing.input) / 1000 +
    (outputTokens * pricing.output) / 1000

  const credits = (realCostUsd * MARGIN_MULTIPLIER) / CREDIT_UNIT_VALUE

  // Always round up — never give free fractions
  return Math.max(1, Math.ceil(credits))
}

/**
 * Estimate the real USD cost for a model call (before margin).
 */
export function calculateRealCostUsd(
  modelRole: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costKey = MODEL_ROLE_TO_COST_KEY[modelRole] ?? 'gpt5.4o'
  const pricing = MODEL_COSTS[costKey] ?? MODEL_COSTS['gpt5.4o']

  return (
    (inputTokens * pricing.input) / 1000 +
    (outputTokens * pricing.output) / 1000
  )
}

// ─── Hard Token Limits Per Orchestrator Role ─────────────────────────────────

export const HARD_TOKEN_LIMITS: Record<string, number> = {
  architect:    2000,
  generalist:   1500,
  implementer:  4000,
  refactor:     2000,
  researcher:   1000,
}

/** Map task types to role limits */
export const TASK_TYPE_TOKEN_LIMITS: Record<string, number> = {
  architecture:     2000,
  implementation:   4000,
  research:         1000,
  refactor:         2000,
  review:           1500,
  arbitration:      2000,
}

// ─── Smart Routing: Task Complexity Classification ──────────────────────────

export type TaskComplexity = 'simple' | 'complex'

/** Simple task keywords → route to cheap model */
const SIMPLE_TASK_PATTERNS = [
  /\brename\b/i,
  /\bfix typo\b/i,
  /\bsummarize\b/i,
  /\bformat\b/i,
  /\badd comment/i,
  /\bupdate import/i,
  /\bchange (variable|name|string|text)/i,
  /\bsimple\b/i,
  /\bminor\b/i,
  /\btrivial\b/i,
]

/** Complex task keywords → route to premium model */
const COMPLEX_TASK_PATTERNS = [
  /\barchitecture\b/i,
  /\bsystem design\b/i,
  /\bdebug(ging)?\b/i,
  /\brace condition\b/i,
  /\bAPI integration\b/i,
  /\bsecurity\b/i,
  /\boptimiz/i,
  /\bscalable\b/i,
  /\bcomplex\b/i,
  /\brefactor\b/i,
  /\bmigrat/i,
]

/**
 * Classify a prompt as simple or complex for smart routing.
 */
export function classifyTaskComplexity(prompt: string): TaskComplexity {
  let simpleScore = 0
  let complexScore = 0

  for (const pattern of SIMPLE_TASK_PATTERNS) {
    if (pattern.test(prompt)) simpleScore++
  }
  for (const pattern of COMPLEX_TASK_PATTERNS) {
    if (pattern.test(prompt)) complexScore++
  }

  // Default to complex if no signal (safety-first)
  if (simpleScore === 0 && complexScore === 0) return 'complex'
  return complexScore >= simpleScore ? 'complex' : 'simple'
}

// ─── Plan Tier Definitions ───────────────────────────────────────────────────

export interface PlanConfig {
  readonly plan: Plan
  readonly label: string
  readonly monthlyCredits: number      // Credits included per month (0 for free)
  readonly dailyCreditLimit: number    // Max credits usable per day (Infinity for unlimited)
  readonly maxProjects: number
  readonly priceUsdCents: number       // Monthly subscription price in cents
  readonly stripePriceEnvKey: string | null  // Env var name for Stripe price ID
  readonly features: string[]
  readonly popular: boolean
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  free: {
    plan: 'free',
    label: 'Free',
    monthlyCredits: 0,
    dailyCreditLimit: 90,
    maxProjects: 3,
    priceUsdCents: 0,
    stripePriceEnvKey: null,
    features: [
      '50 credits on signup',
      'All 5 AI models',
      '3 projects',
      '~3 council sessions/day',
      'Hallucination firewall',
      'BYOK supported',
    ],
    popular: false,
  },
  starter: {
    plan: 'starter',
    label: 'Starter',
    monthlyCredits: 2500,
    dailyCreditLimit: 300,
    maxProjects: 10,
    priceUsdCents: 1900, // $19/mo
    stripePriceEnvKey: 'STRIPE_STARTER_PRICE_ID',
    features: [
      '2,500 credits/month',
      'Everything in Free',
      '10 projects',
      '~10 council sessions/day',
      'Extended session history',
      'Email support',
      'BYOK supported',
    ],
    popular: false,
  },
  pro: {
    plan: 'pro',
    label: 'Pro',
    monthlyCredits: 8000,
    dailyCreditLimit: 1500,
    maxProjects: 50,
    priceUsdCents: 4900, // $49/mo
    stripePriceEnvKey: 'STRIPE_PRO_PRICE_ID',
    features: [
      '8,000 credits/month',
      'Everything in Starter',
      '50 projects',
      '~50 council sessions/day',
      'Priority model routing',
      'Usage analytics dashboard',
      'Priority support',
      'BYOK supported',
    ],
    popular: true,
  },
  studio: {
    plan: 'studio',
    label: 'Studio',
    monthlyCredits: 20000,
    dailyCreditLimit: Infinity,
    maxProjects: 999,
    priceUsdCents: 9900, // $99/mo
    stripePriceEnvKey: 'STRIPE_STUDIO_PRICE_ID',
    features: [
      '20,000 credits/month',
      'Everything in Pro',
      'Unlimited projects',
      'Unlimited daily usage',
      'Custom model routing rules',
      'Team collaboration',
      'Dedicated support & SLA',
      'BYOK supported',
    ],
    popular: false,
  },
} as const

// ─── Credit Pack Definitions (One-Time Top-Up) ───────────────────────────────

export interface CreditPack {
  readonly id: string
  readonly name: string
  readonly credits: number
  readonly priceUsdCents: number
  readonly stripePriceEnvKey: string
  readonly savings: string | null
  readonly bestValue: boolean
  readonly effectiveRate: number // USD per credit
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_500',
    name: 'Starter',
    credits: 500,
    priceUsdCents: 500, // $5
    stripePriceEnvKey: 'STRIPE_CREDIT_PACK_500_PRICE_ID',
    savings: null,
    bestValue: false,
    effectiveRate: 500 / 500 / 100, // $0.01
  },
  {
    id: 'pack_1200',
    name: 'Builder',
    credits: 1200,
    priceUsdCents: 1000, // $10
    stripePriceEnvKey: 'STRIPE_CREDIT_PACK_1200_PRICE_ID',
    savings: 'save 17%',
    bestValue: false,
    effectiveRate: 1000 / 1200 / 100, // $0.0083
  },
  {
    id: 'pack_3000',
    name: 'Pro Pack',
    credits: 3000,
    priceUsdCents: 2000, // $20
    stripePriceEnvKey: 'STRIPE_CREDIT_PACK_3000_PRICE_ID',
    savings: 'save 25%',
    bestValue: true,
    effectiveRate: 2000 / 3000 / 100, // $0.0067
  },
  {
    id: 'pack_8000',
    name: 'Studio',
    credits: 8000,
    priceUsdCents: 4000, // $40
    stripePriceEnvKey: 'STRIPE_CREDIT_PACK_8000_PRICE_ID',
    savings: 'save 33%',
    bestValue: false,
    effectiveRate: 4000 / 8000 / 100, // $0.005
  },
]

// ─── Session Cost Cap ────────────────────────────────────────────────────────

/** If estimated session cost exceeds this, pause and prompt user. */
export const SESSION_COST_CAP_CREDITS = 100

/** Number of model calls per Council session. */
export const CALLS_PER_SESSION = 5

// ─── Helper: Get plan config safely ──────────────────────────────────────────

export function getPlanConfig(plan: string): PlanConfig {
  return PLAN_CONFIGS[plan as Plan] ?? PLAN_CONFIGS.free
}

/** Get the Stripe price ID for a plan from environment variables. */
export function getStripePriceIdForPlan(plan: Plan): string | null {
  const config = PLAN_CONFIGS[plan]
  if (!config.stripePriceEnvKey) return null
  return process.env[config.stripePriceEnvKey] ?? null
}

/** Get the Stripe price ID for a credit pack from environment variables. */
export function getStripePriceIdForPack(packId: string): string | null {
  const pack = CREDIT_PACKS.find((p) => p.id === packId)
  if (!pack) return null
  return process.env[pack.stripePriceEnvKey] ?? null
}

/** Find a credit pack by its Stripe price ID. */
export function getCreditPackByPriceId(priceId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => {
    const envPriceId = process.env[pack.stripePriceEnvKey]
    return envPriceId === priceId
  })
}

/** Find a plan by its Stripe price ID. */
export function getPlanByStripePriceId(priceId: string): Plan | undefined {
  for (const [plan, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.stripePriceEnvKey) {
      const envPriceId = process.env[config.stripePriceEnvKey]
      if (envPriceId === priceId) return plan as Plan
    }
  }
  return undefined
}
