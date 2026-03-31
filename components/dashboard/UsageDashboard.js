'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, TrendingUp, DollarSign, Layers, Coins, ArrowRight } from 'lucide-react'
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
  const [creditBalance, setCreditBalance] = useState(null)
  const [creditHistory, setCreditHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const user = session?.user
  const credits = creditBalance?.credits ?? user?.credits ?? 0
  const plan = creditBalance?.plan ?? user?.plan ?? 'free'
  const dailyCreditsUsed = creditBalance?.dailyCreditsUsed ?? 0
  const dailyCreditLimit = creditBalance?.dailyCreditLimit ?? 90
  const monthlyCredits = creditBalance?.monthlyCredits ?? 0

  // Fetch usage stats & credit data
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [statsRes, balanceRes, historyRes] = await Promise.all([
          fetch(`/api/usage/stats?days=${period}`),
          fetch('/api/credits/balance'),
          fetch('/api/credits/history?limit=20'),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setUsageData(data)
        }
        if (balanceRes.ok) {
          const data = await balanceRes.json()
          setCreditBalance(data)
        }
        if (historyRes.ok) {
          const data = await historyRes.json()
          setCreditHistory(data.transactions || [])
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [period])

  // Daily usage percentage
  const dailyPercent = dailyCreditLimit > 0 && dailyCreditLimit !== -1 
    ? Math.min((dailyCreditsUsed / dailyCreditLimit) * 100, 100) 
    : 0

  const getProgressColor = () => {
    if (dailyPercent >= 95) return 'bg-red-500'
    if (dailyPercent >= 80) return 'bg-amber-500'
    return 'bg-indigo-500'
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'signup_grant': return '🎉'
      case 'subscription_grant': return '✨'
      case 'topup_purchase': return '💳'
      case 'session_deduction': return '⚡'
      case 'refund': return '↩️'
      default: return '📝'
    }
  }

  const getTransactionColor = (amount) => {
    return amount >= 0 ? 'text-emerald-400' : 'text-red-400'
  }

  return (
    <div className="space-y-8">
      {/* Credit Overview */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-400" />
            Credit Balance
          </h3>
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Top up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Credit Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Available</div>
            <div className="text-2xl font-bold text-white">{credits.toLocaleString()}</div>
            <div className="text-xs text-gray-500">credits</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plan</div>
            <div className="text-2xl font-bold text-white capitalize">{plan}</div>
            {monthlyCredits > 0 && (
              <div className="text-xs text-gray-500">{monthlyCredits.toLocaleString()}/mo</div>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today</div>
            <div className="text-2xl font-bold text-white">{dailyCreditsUsed}</div>
            <div className="text-xs text-gray-500">
              {dailyCreditLimit === -1 ? 'unlimited' : `of ${dailyCreditLimit}`}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. sessions</div>
            <div className="text-2xl font-bold text-white">{Math.floor(credits / 30)}</div>
            <div className="text-xs text-gray-500">at ~30 credits/session</div>
          </div>
        </div>

        {/* Daily Usage Bar */}
        {dailyCreditLimit !== -1 && dailyCreditLimit > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Daily credit usage</span>
              <span className="text-white font-semibold">
                {dailyCreditsUsed} / {dailyCreditLimit}
              </span>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                {Math.round(dailyPercent)}%
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Daily limits reset at midnight UTC. Upgrade your plan for higher daily limits.
            </p>
          </div>
        )}
      </div>

      {/* Credit History */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Credit Activity</h3>
        
        {creditHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No credit activity yet. Start your first council session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {creditHistory.map((tx, i) => (
              <div 
                key={tx.id || i}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getTransactionColor(tx.amount)}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Balance: {tx.balanceAfter?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Usage Breakdown */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Model Usage Breakdown</h3>
          <div className="flex gap-2">
            {[7, 30, 90].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-800 rounded" />
            ))}
          </div>
        ) : usageData?.modelBreakdown && Object.keys(usageData.modelBreakdown).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(usageData.modelBreakdown).map(([model, data]) => {
              const modelData = typeof data === 'object' ? data : { calls: data }
              const calls = modelData.calls || 0
              const totalCalls = Object.values(usageData.modelBreakdown).reduce(
                (acc, d) => acc + (typeof d === 'object' ? d.calls || 0 : d || 0), 0
              )
              const percent = totalCalls > 0 ? (calls / totalCalls) * 100 : 0
              const color = MODEL_COLORS[model] || '#6366f1'

              return (
                <div key={model} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white capitalize">{model}</span>
                    </div>
                    <span className="text-gray-400">
                      {calls} calls ({Math.round(percent)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Layers className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No model usage data yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Start a council session to see your model breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
