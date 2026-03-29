/**
 * lib/stripe/client.ts — Stripe client and plan tier definitions
 *
 * Three tiers:
 *   free   — 50 model calls / month, no Stripe price
 *   pro    — 2,000 model calls / month, STRIPE_PRO_PRICE_ID
 *   teams  — unlimited model calls, STRIPE_TEAMS_PRICE_ID
 *
 * Price IDs are read from env vars so they can differ between
 * staging and production without code changes.
 */

import Stripe from 'stripe'
import type { Plan } from '@/lib/types'

// ─── Stripe client singleton ──────────────────────────────────────────────────────

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
  typescript:  true,
  appInfo: {
    name:    'VerityFlow',
    version: '1.0.0',
    url:     'https://verityflow.io',
  },
  maxNetworkRetries: 3,
})

// ─── Plan tier definitions ──────────────────────────────────────────────────────

export interface PlanTier {
  /** Plan key, maps to the Plan union type. */
  readonly plan:            Plan
  /** Human-readable display name. */
  readonly label:           string
  /** Max model calls per billing cycle (Infinity for teams). */
  readonly modelCallsLimit: number
  /**
   * Stripe Price ID (monthly recurring).
   * null for the free tier (no payment required).
   */
  readonly stripePriceId:   string | null
  /** Short marketing description. */
  readonly description:     string
  /** Advertised monthly price in USD cents (0 = free). */
  readonly priceUsdCents:   number
  /** Features included at this tier. */
  readonly features:        string[]
}

/**
 * Canonical plan tier definitions.
 * Stripe price IDs are injected from environment variables at runtime.
 */
export const PLAN_TIERS: Record<Plan, PlanTier> = {
  free: {
    plan:            'free',
    label:           'Free',
    modelCallsLimit: 50,
    stripePriceId:   null,
    description:     'Get started with multi-model AI coding.',
    priceUsdCents:   0,
    features: [
      '50 model calls / month',
      'Access to all 5 models',
      '1 active project',
      'Community support',
    ],
  },

  pro: {
    plan:            'pro',
    label:           'Pro',
    modelCallsLimit: 2_000,
    stripePriceId:   process.env.STRIPE_PRO_PRICE_ID ?? null,
    description:     'Professional-grade multi-model orchestration.',
    priceUsdCents:   2_900,   // $29 / month
    features: [
      '2,000 model calls / month',
      'Council sessions (multi-model voting)',
      'Unlimited projects',
      'Priority routing',
      'Usage analytics dashboard',
      'Email support',
    ],
  },

  teams: {
    plan:            'teams',
    label:           'Teams',
    modelCallsLimit: 999_999,  // effectively unlimited
    stripePriceId:   process.env.STRIPE_TEAMS_PRICE_ID ?? null,
    description:     'Unlimited AI engineering for your whole team.',
    priceUsdCents:   9_900,   // $99 / month
    features: [
      'Unlimited model calls',
      'Shared project state',
      'SSO / team management',
      'Custom model routing rules',
      'Dedicated Slack support',
      'SLA guarantee',
    ],
  },
} as const

// ─── Helper functions ───────────────────────────────────────────────────────────

/**
 * Look up a plan tier by its Stripe price ID.
 * Returns undefined when the price ID doesn’t match any known tier
 * (e.g. a legacy price or a test price not configured in env).
 *
 * @example
 *   const tier = getPlanByPriceId('price_pro_abc123')
 *   if (tier) user.plan = tier.plan
 */
export function getPlanByPriceId(priceId: string): PlanTier | undefined {
  return Object.values(PLAN_TIERS).find(
    (t) => t.stripePriceId === priceId,
  )
}

/**
 * Return the model call limit for a given plan.
 * Safe to call with any string — falls back to free limit if plan is unknown.
 *
 * @example
 *   const limit = getCallLimitForPlan('pro')  // → 2000
 *   const limit = getCallLimitForPlan('free') // → 50
 */
export function getCallLimitForPlan(plan: Plan | string): number {
  return (PLAN_TIERS[plan as Plan] ?? PLAN_TIERS.free).modelCallsLimit
}

/**
 * Return the full PlanTier object for a given plan slug.
 * Falls back to free when the plan is unrecognised.
 */
export function getPlanTier(plan: Plan | string): PlanTier {
  return PLAN_TIERS[plan as Plan] ?? PLAN_TIERS.free
}

/**
 * Build the line_items array for Stripe Checkout.
 * Returns null for the free tier (no checkout needed).
 */
export function buildCheckoutLineItems(
  plan: Plan,
): Stripe.Checkout.SessionCreateParams.LineItem[] | null {
  const tier = PLAN_TIERS[plan]
  if (!tier.stripePriceId) return null
  return [{ price: tier.stripePriceId, quantity: 1 }]
}
