'use client'

import { useState } from 'react'
import { Shield, Gavel, XCircle, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'

export const MODEL_CONFIG = {
  claude:     { name: 'Claude',     role: 'Architect',    color: '#FF6B6B', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)' },
  gpt:        { name: 'GPT',        role: 'Reviewer',     color: '#4ECDC4', bg: 'rgba(78,205,196,0.08)',  border: 'rgba(78,205,196,0.2)' },
  'gpt5.4o':  { name: 'GPT',        role: 'Reviewer',     color: '#4ECDC4', bg: 'rgba(78,205,196,0.08)',  border: 'rgba(78,205,196,0.2)' },
  codestral:  { name: 'Codestral',  role: 'Implementer',  color: '#F9C74F', bg: 'rgba(249,199,79,0.08)',  border: 'rgba(249,199,79,0.2)' },
  gemini:     { name: 'Gemini',     role: 'Refactor',     color: '#F38181', bg: 'rgba(243,129,129,0.08)', border: 'rgba(243,129,129,0.2)' },
  perplexity: { name: 'Perplexity', role: 'Researcher',   color: '#AA96DA', bg: 'rgba(170,150,218,0.08)', border: 'rgba(170,150,218,0.2)' },
}

// ── Thinking dots ─────────────────────────────────────────────────────────────

function ThinkingDots({ color }) {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: color,
            animationDelay: `${i * 150}ms`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  )
}

// ── Model avatar ──────────────────────────────────────────────────────────────

function ModelAvatar({ model, size = 'md' }) {
  const config = MODEL_CONFIG[model] || MODEL_CONFIG.claude
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 font-bold`}
      style={{ backgroundColor: `${config.color}20`, border: `1.5px solid ${config.color}50`, color: config.color }}
      title={`${config.name} — ${config.role}`}
    >
      {config.name[0]}
    </div>
  )
}

// ── Code block with expand/collapse ──────────────────────────────────────────

function CodeBlock({ code, model }) {
  const [expanded, setExpanded] = useState(false)
  const lines = (code || '').split('\n')
  const LIMIT = 20
  const truncated = lines.length > LIMIT
  const displayed = expanded ? code : lines.slice(0, LIMIT).join('\n')

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-gray-700/60">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/80 border-b border-gray-700/60">
        <span className="text-xs text-gray-500 font-mono">{lines.length} lines</span>
        {truncated && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> Collapse</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Show all {lines.length} lines</>
            )}
          </button>
        )}
      </div>
      <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto bg-gray-950/80 max-h-[480px] overflow-y-auto leading-relaxed">
        {displayed}
        {!expanded && truncated && <span className="text-gray-600">{'\n'}...</span>}
      </pre>
    </div>
  )
}

// ── Individual bubble components ──────────────────────────────────────────────

function SystemBubble({ message, index }) {
  return (
    <div
      className="flex items-center gap-3 py-2 opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex-1 h-px bg-gray-800" />
      <span className="text-xs text-gray-500 uppercase tracking-widest whitespace-nowrap">{message}</span>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

function ThinkingBubble({ model, index }) {
  const config = MODEL_CONFIG[model] || MODEL_CONFIG.claude
  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <ModelAvatar model={model} />
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: config.color }}>{config.name}</span>
          <span className="text-xs text-gray-500">{config.role}</span>
        </div>
        <ThinkingDots color={config.color} />
      </div>
    </div>
  )
}

function FirewallBubble({ event, index }) {
  const config = MODEL_CONFIG.perplexity
  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <ModelAvatar model="perplexity" />
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold" style={{ color: config.color }}>{config.name}</span>
          <span className="text-xs text-gray-500">{config.role}</span>
          <Shield className="w-3.5 h-3.5" style={{ color: config.color }} />
        </div>
        {event.blocked > 0 ? (
          <p className="text-sm text-red-300 font-medium">
            ⚠ {event.blocked} dependency{event.blocked > 1 ? 'ies' : ''} blocked
          </p>
        ) : (
          <p className="text-sm text-emerald-300 font-medium">
            ✓ {event.verified || 0} dependency{(event.verified || 0) !== 1 ? 'ies' : ''} verified
          </p>
        )}
        {event.warnings?.length > 0 && (
          <div className="mt-2 space-y-1">
            {event.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-300 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {w}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OutputBubble({ event, index }) {
  const config = MODEL_CONFIG[event.model] || MODEL_CONFIG.claude
  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <ModelAvatar model={event.model} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: config.color }}>{config.name}</span>
          <span className="text-xs text-gray-500">{config.role}</span>
          {event.taskType && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">
              {event.taskType}
            </span>
          )}
        </div>
        <CodeBlock code={event.code} model={event.model} />
      </div>
    </div>
  )
}

function ReviewBubble({ event, index }) {
  const config = MODEL_CONFIG[event.model] || MODEL_CONFIG.gpt
  const approved = event.outcome === 'approved'
  const patched = event.outcome === 'patched'

  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <ModelAvatar model={event.model} />
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold" style={{ color: config.color }}>{config.name}</span>
          <span className="text-xs text-gray-500">{config.role}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            approved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            patched  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                       'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {approved ? '✓ Approved' : patched ? '⚡ Patched' : '✗ Rejected'}
          </span>
        </div>
        {event.flaggedIssues?.length > 0 ? (
          <div className="space-y-1">
            {event.flaggedIssues.map((issue, i) => (
              <p key={i} className="text-sm text-amber-300 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{typeof issue === 'string' ? issue : issue.message || JSON.stringify(issue)}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> No issues found
          </p>
        )}
      </div>
    </div>
  )
}

function ArbitrationBubble({ event, index }) {
  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
        <Gavel className="w-4 h-4 text-orange-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-orange-300">Arbitration</span>
          {event.winner && (
            <span className="text-xs text-gray-400">→ {event.winner} selected</span>
          )}
        </div>
        {event.rationale && (
          <p className="text-sm text-gray-300">{event.rationale}</p>
        )}
      </div>
    </div>
  )
}

function ErrorBubble({ event, index }) {
  return (
    <div
      className="flex items-start gap-3 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
        <XCircle className="w-4 h-4 text-red-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] bg-red-500/10 border border-red-500/20">
        <p className="text-sm font-semibold text-red-300 mb-1">Error</p>
        <p className="text-sm text-gray-300">{event.message}</p>
      </div>
    </div>
  )
}

function CreditSummaryBubble({ creditsUsed, creditsRemaining, index }) {
  return (
    <div
      className="flex items-center gap-3 opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex-1 h-px bg-gray-800" />
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Zap className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-indigo-400 font-medium">{creditsUsed} credits used</span>
        <span>·</span>
        <span>{creditsRemaining} remaining</span>
      </div>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

// ── Main feed ─────────────────────────────────────────────────────────────────

export default function ModelFeed({ events, isRunning, creditsUsed, creditsRemaining }) {
  if (!events.length && !isRunning) return null

  return (
    <div className="space-y-4 pb-2">
      {events.map((event, i) => {
        if (event.type === 'system')      return <SystemBubble    key={i} event={event} message={event.message} index={i} />
        if (event.type === 'thinking')    return <ThinkingBubble  key={i} event={event} model={event.model}     index={i} />
        if (event.type === 'firewall')    return <FirewallBubble  key={i} event={event}                          index={i} />
        if (event.type === 'output')      return <OutputBubble    key={i} event={event}                          index={i} />
        if (event.type === 'review')      return <ReviewBubble    key={i} event={event}                          index={i} />
        if (event.type === 'arbitration') return <ArbitrationBubble key={i} event={event}                        index={i} />
        if (event.type === 'error')       return <ErrorBubble     key={i} event={event}                          index={i} />
        if (event.type === 'credits')     return <CreditSummaryBubble key={i} creditsUsed={event.creditsUsed} creditsRemaining={event.creditsRemaining} index={i} />
        return null
      })}
    </div>
  )
}
