/**
 * app/api/credits/purchase/route.ts — Credit pack one-time purchase
 *
 * POST: Create a Stripe Checkout session for a one-time credit pack purchase
 * Body: { packId: 'pack_500' | 'pack_1200' | 'pack_3000' | 'pack_8000' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { stripe } from '@/lib/stripe'
import { CREDIT_PACKS, getStripePriceIdForPack } from '@/lib/credit-costs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoose()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { packId } = body

    const pack = CREDIT_PACKS.find((p) => p.id === packId)
    if (!pack) {
      return NextResponse.json(
        { error: 'Invalid credit pack. Valid options: ' + CREDIT_PACKS.map((p) => p.id).join(', ') },
        { status: 400 },
      )
    }

    const priceId = getStripePriceIdForPack(packId)
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for pack: ${packId}` },
        { status: 500 },
      )
    }

    // Look up or create Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await User.updateOne(
        { email: session.user.email },
        { stripeCustomerId: customerId },
      )
    }

    // Create one-time payment Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // One-time, not subscription
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?topup=success&pack=${packId}`,
      cancel_url: `${baseUrl}/dashboard?topup=cancelled`,
      metadata: {
        userId: user.id,
        type: 'credit_topup',
        packId: pack.id,
        credits: String(pack.credits),
      },
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Credits Purchase] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
