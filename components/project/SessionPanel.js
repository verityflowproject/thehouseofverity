'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, ChevronDown } from 'lucide-react'
import ModelFeed from './ModelFeed'

// Models that are shown as "thinking" during the async API call.
// Order matches the orchestrator pipeline: firewall → architecture → implementation → review.
const THINKING_SEQUENCE = [
  { model: 'perplexity', delayMs: 0 },
  { model: 'claude',     delayMs: 800 },
  { model: 'codestral',  delayMs: 1600 },
  { model: 'gpt',        delayMs: 2400 },
]

function ts() {
  return new Date().toISOString()
}

/**
 * Converts the raw /api/orchestrator response into a flat array of feed events.
 *
 * API shape:
 *   { result: { responses, finalOutputs, flags, tokenUsage }, credits, costTransparency }
 *
 *   responses   – ModelResponse[]   (model, taskType, output, flaggedIssues)
 *   finalOutputs – { [taskId]: string }
 *   flags       – firewall flags object
 */
function parseApiResponse(data) {
  const events = []
  const outputs = []

  const responses   = data?.result?.responses   ?? []
  const finalOutputs = data?.result?.finalOutputs ?? {}
  const flags       = data?.result?.flags        ?? {}

  // Perplexity firewall pass — synthesised from flags or the first perplexity response
  const perplexityRes = responses.find((r) => r.model === 'perplexity')
  if (perplexityRes || flags.hallucinations != null) {
    events.push({
      type:     'firewall',
      verified: flags.dependenciesVerified ?? (perplexityRes ? 1 : 0),
      blocked:  flags.hallucinations       ?? 0,
      warnings: flags.warnings             ?? [],
      timestamp: ts(),
    })
  }

  // One output + optional review event per non-perplexity model response
  for (const response of responses) {
    if (response.model === 'perplexity') continue

    // Output bubble
    const taskOutput = finalOutputs[response.taskId] ?? response.output ?? ''
    events.push({
      type:      'output',
      model:     response.model,
      taskType:  response.taskType,
      code:      taskOutput,
      timestamp: ts(),
    })

    // Collect for the preview panel
    outputs.push({
      taskId:   response.taskId,
      model:    response.model,
      taskType: response.taskType,
      content:  taskOutput,
    })

    // Review event — GPT reviews all other models' outputs
    if (response.flaggedIssues != null) {
      const reviewModel = response.model === 'gpt' ? 'gpt' : 'gpt'
      events.push({
        type:         'review',
        model:        reviewModel,
        authorModel:  response.model,
        outcome:      response.flaggedIssues.length === 0 ? 'approved' : 'patched',
        flaggedIssues: response.flaggedIssues,
        timestamp:    ts(),
      })
    }
  }

  // Credit summary
  const creditsUsed      = data?.credits?.totalCreditsUsed  ?? 0
  const creditsRemaining = data?.credits?.remainingCredits  ?? 0
  if (creditsUsed > 0) {
    events.push({
      type:              'credits',
      creditsUsed,
      creditsRemaining,
      timestamp:         ts(),
    })
  }

  return { events, outputs, creditsUsed, creditsRemaining }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SessionPanel({ projectId, onOutputsReady }) {
  const [prompt, setPrompt]         = useState('')
  const [isRunning, setIsRunning]   = useState(false)
  const [events, setEvents]         = useState([])
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const feedRef         = useRef(null)
  const textareaRef     = useRef(null)
  const thinkingTimers  = useRef([])

  // Auto-scroll feed to bottom when new events arrive
  useEffect(() => {
    const el = feedRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (atBottom) el.scrollTop = el.scrollHeight
  }, [events])

  const handleScroll = () => {
    const el = feedRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }

  const scrollToBottom = () => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }

  const clearThinkingTimers = () => {
    thinkingTimers.current.forEach(clearTimeout)
    thinkingTimers.current = []
  }

  // Start animated thinking bubbles — one per THINKING_SEQUENCE entry
  const startThinking = useCallback(() => {
    THINKING_SEQUENCE.forEach(({ model, delayMs }) => {
      const t = setTimeout(() => {
        setEvents((prev) => [
          ...prev,
          { type: 'thinking', model, timestamp: ts() },
        ])
      }, delayMs)
      thinkingTimers.current.push(t)
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isRunning) return

    const userPrompt = prompt.trim()
    setPrompt('')
    setIsRunning(true)

    // Start fresh session
    setEvents([
      { type: 'system', message: 'Council session initiated', timestamp: ts() },
    ])

    startThinking()

    try {
      const res = await fetch('/api/orchestrator', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ projectId, prompt: userPrompt }),
      })

      clearThinkingTimers()

      const data = await res.json()

      if (!res.ok) {
        setEvents((prev) => [
          ...prev.filter((e) => e.type !== 'thinking'),
          { type: 'error', message: data.error || 'The council failed to respond. Please try again.', timestamp: ts() },
        ])
        return
      }

      const { events: newEvents, outputs } = parseApiResponse(data)

      setEvents((prev) => [
        ...prev.filter((e) => e.type !== 'thinking'),
        { type: 'system', message: 'Session complete', timestamp: ts() },
        ...newEvents,
      ])

      onOutputsReady?.(outputs, data?.sessionId)
    } catch (err) {
      console.error('[SessionPanel] Orchestrator error:', err)
      clearThinkingTimers()
      setEvents((prev) => [
        ...prev.filter((e) => e.type !== 'thinking'),
        { type: 'error', message: 'Network error. Please check your connection and try again.', timestamp: ts() },
      ])
    } finally {
      setIsRunning(false)
    }
  }, [prompt, isRunning, projectId, startThinking, onOutputsReady])

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Cleanup timers on unmount
  useEffect(() => () => clearThinkingTimers(), [])

  const hasEvents = events.length > 0

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Scrollable feed ─────────────────────────────────────────────── */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4"
      >
        {!hasEvents && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Brief the Council</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Describe what you want to build. The council will research, architect, implement, and review your request.
            </p>
          </div>
        )}
        {hasEvents && <ModelFeed events={events} isRunning={isRunning} />}
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <div className="flex justify-center pb-2 flex-shrink-0">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" /> Scroll to bottom
          </button>
        </div>
      )}

      {/* ── Sticky input bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm px-4 py-3">
        <div className={`flex items-end gap-3 bg-gray-900/60 border rounded-xl px-4 py-3 transition-colors ${
          isRunning ? 'border-indigo-500/50' : 'border-gray-700 focus-within:border-indigo-500/70'
        }`}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build…"
            rows={1}
            disabled={isRunning}
            className="flex-1 bg-transparent text-white placeholder:text-gray-600 text-sm resize-none focus:outline-none disabled:opacity-50 max-h-36 overflow-y-auto leading-relaxed"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isRunning}
            className="flex items-center justify-center w-9 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
            title="Brief the council (Ctrl+Enter)"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5 text-right">
          <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px]">Ctrl</kbd>
          {' + '}
          <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px]">↵</kbd>
          {' to submit'}
        </p>
      </div>
    </div>
  )
}
