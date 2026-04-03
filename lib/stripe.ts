/**
 * lib/stripe.ts — Stripe client singleton
 *
 * Single, lazily-initialized Stripe instance shared across all server-side
 * billing routes. Using a singleton prevents creating a new SDK connection
 * on every hot-reload in development or cold-start in production.
 *
 * Environment variable required:
 *   STRIPE_SECRET_KEY — your Stripe secret key (sk_live_* or sk_test_*)
 *
 * Usage:
 *   import { stripe } from '@/lib/stripe'
 *   const session = await stripe.checkout.sessions.create({ ... })
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('[VerityFlow] STRIPE_SECRET_KEY environment variable is not set.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2025-03-31.basil' as any,
  typescript: true,
})
