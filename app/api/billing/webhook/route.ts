/**
 * app/api/billing/webhook/route.ts — Stripe webhook handler
 *
 * POST: Handle Stripe webhook events
 * - checkout.session.completed (subscriptions + credit top-ups)
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_failed
 * - invoice.paid (monthly subscription credit grants)
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { stripe } from '@/lib/stripe'
import { User } from '@/lib/models/User'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import { PLAN_CONFIGS, getPlanByStripePriceId } from '@/lib/credit-costs'
import type { Plan } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

async function verifyWebhook(request: NextRequest): Promise<Stripe.Event | null> {
  try {
    const body      = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) { console.error('[Webhook] No signature found'); return null }
    return stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (error) {
    console.error('[Webhook] Signature verification failed:', error)
    return null
  }
}

function getPlanFromPriceId(priceId: string): Plan {
  return getPlanByStripePriceId(priceId) ?? 'free'
}

function getMonthlyCreditsForPlan(plan: Plan): number {
  return PLAN_CONFIGS[plan]?.monthlyCredits ?? 0
}

export async function POST(request: NextRequest) {
  const event = await verifyWebhook(request)
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const customerId      = checkoutSession.customer as string
        const metadata        = checkoutSession.metadata ?? {}

        if (metadata.type === 'credit_topup') {
          const creditsToAdd = parseInt(metadata.credits ?? '0', 10)
          const packId       = metadata.packId
          const userId       = metadata.userId

          if (creditsToAdd > 0 && userId) {
            const updatedUser = await User.findOneAndUpdate(
              { id: userId },
              { $inc: { credits: creditsToAdd } },
              { new: true },
            )

            if (updatedUser) {
              await CreditTransaction.create({
                id:                    uuidv4(),
                userId,
                type:                  'topup_purchase',
                amount:                creditsToAdd,
                balanceAfter:          updatedUser.credits,
                description:           `Purchased ${creditsToAdd} credits (${packId})`,
                stripePaymentIntentId: checkoutSession.payment_intent as string,
                creditPackId:          packId,
              })
              console.log(`[Webhook] Added ${creditsToAdd} credits to user ${userId}`)
            }
          }
          break
        }

        const subscriptionId = checkoutSession.subscription as string
        const plan           = (metadata.plan as Plan) ?? 'free'

        if (plan !== 'free') {
          const monthlyCredits = getMonthlyCreditsForPlan(plan)

          const updatedUser = await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            {
              plan,
              stripeSubscriptionId: subscriptionId,
              modelCallsLimit:      monthlyCredits,
              $inc: { credits: monthlyCredits },
            },
            { new: true },
          )

          if (updatedUser) {
            await CreditTransaction.create({
              id:          uuidv4(),
              userId:      updatedUser.id,
              type:        'subscription_grant',
              amount:      monthlyCredits,
              balanceAfter:updatedUser.credits,
              description: `${PLAN_CONFIGS[plan].label} plan subscription — ${monthlyCredits.toLocaleString()} credits`,
            })
          }

          console.log(`[Webhook] Upgraded user to ${plan} with ${monthlyCredits} credits`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = subscription.customer as string
        const priceId      = subscription.items.data[0]?.price.id

        if (!priceId) { console.error('[Webhook] No price ID in subscription'); break }

        const plan = getPlanFromPriceId(priceId)
        await User.updateOne(
          { stripeCustomerId: customerId },
          { plan, modelCallsLimit: getMonthlyCreditsForPlan(plan) },
        )
        console.log(`[Webhook] Updated user plan to ${plan}`)
        break
      }

      case 'invoice.paid': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        if (invoice.billing_reason === 'subscription_create') break

        const user = await User.findOne({ stripeCustomerId: customerId })
        if (user && user.plan !== 'free') {
          const monthlyCredits = getMonthlyCreditsForPlan(user.plan as Plan)

          if (monthlyCredits > 0) {
            const updatedUser = await User.findOneAndUpdate(
              { stripeCustomerId: customerId },
              { $inc: { credits: monthlyCredits } },
              { new: true },
            )

            if (updatedUser) {
              await CreditTransaction.create({
                id:          uuidv4(),
                userId:      updatedUser.id,
                type:        'subscription_grant',
                amount:      monthlyCredits,
                balanceAfter:updatedUser.credits,
                description: `Monthly ${PLAN_CONFIGS[user.plan as Plan].label} renewal — ${monthlyCredits.toLocaleString()} credits`,
              })
              console.log(`[Webhook] Granted ${monthlyCredits} monthly credits to user`)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const obj        = event.data.object as Stripe.Subscription | Stripe.Invoice
        const customerId = obj.customer as string

        await User.updateOne(
          { stripeCustomerId: customerId },
          { plan: 'free', stripeSubscriptionId: undefined, modelCallsLimit: 50 },
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
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
