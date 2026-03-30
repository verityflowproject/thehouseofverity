'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, RefreshCw, CheckCircle, AlertTriangle, Gavel } from 'lucide-react'

const MODEL_COLORS = {
  claude: '#FF6B6B',
  gpt: '#4ECDC4',
  codestral: '#F9C74F',
  gemini: '#F38181',
  perplexity: '#AA96DA',
}

export default function ReviewLog({ projectId, compact = false }) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  
  // Filters (only in full mode)
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [projectId])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats
  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.outcome === 'approved').length,
    arbitrated: reviews.filter(r => r.arbitrated).length,
    totalTokens: reviews.reduce((sum, r) => sum + (r.tokensUsed || 0), 0)
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (outcomeFilter !== 'all' && review.outcome !== outcomeFilter) return false
    if (modelFilter !== 'all' && review.reviewingModel !== modelFilter) return false
    return true
  })

  // Limit to 5 in compact mode
  const displayReviews = compact ? filteredReviews.slice(0, 5) : filteredReviews

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading reviews...
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Brief the council to start.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar - Full mode only */}
      {!compact && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Reviews</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Approved</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Arbitrated</div>
            <div className="text-2xl font-bold text-orange-400">{stats.arbitrated}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Tokens</div>
            <div className="text-2xl font-bold text-white">{stats.totalTokens.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filter Bar - Full mode only */}
      {!compact && (
        <div className="flex items-center gap-4">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All outcomes</option>
            <option value="approved">Approved</option>
            <option value="patched">Patched</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All models</option>
            <option value="claude">Claude</option>
            <option value="gpt">GPT</option>
            <option value="codestral">Codestral</option>
            <option value="gemini">Gemini</option>
            <option value="perplexity">Perplexity</option>
          </select>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-2">
        {displayReviews.map((review) => (
          <ReviewEntry
            key={review._id}
            review={review}
            isExpanded={expandedId === review._id}
            onToggle={() => setExpandedId(expandedId === review._id ? null : review._id)}
            compact={compact}
          />
        ))}
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchReviews}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  )
}

function ReviewEntry({ review, isExpanded, onToggle, compact }) {
  const reviewerColor = MODEL_COLORS[review.reviewingModel] || '#6366f1'
  const authorColor = MODEL_COLORS[review.authorModel] || '#6366f1'

  const outcomeConfig = {
    approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    patched: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
    rejected: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  }

  const config = outcomeConfig[review.outcome] || outcomeConfig.approved
  const OutcomeIcon = config.icon

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
      {/* Row Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/70 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Model Flow */}
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: reviewerColor }}
            />
            <span className="text-sm text-white font-medium capitalize">
              {review.reviewingModel}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: authorColor }}
            />
            <span className="text-sm text-gray-400 capitalize">
              {review.authorModel}
            </span>
          </div>

          {/* Task Type */}
          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
            {review.taskType}
          </span>

          {/* Summary Preview */}
          {!compact && (
            <span className="text-sm text-gray-500 truncate flex-1">
              {review.outputSummary || 'No summary'}
            </span>
          )}

          {/* Outcome Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
            <OutcomeIcon className="w-3 h-3" />
            <span>{review.outcome}</span>
          </span>

          {/* Arbitration Badge */}
          {review.arbitrated && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs font-medium">
              <Gavel className="w-3 h-3" />
              <span>Arbitrated</span>
            </span>
          )}
        </div>

        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-700 space-y-4 bg-gray-900/30">
          {/* Task Description */}
          {review.taskDescription && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Task</div>
              <p className="text-sm text-gray-300">{review.taskDescription}</p>
            </div>
          )}

          {/* Output Summary */}
          {review.outputSummary && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Output</div>
              <p className="text-sm text-gray-300">{review.outputSummary}</p>
            </div>
          )}

          {/* Flagged Issues */}
          {review.flaggedIssues && review.flaggedIssues.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="text-xs text-amber-400 uppercase tracking-wider mb-2">Flagged Issues</div>
              <ul className="space-y-1">
                {review.flaggedIssues.map((issue, i) => (
                  <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Arbitration Rationale */}
          {review.arbitrationRationale && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="text-xs text-orange-400 uppercase tracking-wider mb-2">Arbitration</div>
              <p className="text-sm text-orange-300">{review.arbitrationRationale}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-800">
            <span>{review.tokensUsed?.toLocaleString() || 0} tokens</span>
            <span>•</span>
            <span>{new Date(review.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
