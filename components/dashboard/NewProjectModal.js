'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

const PRESET_TECH = [
  'Next.js',
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Stripe',
  'NextAuth',
  'Tailwind CSS',
  'shadcn/ui',
  'tRPC',
  'Prisma',
  'Drizzle'
]

export function NewProjectModal({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTech, setSelectedTech] = useState([])
  const [customTech, setCustomTech] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const modalRef = useRef(null)
  const maxChars = 1000
  const remainingChars = maxChars - description.length

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const toggleTech = (tech) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  const addCustomTech = () => {
    const tech = customTech.trim()
    if (tech && !selectedTech.includes(tech)) {
      setSelectedTech(prev => [...prev, tech])
      setCustomTech('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    if (description.length > maxChars) {
      setError(`Description must be ${maxChars} characters or less`)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          techStack: selectedTech,
        })
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess?.(data.project)
        // Redirect to new project page
        window.location.href = `/dashboard/projects/${data.project._id}`
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch (err) {
      console.error('Create project error:', err)
      setError('Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-8 py-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My AI-Powered SaaS"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Description
              </label>
              <span className={`text-xs ${remainingChars < 100 ? 'text-amber-400' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A full-stack SaaS with authentication, Stripe billing, user dashboard, and AI-powered features..."
              rows={4}
              maxLength={maxChars}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 resize-none"
            />
          </div>

          {/* Tech Stack Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tech Stack
            </label>
            
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_TECH.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  disabled={isSubmitting}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                    selectedTech.includes(tech)
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            {/* Custom Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomTech()
                  }
                }}
                placeholder="Add custom technology..."
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 text-sm"
              />
              <button
                type="button"
                onClick={addCustomTech}
                disabled={isSubmitting || !customTech.trim()}
                className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Selected Tech Display */}
            {selectedTech.length > 0 && (
              <div className="mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="text-xs text-gray-400 mb-2">Selected ({selectedTech.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTech.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded text-xs"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => toggleTech(tech)}
                        disabled={isSubmitting}
                        className="hover:text-indigo-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Brief the council'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
