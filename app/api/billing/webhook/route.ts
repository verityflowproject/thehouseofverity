/**
 * app/api/billing/webhook/route.ts — Stripe webhook handler
 *
 * POST: Handle Stripe webhook events
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_failed
 *
 * Must run on Node.js runtime to access raw body
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs'

// Disable body parsing to get raw body for signature verification
export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Verify Stripe signature and parse event
 */
async function verifyWebhook(request: NextRequest): Promise<Stripe.Event | null> {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[Webhook] No signature found')
      return null
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      WEBHOOK_SECRET
    )

    return event
  } catch (error) {
    console.error('[Webhook] Signature verification failed:', error)
    return null
  }
}

/**
 * Get plan from price ID
 */
function getPlanFromPriceId(priceId: string): 'free' | 'pro' | 'teams' {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_TEAMS_PRICE_ID) return 'teams'
  return 'free'
}

/**
 * Get usage limit from plan
 */
function getUsageLimitForPlan(plan: 'free' | 'pro' | 'teams'): number {
  switch (plan) {
    case 'free': return 50
    case 'pro': return 2000
    case 'teams': return 999999 // Unlimited
    default: return 50
  }
}

export async function POST(request: NextRequest) {
  const event = await verifyWebhook(request)

  if (!event) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  await connectMongoose()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const plan = session.metadata?.plan as 'pro' | 'teams'

        if (!plan) {
          console.error('[Webhook] No plan in metadata')
          break
        }

        // Update user plan and subscription ID
        await User.updateOne(
          { stripeCustomerId: customerId },
          {
            plan,
            stripeSubscriptionId: subscriptionId,
            modelCallsLimit: getUsageLimitForPlan(plan),
          }
        )

        console.log(`[Webhook] Upgraded user to ${plan}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        if (!priceId) {
          console.error('[Webhook] No price ID in subscription')
          break
        }

        const plan = getPlanFromPriceId(priceId)

        // Update user plan
        await User.updateOne(
          { stripeCustomerId: customerId },
          {
            plan,
            modelCallsLimit: getUsageLimitForPlan(plan),
          }
        )

        console.log(`[Webhook] Updated user to ${plan}`)
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const obj = event.data.object as Stripe.Subscription | Stripe.Invoice
        const customerId = obj.customer as string

        // Downgrade to free tier
        await User.updateOne(
          { stripeCustomerId: customerId },
          {
            plan: 'free',
            stripeSubscriptionId: null,
            modelCallsLimit: 50,
          }
        )

        console.log('[Webhook] Downgraded user to free')
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
