'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Layers, Trash2, ArrowRight } from 'lucide-react'

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    pulse: false
  },
  building: {
    label: 'Building',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    pulse: true
  },
  review: {
    label: 'Review',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    pulse: true
  },
  complete: {
    label: 'Complete',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    pulse: false
  },
  error: {
    label: 'Error',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    pulse: true
  }
}

export function ProjectCard({ project, onDelete }) {
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const status = project.status || 'draft'
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        onDelete?.(project.id)
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const techStack = project.techStack || []
  const visibleTech = techStack.slice(0, 5)
  const overflowCount = techStack.length - 5

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group relative block bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all hover:bg-gray-900/70 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors truncate pr-2">
          {project.name}
        </h3>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Delete Button - Appears on Hover */}
          {showDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors disabled:opacity-50"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {project.description || 'No description provided'}
      </p>

      {/* Status Badge */}
      <div className="mb-4">
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
        >
          {statusConfig.pulse && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
          {statusConfig.label}
        </span>
      </div>

      {/* Tech Stack Tags */}
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {visibleTech.map((tech, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-gray-800/80 text-gray-400 rounded text-xs border border-gray-700"
            >
              {tech}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2 py-1 bg-gray-800/80 text-gray-500 rounded text-xs border border-gray-700">
              +{overflowCount} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          {/* Session Count */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{project.totalSessions || 0} sessions</span>
          </div>
          
          {/* Last Built */}
          {project.lastBuiltAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(project.lastBuiltAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
