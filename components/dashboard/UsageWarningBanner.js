'use client'

import { Coins, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * UsageWarningBanner — Shows credit warnings
 * - Low credits warning (< 30 credits = less than one session)
 * - Daily limit approaching
 */
export default function UsageWarningBanner({ 
  credits = 0, 
  dailyCreditsUsed = 0, 
  dailyCreditLimit = 90 
}) {
  const isLowCredits = credits < 30 && credits > 0
  const isOutOfCredits = credits <= 0
  const isDailyLimitClose = dailyCreditLimit > 0 && dailyCreditLimit !== -1 && (dailyCreditsUsed / dailyCreditLimit) >= 0.85
  const isDailyLimitReached = dailyCreditLimit > 0 && dailyCreditLimit !== -1 && dailyCreditsUsed >= dailyCreditLimit

  if (isOutOfCredits) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">You're out of credits</p>
            <p className="text-sm text-red-400/80 mt-0.5">
              Top up credits or upgrade your plan to continue using the AI council.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
          >
            Top up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (isLowCredits) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Coins className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium">Credits running low</p>
            <p className="text-sm text-amber-400/80 mt-0.5">
              You have {credits} credits remaining — that's less than one council session (~30 credits).
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors"
          >
            Top up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (isDailyLimitReached) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-orange-300 font-medium">Daily credit limit reached</p>
            <p className="text-sm text-orange-400/80 mt-0.5">
              You've used {dailyCreditsUsed} / {dailyCreditLimit} credits today. Limits reset at midnight.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (isDailyLimitClose) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Coins className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-300 font-medium">Approaching daily limit</p>
            <p className="text-sm text-amber-400/80 mt-0.5">
              {dailyCreditsUsed} / {dailyCreditLimit} credits used today ({Math.round(dailyCreditsUsed / dailyCreditLimit * 100)}%).
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
