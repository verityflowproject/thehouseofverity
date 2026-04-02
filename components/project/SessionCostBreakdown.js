'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Zap } from 'lucide-react'

const MODEL_LABELS = {
  claude:      'Claude',
  'gpt5.4o':   'GPT-5.4o',
  codestral:   'Codestral',
  gemini:      'Gemini',
  perplexity:  'Perplexity Sonar Pro',
}

const TASK_LABELS = {
  architecture:    'Architecture',
  implementation:  'Implementation',
  research:        'Research',
  refactor:        'Refactor',
  review:          'Review',
  arbitration:     'Arbitration',
}

/**
 * SessionCostBreakdown — Transparent per-session cost summary
 *
 * Shows users exactly what they paid for: raw API cost, platform markup,
 * and the value-add services that make up the difference.
 */
export default function SessionCostBreakdown({ costTransparency, creditsUsed, creditsRemaining }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!costTransparency) return null

  const {
    rawApiCostUsd,
    platformMarkupPercent,
    totalCostUsd,
    totalCreditsCharged,
    creditValueUsd,
    breakdown = [],
    note,
  } = costTransparency

  const totalTokens = breakdown.reduce(
    (sum, b) => sum + (b.inputTokens || 0) + (b.outputTokens || 0),
    0,
  )

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Summary row — always visible */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <div className="text-left">
            <span className="text-sm font-medium text-white">
              Session cost: {(creditsUsed ?? totalCreditsCharged).toLocaleString()} credits
            </span>
            {creditsRemaining !== undefined && (
              <span className="ml-3 text-xs text-gray-500">
                {creditsRemaining.toLocaleString()} remaining
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">
            ${(totalCostUsd ?? 0).toFixed(4)} total value
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded breakdown */}
      {isExpanded && (
        <div className="border-t border-gray-800 px-5 pb-5 pt-4 space-y-5">
          {/* High-level cost summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Raw API cost</div>
              <div className="text-sm font-semibold text-white">
                ${(rawApiCostUsd ?? 0).toFixed(4)}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Platform value</div>
              <div className="text-sm font-semibold text-indigo-300">
                +{platformMarkupPercent?.toFixed(0) ?? 100}%
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Total charged</div>
              <div className="text-sm font-semibold text-white">
                {(totalCreditsCharged ?? 0).toLocaleString()} cr
              </div>
            </div>
          </div>

          {/* Per-model breakdown table */}
          {breakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Per-model breakdown
              </h4>
              <div className="space-y-2">
                {breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-2 border-b border-gray-800/60 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white font-medium truncate">
                        {MODEL_LABELS[item.model] ?? item.model}
                      </span>
                      <span className="text-gray-600 flex-shrink-0">
                        {TASK_LABELS[item.taskType] ?? item.taskType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                      <span className="text-gray-500 hidden sm:block">
                        {((item.inputTokens ?? 0) + (item.outputTokens ?? 0)).toLocaleString()} tok
                      </span>
                      <span className="text-gray-400">${(item.realCostUsd ?? 0).toFixed(4)}</span>
                      <span className="text-indigo-300 w-14 text-right">
                        {(item.creditsUsed ?? 0)} cr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mt-3 pt-2 border-t border-gray-700">
                <span className="text-gray-500">{totalTokens.toLocaleString()} total tokens</span>
                <span className="text-white font-semibold">
                  {(totalCreditsCharged ?? 0).toLocaleString()} credits total
                </span>
              </div>
            </div>
          )}

          {/* What you're paying for */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-800/30 rounded-lg p-3">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-600" />
            <p>{note ?? 'Credits cover the full intelligent system: routing, firewall, review, and arbitration.'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
