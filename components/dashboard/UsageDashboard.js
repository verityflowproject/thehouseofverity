'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, TrendingUp, DollarSign, Layers } from 'lucide-react'
import Link from 'next/link'

const MODEL_COLORS = {
  claude: '#FF6B6B',
  gpt: '#4ECDC4',
  codestral: '#F9C74F',
  gemini: '#F38181',
  perplexity: '#AA96DA',
}

export function UsageDashboard() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState(30) // 7, 30, or 90 days
  const [usageData, setUsageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const user = session?.user
  const modelCallsUsed = user?.modelCallsUsed || 0
  const modelCallsLimit = user?.modelCallsLimit || 50
  const usagePercent = (modelCallsUsed / modelCallsLimit) * 100

  // Fetch usage stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/usage/stats?days=${period}`)
        if (res.ok) {
          const data = await res.json()
          setUsageData(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period])

  // Determine progress bar color
  const getProgressColor = () => {
    if (usagePercent >= 95) return 'bg-red-500'
    if (usagePercent >= 80) return 'bg-amber-500'
    return 'bg-indigo-500'
  }

  const isCritical = usagePercent >= 95

  return (
    <div className="space-y-8">
      {/* Current Billing Period */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Current Billing Period</h3>
        
        {/* Usage Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Council Sessions</span>
            <span className="text-white font-semibold">
              {modelCallsUsed} / {modelCallsLimit}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <div className="absolute -top-6 right-0 text-xs text-gray-500">
              {Math.round(usagePercent)}%
            </div>
          </div>

          {/* Critical Alert */}
          {isCritical && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-300 font-semibold mb-1">
                  Critical: Session limit reached
                </p>
                <p className="text-sm text-red-300/80">
                  You've used {usagePercent.toFixed(0)}% of your monthly sessions. Upgrade now to continue building.
                </p>
              </div>
              <Link
                href="/dashboard/pricing"
                className="flex-shrink-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade now
              </Link>
            </div>
          )}

          {/* Period Info */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Resets on {new Date(new Date().setDate(1) + 32 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Usage History</h3>
          
          {/* Period Toggle */}
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  period === days
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : usageData ? (
          <div className="space-y-8">
            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageData.summary?.totalSessions || 0}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total Tokens</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {(usageData.summary?.totalTokens || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Est. Cost</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  ${(usageData.summary?.estimatedCost || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Per-Model Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                By Model
              </h4>
              <div className="space-y-4">
                {usageData.byModel?.map((model) => {
                  const percentage = (model.calls / (usageData.summary?.totalSessions || 1)) * 100
                  const color = MODEL_COLORS[model.name.toLowerCase()] || '#6366f1'

                  return (
                    <div key={model.name}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-white font-medium capitalize">{model.name}</span>
                        </div>
                        <div className="text-gray-400">
                          {model.calls} calls • ${model.estimatedCost.toFixed(2)}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily Activity Bar Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Daily Activity
              </h4>
              <div className="h-48 flex items-end justify-between gap-1">
                {usageData.daily?.map((day, i) => {
                  const maxCalls = Math.max(...usageData.daily.map(d => d.calls))
                  const height = maxCalls > 0 ? (day.calls / maxCalls) * 100 : 0

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-800 rounded-t relative group cursor-pointer">
                        <div 
                          className="w-full bg-indigo-500 rounded-t transition-all duration-300 group-hover:bg-indigo-400"
                          style={{ height: `${height}%`, minHeight: day.calls > 0 ? '4px' : '0' }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                          <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap">
                            <div className="text-white font-semibold">{day.calls} calls</div>
                            <div className="text-gray-400">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 rotate-0">
                        {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No usage data available</div>
        )}
      </div>
    </div>
  )
}
