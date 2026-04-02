/**
 * app/api/billing/checkout/route.ts — Stripe Checkout session creation
 *
 * POST: Create a Stripe Checkout session for plan upgrade (subscription)
 * Body: { plan: 'starter' | 'pro' | 'studio' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { stripe } from '@/lib/stripe'
import { getStripePriceIdForPlan } from '@/lib/credit-costs'
import type { Plan } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { plan } = body as { plan: Plan }

    if (!plan || !['starter', 'pro', 'studio'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "starter", "pro", or "studio"' },
        { status: 400 },
      )
    }

    const priceId = getStripePriceIdForPlan(plan)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for plan: ' + plan },
        { status: 500 },
      )
    }

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name:  session.user.name || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await User.updateOne({ email: session.user.email }, { stripeCustomerId: customerId })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url:  `${baseUrl}/dashboard?checkout=cancelled`,
      metadata: { userId: user.id, plan },
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId:   checkoutSession.id,
    })
  } catch (error) {
    console.error('[Checkout] Error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
