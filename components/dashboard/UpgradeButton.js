'use client'

import { ArrowUpRight, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * UpgradeButton — Triggers Stripe Checkout for plan upgrade or credit top-up
 */
export default function UpgradeButton({ 
  currentPlan = 'free', 
  targetPlan = 'starter',
  variant = 'default' // 'default' | 'topup'
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      })

      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        console.error('Checkout error:', data.error)
        // If Stripe not configured, redirect to pricing
        router.push('/pricing')
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      router.push('/pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopUp = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: 'pack_1200' }),
      })

      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        console.error('Top-up error:', data.error)
        router.push('/pricing')
      }
    } catch (error) {
      console.error('Top-up failed:', error)
      router.push('/pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const planLabels = {
    starter: 'Starter',
    pro: 'Pro',
    studio: 'Studio',
  }

  if (variant === 'topup') {
    return (
      <button
        onClick={handleTopUp}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Coins className="w-4 h-4" />
        {isLoading ? 'Loading...' : 'Top up credits'}
      </button>
    )
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      <ArrowUpRight className="w-4 h-4" />
      {isLoading ? 'Loading...' : `Upgrade to ${planLabels[targetPlan] || 'Pro'}`}
    </button>
  )
}
