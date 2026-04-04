'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Clock, Layers } from 'lucide-react'
import SessionPanel from './SessionPanel'
import OutputPreview from './OutputPreview'
import ReviewLog from './ReviewLog'

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',    pulse: false },
  active:   { label: 'Active',   color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',    pulse: true  },
  building: { label: 'Building', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',    pulse: true  },
  review:   { label: 'Review',   color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', pulse: true  },
  complete: { label: 'Complete', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: false },
  error:    { label: 'Error',    color: 'bg-red-500/20 text-red-400 border-red-500/30',        pulse: true  },
}

export default function ProjectWorkspace({ project }) {
  const [outputs, setOutputs]       = useState([])
  const [sessionId, setSessionId]   = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft

  const handleOutputsReady = (newOutputs, newSessionId) => {
    setOutputs(newOutputs)
    setSessionId(newSessionId ?? null)
  }

  return (
    /*
     * Full-viewport flex layout, fitting within the dashboard shell.
     * The dashboard layout already handles the outer chrome (nav, sidebar).
     * We use -m-6 to bleed to the edge of the layout padding, then fill
     * the remaining viewport height.
     */
    <div className="flex flex-col h-[calc(100vh-6rem)] -mx-6 -mb-6">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/60 backdrop-blur-sm flex-shrink-0">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 flex-1 min-w-0">
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-white font-medium truncate">{project.name}</span>
        </nav>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${statusConfig.color}`}>
          {statusConfig.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
          {statusConfig.label}
        </span>
      </div>

      {/* ── Three-panel body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left sidebar */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950/40 flex flex-col overflow-y-auto">
            {/* Project info */}
            <div className="px-4 py-4 border-b border-gray-800/60">
              <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">{project.description}</p>
              )}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs border border-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recent reviews */}
            <div className="flex-1 px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent Reviews</span>
              </div>
              <ReviewLog projectId={project.id} compact />
            </div>
          </aside>
        )}

        {/* Center: chat thread */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <SessionPanel
            projectId={project.id}
            onOutputsReady={handleOutputsReady}
          />
        </div>

        {/* Right: output preview */}
        <div className="w-[380px] flex-shrink-0 border-l border-gray-800 bg-gray-950/40 flex flex-col min-h-0">
          <OutputPreview outputs={outputs} sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
