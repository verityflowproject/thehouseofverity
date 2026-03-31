/**
 * lib/stripe/client.ts — Stripe client and plan tier definitions
 *
 * Four tiers:
 *   free    — 50 credits on signup, no Stripe price
 *   starter — 2,500 credits/month, STRIPE_STARTER_PRICE_ID
 *   pro     — 8,000 credits/month, STRIPE_PRO_PRICE_ID
 *   studio  — 20,000 credits/month, STRIPE_STUDIO_PRICE_ID
 *
 * Plus one-time credit top-up packs via Stripe Payment mode.
 *
 * Price IDs are read from env vars so they can differ between
 * staging and production without code changes.
 */

import Stripe from 'stripe'
import type { Plan } from '@/lib/types'
import { PLAN_CONFIGS, CREDIT_PACKS, type PlanConfig, type CreditPack } from '@/lib/credit-costs'

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

// ─── Plan tier definitions (re-export from credit-costs) ───────────────────────

export interface PlanTier {
  /** Plan key, maps to the Plan union type. */
  readonly plan:            Plan
  /** Human-readable display name. */
  readonly label:           string
  /** Monthly credits included (0 for free). */
  readonly monthlyCredits:  number
  /** Max credits per day. */
  readonly dailyCreditLimit: number
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
    monthlyCredits:  0,
    dailyCreditLimit: 90,
    stripePriceId:   null,
    description:     'Get started with multi-model AI coding.',
    priceUsdCents:   0,
    features: PLAN_CONFIGS.free.features,
  },

  starter: {
    plan:            'starter',
    label:           'Starter',
    monthlyCredits:  2_500,
    dailyCreditLimit: 300,
    stripePriceId:   process.env.STRIPE_STARTER_PRICE_ID ?? null,
    description:     'For individual developers building regularly.',
    priceUsdCents:   1_900,  // $19 / month
    features: PLAN_CONFIGS.starter.features,
  },

  pro: {
    plan:            'pro',
    label:           'Pro',
    monthlyCredits:  8_000,
    dailyCreditLimit: 1_500,
    stripePriceId:   process.env.STRIPE_PRO_PRICE_ID ?? null,
    description:     'Professional-grade multi-model orchestration.',
    priceUsdCents:   4_900,  // $49 / month
    features: PLAN_CONFIGS.pro.features,
  },

  studio: {
    plan:            'studio',
    label:           'Studio',
    monthlyCredits:  20_000,
    dailyCreditLimit: Infinity,
    stripePriceId:   process.env.STRIPE_STUDIO_PRICE_ID ?? null,
    description:     'Unlimited AI engineering for your whole team.',
    priceUsdCents:   9_900,  // $99 / month
    features: PLAN_CONFIGS.studio.features,
  },
} as const

// ─── Helper functions ───────────────────────────────────────────────────────────

/**
 * Look up a plan tier by its Stripe price ID.
 */
export function getPlanByPriceId(priceId: string): PlanTier | undefined {
  return Object.values(PLAN_TIERS).find(
    (t) => t.stripePriceId === priceId,
  )
}

/**
 * Return the monthly credit allocation for a given plan.
 */
export function getCallLimitForPlan(plan: Plan | string): number {
  return (PLAN_TIERS[plan as Plan] ?? PLAN_TIERS.free).monthlyCredits
}

/**
 * Return the full PlanTier object for a given plan slug.
 */
export function getPlanTier(plan: Plan | string): PlanTier {
  return PLAN_TIERS[plan as Plan] ?? PLAN_TIERS.free
}

/**
 * Build the line_items array for Stripe Checkout (subscription).
 * Returns null for the free tier (no checkout needed).
 */
export function buildCheckoutLineItems(
  plan: Plan,
): Stripe.Checkout.SessionCreateParams.LineItem[] | null {
  const tier = PLAN_TIERS[plan]
  if (!tier.stripePriceId) return null
  return [{ price: tier.stripePriceId, quantity: 1 }]
}

// Re-export credit packs and plan configs for convenience
export { PLAN_CONFIGS, CREDIT_PACKS }
export type { PlanConfig, CreditPack }
