'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export function UsageWarningBanner({ modelCallsUsed, modelCallsLimit }) {
  const usagePercent = (modelCallsUsed / modelCallsLimit) * 100

  // Don't show banner if usage is below 80%
  if (usagePercent < 80) {
    return null
  }

  // Determine banner style based on usage level
  const isCritical = usagePercent >= 95
  
  const bannerConfig = isCritical
    ? {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-300',
        icon: 'text-red-400',
        title: 'Critical',
        message: `You've used ${modelCallsUsed} of ${modelCallsLimit} council sessions (${Math.round(usagePercent)}%). Upgrade now to continue building.`
      }
    : {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        icon: 'text-amber-400',
        title: 'Warning',
        message: `You've used ${modelCallsUsed} of ${modelCallsLimit} council sessions (${Math.round(usagePercent)}%). Consider upgrading soon.`
      }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${bannerConfig.bg} ${bannerConfig.border}`}>
      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${bannerConfig.icon}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${bannerConfig.text}`}>
            {bannerConfig.title}
          </span>
        </div>
        <p className={`text-sm ${bannerConfig.text}`}>
          {bannerConfig.message}
        </p>
      </div>
      <Link 
        href="/dashboard/billing"
        className="flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
      >
        Upgrade now
      </Link>
    </div>
  )
}
