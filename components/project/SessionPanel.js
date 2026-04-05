'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, ChevronDown } from 'lucide-react'
import ModelFeed from './ModelFeed'

function ts() {
  return new Date().toISOString()
}

/**
 * Parse a raw SSE line buffer into discrete JSON events.
 * Each SSE message is `data: <json>\n\n`.
 */
function parseSseChunk(raw) {
  const events = []
  const lines = raw.split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        events.push(JSON.parse(line.slice(6)))
      } catch {
        // incomplete chunk — will be buffered
      }
    }
  }
  return events
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SessionPanel({ projectId, onOutputsReady }) {
  const [prompt, setPrompt]               = useState('')
  const [isRunning, setIsRunning]         = useState(false)
  const [events, setEvents]               = useState([])
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const feedRef        = useRef(null)
  const textareaRef    = useRef(null)
  const readerRef      = useRef(null)   // holds the active ReadableStreamDefaultReader
  const outputsRef     = useRef([])     // accumulate outputs during stream

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

  // Cancel any in-flight stream
  const cancelStream = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.cancel() } catch { /* ignore */ }
      readerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => () => cancelStream(), [cancelStream])

  /**
   * Map a server-sent progress event to one or more feed entries.
   * Returns an array of feed event objects (may be empty for internal events).
   */
  const progressToFeedEvents = useCallback((serverEvent, sessionId) => {
    switch (serverEvent.type) {
      case 'task_start':
        // Show a live "thinking" bubble only for the model that is actually running now
        return [{
          type:      'thinking',
          model:     serverEvent.model,
          taskId:    serverEvent.taskId,
          timestamp: ts(),
        }]

      case 'task_complete': {
        // Replace the thinking bubble for this task with the real output
        // We mark the thinking event with __taskId so we can filter it out
        const feedEvents = []
        // Remove the thinking bubble for this taskId (handled in setEvents below with filter)
        if (serverEvent.taskType !== 'research') {
          feedEvents.push({
            type:      'output',
            model:     serverEvent.model,
            taskType:  serverEvent.taskType,
            code:      serverEvent.output,
            __taskId:  serverEvent.taskId,
            timestamp: ts(),
          })

          // Accumulate output for the preview panel
          outputsRef.current = [
            ...outputsRef.current.filter((o) => o.taskId !== serverEvent.taskId),
            {
              taskId:   serverEvent.taskId,
              model:    serverEvent.model,
              taskType: serverEvent.taskType,
              content:  serverEvent.output,
            },
          ]
          onOutputsReady?.(outputsRef.current, null)
        }

        // Inline review from flagged issues
        if (serverEvent.flaggedIssues != null) {
          feedEvents.push({
            type:         'review',
            model:        'gpt',
            authorModel:  serverEvent.model,
            outcome:      serverEvent.flaggedIssues.length === 0 ? 'approved' : 'patched',
            flaggedIssues: serverEvent.flaggedIssues,
            timestamp:    ts(),
          })
        }

        return { removeThinkingTaskId: serverEvent.taskId, feedEvents }
      }

      case 'firewall_result':
        return [{
          type:      'firewall',
          verified:  serverEvent.verified,
          blocked:   serverEvent.blocked,
          warnings:  serverEvent.warnings ?? [],
          timestamp: ts(),
        }]

      case 'review_start':
        return [{ type: 'system', message: 'GPT reviewing outputs…', timestamp: ts() }]

      case 'review_complete':
        return [{ type: 'system', message: `Review complete — ${serverEvent.approvedCount}/${serverEvent.reviewCount} approved`, timestamp: ts() }]

      case 'arbitration_start':
        return [{ type: 'system', message: `Arbitration — resolving ${serverEvent.conflictCount} conflict${serverEvent.conflictCount !== 1 ? 's' : ''}`, timestamp: ts() }]

      case 'arbitration_complete':
        return [{ type: 'system', message: `Arbitration resolved ${serverEvent.resolved} conflict${serverEvent.resolved !== 1 ? 's' : ''}`, timestamp: ts() }]

      case 'complete': {
        const creditsUsed      = serverEvent.credits?.totalCreditsUsed  ?? 0
        const creditsRemaining = serverEvent.credits?.remainingCredits  ?? 0
        const finalFeedEvents  = [{ type: 'system', message: 'Session complete', timestamp: ts() }]
        if (creditsUsed > 0) {
          finalFeedEvents.push({
            type: 'credits',
            creditsUsed,
            creditsRemaining,
            timestamp: ts(),
          })
        }
        // Final outputs from the complete event
        const finalOutputs = serverEvent.result?.finalOutputs ?? {}
        const responses    = serverEvent.result?.responses    ?? []
        const allOutputs   = responses
          .filter((r) => r.taskType !== 'research')
          .map((r) => ({
            taskId:   r.taskId,
            model:    r.model,
            taskType: r.taskType,
            content:  finalOutputs[r.taskId] ?? r.output ?? '',
          }))

        if (allOutputs.length > 0) {
          onOutputsReady?.(allOutputs, serverEvent.sessionId)
        }
        return { feedEvents: finalFeedEvents, done: true }
      }

      case 'error':
        return [{
          type:      'error',
          message:   serverEvent.message || 'The council failed to respond. Please try again.',
          timestamp: ts(),
        }]

      default:
        return []
    }
  }, [onOutputsReady])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isRunning) return

    const userPrompt = prompt.trim()
    setPrompt('')
    setIsRunning(true)
    outputsRef.current = []

    // Start fresh session feed
    setEvents([{ type: 'system', message: 'Council session initiated', timestamp: ts() }])

    cancelStream()

    try {
      const res = await fetch('/api/orchestrator/stream', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ projectId, prompt: userPrompt }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setEvents((prev) => [
          ...prev,
          { type: 'error', message: data.error || 'The council failed to respond. Please try again.', timestamp: ts() },
        ])
        setIsRunning(false)
        return
      }

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process all complete SSE messages in the buffer
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? '' // keep the last incomplete chunk

        for (const chunk of chunks) {
          if (!chunk.trim()) continue
          const serverEvents = parseSseChunk(chunk + '\n\n')
          for (const serverEvent of serverEvents) {
            const result = progressToFeedEvents(serverEvent)

            // Normalise result — can be array or { removeThinkingTaskId, feedEvents, done }
            let feedEvents = []
            let removeTaskId = null
            let streamDone   = false

            if (Array.isArray(result)) {
              feedEvents = result
            } else if (result && typeof result === 'object') {
              feedEvents   = result.feedEvents ?? []
              removeTaskId = result.removeThinkingTaskId ?? null
              streamDone   = result.done ?? false
            }

            setEvents((prev) => {
              let next = prev
              // Remove the thinking bubble for this task when output arrives
              if (removeTaskId) {
                next = next.filter((e) => !(e.type === 'thinking' && e.taskId === removeTaskId))
              }
              return [...next, ...feedEvents]
            })

            if (streamDone) {
              setIsRunning(false)
              readerRef.current = null
              return
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[SessionPanel] Stream error:', err)
      setEvents((prev) => [
        ...prev,
        { type: 'error', message: 'Network error. Please check your connection and try again.', timestamp: ts() },
      ])
    } finally {
      setIsRunning(false)
      readerRef.current = null
    }
  }, [prompt, isRunning, projectId, cancelStream, progressToFeedEvents])

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

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
              Describe what you want to build. The council will research, architect, implement, and review your request in real time.
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
