'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronRight, PanelLeftClose, PanelLeftOpen, Clock, History,
  BookOpen, Pencil, Check, X as XIcon,
} from 'lucide-react'
import SessionPanel from './SessionPanel'
import OutputPreview from './OutputPreview'
import ReviewLog from './ReviewLog'
import SessionCostBreakdown from './SessionCostBreakdown'
import { useSettings } from '@/hooks/use-settings'

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',         pulse: false },
  active:   { label: 'Active',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',         pulse: true  },
  building: { label: 'Building', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',         pulse: true  },
  review:   { label: 'Review',   color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',      pulse: true  },
  complete: { label: 'Complete', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: false },
  error:    { label: 'Error',    color: 'bg-red-500/20 text-red-400 border-red-500/30',             pulse: true  },
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ProjectWorkspace({ project: initialProject }) {
  const settings    = useSettings()
  const compact     = settings.compactMode

  const [project, setProject]             = useState(initialProject)
  const [outputs, setOutputs]             = useState([])
  const [sessionId, setSessionId]         = useState(null)
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [sessionHistory, setSessionHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [costData, setCostData]           = useState(null)

  // Brief editor state
  const [briefText, setBriefText]         = useState(initialProject.brief ?? '')
  const [editingBrief, setEditingBrief]   = useState(false)
  const [savingBrief, setSavingBrief]     = useState(false)
  const briefRef = useRef(null)

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft

  // ── Fetch session history on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      setLoadingHistory(true)
      try {
        const res  = await fetch(`/api/projects/${project.id}/sessions?limit=20`)
        const data = await res.json()
        if (!cancelled && Array.isArray(data.sessions)) {
          setSessionHistory(data.sessions)
        }
      } catch {
        // silently fail — history is supplementary
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [project.id])

  // ── Callbacks ────────────────────────────────────────────────────────────────

  const handleOutputsReady = useCallback((newOutputs, newSessionId) => {
    setOutputs(newOutputs)
    setSessionId(newSessionId ?? null)
  }, [])

  const handleSessionComplete = useCallback(({ sessionId: sid, costTransparency, credits, outputs: finalOutputs }) => {
    setCostData({ costTransparency, credits })

    // Prepend this session to history so it appears immediately
    const newEntry = {
      sessionId:   sid,
      prompt:      '', // we don't easily have it here; will re-fetch to get it
      creditsUsed: credits?.totalCreditsUsed ?? 0,
      createdAt:   new Date().toISOString(),
      outputs:     finalOutputs,
      _local:      true,
    }
    setSessionHistory((prev) => [newEntry, ...prev])

    // Also re-fetch history to get the persisted entry with full data
    fetch(`/api/projects/${project.id}/sessions?limit=20`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) setSessionHistory(data.sessions)
      })
      .catch(() => {})
  }, [project.id])

  const loadHistorySession = useCallback((histSession) => {
    const outputs = (histSession.outputs ?? [])
      .filter((o) => o.taskType !== 'research')
      .map((o) => ({
        taskId:   o.taskId ?? `${o.model}-${o.taskType}`,
        model:    o.model,
        taskType: o.taskType,
        content:  o.output ?? '',
      }))
    setOutputs(outputs)
    setSessionId(histSession.sessionId)
    setCostData(histSession.costBreakdown ? {
      costTransparency: { breakdown: histSession.costBreakdown },
      credits: { totalCreditsUsed: histSession.creditsUsed },
    } : null)
  }, [])

  // ── Brief save ───────────────────────────────────────────────────────────────

  const saveBrief = useCallback(async () => {
    if (savingBrief) return
    setSavingBrief(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ brief: briefText }),
      })
      setProject((p) => ({ ...p, brief: briefText }))
    } catch {
      // Optimistically keep the change; server will catch up on next load
    } finally {
      setSavingBrief(false)
      setEditingBrief(false)
    }
  }, [briefText, project.id, savingBrief])

  const startEditBrief = () => {
    setEditingBrief(true)
    setTimeout(() => briefRef.current?.focus(), 50)
  }

  const cancelBrief = () => {
    setBriefText(project.brief ?? '')
    setEditingBrief(false)
  }

  const px = compact ? 'px-3 py-3' : 'px-4 py-4'

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mx-6 -mb-6">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/60 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <nav className="flex items-center gap-1.5 text-sm text-gray-400 flex-1 min-w-0">
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-white font-medium truncate">{project.name}</span>
        </nav>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
          {statusConfig.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
          {statusConfig.label}
        </span>
      </div>

      {/* ── Three-panel body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950/40 flex flex-col overflow-y-auto">

            {/* Project info */}
            <div className={`${px} border-b border-gray-800/60`}>
              <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">{project.description}</p>
              )}
              {project.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs border border-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Project Brief editor */}
            <div className={`${px} border-b border-gray-800/60`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Project Brief</span>
                </div>
                {!editingBrief && (
                  <button
                    onClick={startEditBrief}
                    className="p-1 text-gray-600 hover:text-gray-300 rounded transition-colors"
                    title="Edit brief"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              {editingBrief ? (
                <div className="space-y-2">
                  <textarea
                    ref={briefRef}
                    value={briefText}
                    onChange={(e) => setBriefText(e.target.value)}
                    rows={4}
                    placeholder="Persistent instructions for the council — tech preferences, constraints, coding style, etc."
                    className="w-full text-xs bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-indigo-500/70"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveBrief}
                      disabled={savingBrief}
                      className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-md transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      {savingBrief ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={cancelBrief}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-md transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={startEditBrief}
                  className={`text-xs leading-relaxed cursor-pointer rounded-md transition-colors hover:bg-gray-800/50 px-1 -mx-1 py-0.5 ${
                    briefText ? 'text-gray-400' : 'text-gray-600 italic'
                  }`}
                >
                  {briefText || 'No brief set. Click to add persistent instructions for the council.'}
                </p>
              )}
            </div>

            {/* Session history */}
            <div className={`${px} border-b border-gray-800/60`}>
              <div className="flex items-center gap-1.5 mb-3">
                <History className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Session History</span>
              </div>

              {loadingHistory ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-800/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : sessionHistory.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No sessions yet. Run a council session to get started.</p>
              ) : (
                <div className="space-y-1">
                  {sessionHistory.map((sess) => (
                    <button
                      key={sess.sessionId ?? sess.id}
                      onClick={() => loadHistorySession(sess)}
                      className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-gray-800/70 ${
                        sessionId === sess.sessionId ? 'bg-indigo-900/30 border border-indigo-500/30' : 'border border-transparent'
                      }`}
                    >
                      <div className="text-gray-300 truncate font-medium">
                        {sess.prompt ? sess.prompt.slice(0, 48) + (sess.prompt.length > 48 ? '…' : '') : 'Session'}
                      </div>
                      <div className="flex items-center justify-between mt-0.5 text-gray-600">
                        <span>{formatDate(sess.createdAt)}</span>
                        <span>{sess.creditsUsed ?? 0} cr</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent reviews */}
            <div className={`flex-1 ${px}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent Reviews</span>
              </div>
              <ReviewLog projectId={project.id} compact />
            </div>
          </aside>
        )}

        {/* ── Center: chat thread ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <SessionPanel
            projectId={project.id}
            onOutputsReady={handleOutputsReady}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* ── Right: output preview + cost breakdown ───────────────────── */}
        <div className="w-[400px] flex-shrink-0 border-l border-gray-800 bg-gray-950/40 flex flex-col min-h-0 overflow-y-auto">
          <OutputPreview outputs={outputs} sessionId={sessionId} />

          {costData && (
            <div className="px-3 pb-3 pt-1 flex-shrink-0">
              <SessionCostBreakdown
                costTransparency={costData.costTransparency}
                creditsUsed={costData.credits?.totalCreditsUsed}
                creditsRemaining={costData.credits?.remainingCredits}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
