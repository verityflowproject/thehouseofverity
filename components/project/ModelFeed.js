'use client'

import { Shield, AlertTriangle, Gavel, XCircle } from 'lucide-react'

const MODEL_CONFIG = {
  claude: { name: 'Claude', role: 'Architect', color: '#FF6B6B' },
  gpt: { name: 'GPT', role: 'Reviewer', color: '#4ECDC4' },
  codestral: { name: 'Codestral', role: 'Implementer', color: '#F9C74F' },
  gemini: { name: 'Gemini', role: 'Context', color: '#F38181' },
  perplexity: { name: 'Perplexity', role: 'Researcher', color: '#AA96DA' },
}

export default function ModelFeed({ events, isRunning }) {
  // Show bouncing dots while running with no events
  if (isRunning && events.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Council Activity</h3>
      
      <div className="space-y-3">
        {events.map((event, i) => (
          <FeedEvent key={i} event={event} index={i} />
        ))}
      </div>
    </div>
  )
}

function FeedEvent({ event, index }) {
  const animationDelay = `${index * 100}ms`

  // System event - centered divider
  if (event.type === 'system') {
    return (
      <div className="flex items-center gap-4 py-2 animate-slide-in-right" style={{ animationDelay }}>
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-xs text-gray-500 uppercase tracking-wider">{event.message}</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
    )
  }

  // Firewall event - Perplexity verification
  if (event.type === 'firewall') {
    const config = MODEL_CONFIG.perplexity
    return (
      <div 
        className="p-4 rounded-lg border animate-slide-in-right"
        style={{ 
          backgroundColor: `${config.color}10`,
          borderColor: `${config.color}30`,
          animationDelay
        }}
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold" style={{ color: config.color }}>{config.name}</span>
              <span className="text-xs text-gray-500">{config.role}</span>
            </div>
            
            {event.blocked > 0 ? (
              <div className="text-sm text-red-300 font-semibold mb-2">
                ⚠️ {event.blocked} dependency(ies) blocked
              </div>
            ) : (
              <div className="text-sm text-emerald-300 font-semibold mb-2">
                ✓ {event.verified} dependency(ies) verified
              </div>
            )}

            {event.warnings && event.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {event.warnings.map((warning, i) => (
                  <div key={i} className="text-xs text-amber-300 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Arbitration event
  if (event.type === 'arbitration') {
    return (
      <div 
        className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg animate-slide-in-right"
        style={{ animationDelay }}
      >
        <div className="flex items-start gap-3">
          <Gavel className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-orange-300 mb-2">
              Arbitration: {event.winner} selected
            </div>
            <p className="text-sm text-gray-300">{event.rationale}</p>
          </div>
        </div>
      </div>
    )
  }

  // Error event
  if (event.type === 'error') {
    return (
      <div 
        className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-slide-in-right"
        style={{ animationDelay }}
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-300 mb-1">Error</div>
            <p className="text-sm text-gray-300">{event.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Thinking event
  if (event.type === 'thinking') {
    const config = MODEL_CONFIG[event.model] || MODEL_CONFIG.claude
    return (
      <div className="flex items-start gap-3 p-3 animate-slide-in-right" style={{ animationDelay }}>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-sm">{config.name}</span>
            <span className="text-xs text-gray-500">{config.role}</span>
          </div>
          <p className="text-sm text-gray-400 italic">{event.message}</p>
        </div>
      </div>
    )
  }

  // Output event - syntax highlighted code
  if (event.type === 'output') {
    const config = MODEL_CONFIG[event.model] || MODEL_CONFIG.codestral
    const lines = event.code?.split('\n') || []
    const truncated = lines.length > 24
    const displayCode = truncated ? lines.slice(0, 24).join('\n') + '\n...' : event.code

    return (
      <div className="animate-slide-in-right" style={{ animationDelay }}>
        <div className="flex items-start gap-3 mb-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
            style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{config.name}</span>
              <span className="text-xs text-gray-500">{config.role}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                {event.taskType || 'output'}
              </span>
            </div>
          </div>
        </div>
        <pre className="ml-6 bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto">
          {displayCode}
        </pre>
        {truncated && (
          <div className="ml-6 mt-1 text-xs text-gray-500">Code truncated (24 of {lines.length} lines shown)</div>
        )}
      </div>
    )
  }

  // Review event
  if (event.type === 'review') {
    const config = MODEL_CONFIG[event.model] || MODEL_CONFIG.gpt
    const hasIssues = event.flaggedIssues && event.flaggedIssues.length > 0

    return (
      <div className="flex items-start gap-3 p-3 animate-slide-in-right" style={{ animationDelay }}>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white text-sm">{config.name}</span>
            <span className="text-xs text-gray-500">{config.role}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              event.outcome === 'approved' 
                ? 'bg-emerald-500/20 text-emerald-400'
                : event.outcome === 'patched'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {event.outcome}
            </span>
          </div>

          {hasIssues ? (
            <div className="space-y-1">
              {event.flaggedIssues.map((issue, i) => (
                <div key={i} className="text-sm text-amber-300 flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-300">✓ Output approved, no issues found</p>
          )}
        </div>
      </div>
    )
  }

  return null
}

// Animation styles
const styles = `
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out forwards;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
