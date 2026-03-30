'use client'

import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'

export function UpgradeButton({ 
  currentPlan = 'free', 
  targetPlan = 'pro', 
  className = '' 
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // For free users, redirect to Stripe Checkout
      if (currentPlan === 'free') {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: targetPlan })
        })

        const data = await res.json()

        if (res.ok && data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url
        } else {
          alert(data.error || 'Failed to create checkout session')
          setIsLoading(false)
        }
      } 
      // For paid users, redirect to Stripe Customer Portal
      else {
        const res = await fetch('/api/billing/portal', {
          method: 'POST'
        })

        const data = await res.json()

        if (res.ok && data.url) {
          // Redirect to Stripe Billing Portal
          window.location.href = data.url
        } else {
          alert(data.error || 'Failed to access billing portal')
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : currentPlan === 'free' ? (
        <>
          <span>↑</span>
          <span>Upgrade to {targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      ) : (
        <>
          <span>Manage Billing</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  )
}
