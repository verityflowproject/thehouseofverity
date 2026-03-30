'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Plus, AlertTriangle, Folder, Calendar, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const user = session?.user
  const plan = user?.plan || 'free'
  const email = user?.email || ''
  const firstName = user?.name?.split(' ')[0] || 'there'
  
  // Usage data
  const modelCallsUsed = user?.modelCallsUsed || 0
  const modelCallsLimit = user?.modelCallsLimit || 50
  const usagePercent = (modelCallsUsed / modelCallsLimit) * 100

  // Plan limits
  const PROJECT_LIMITS = {
    free: 3,
    pro: 25,
    teams: 100
  }
  const projectLimit = PROJECT_LIMITS[plan]

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status])

  // Get warning banner config
  const getUsageWarning = () => {
    if (usagePercent >= 95) {
      return {
        show: true,
        color: 'bg-red-500/10 border-red-500/30 text-red-300',
        icon: 'text-red-400',
        message: `Critical: You've used ${modelCallsUsed} of ${modelCallsLimit} council sessions (${Math.round(usagePercent)}%). Upgrade to continue building.`
      }
    } else if (usagePercent >= 80) {
      return {
        show: true,
        color: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        icon: 'text-amber-400',
        message: `Warning: You've used ${modelCallsUsed} of ${modelCallsLimit} council sessions (${Math.round(usagePercent)}%). Consider upgrading soon.`
      }
    }
    return { show: false }
  }

  const warning = getUsageWarning()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Personalized Greeting */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-400">
          Continue building with your AI council
        </p>
      </div>

      {/* Usage Warning Banner */}
      {warning.show && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${warning.color}`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${warning.icon}`} />
          <div className="flex-1">
            <p className="text-sm">{warning.message}</p>
          </div>
          <Link 
            href="/dashboard/billing"
            className="flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade now
          </Link>
        </div>
      )}

      {/* Stat Bar */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Plan */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plan</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white capitalize">{plan}</span>
                {plan === 'free' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Free Forever
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="hidden md:block w-px h-12 bg-gray-800" />
            <div className="hidden md:block">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account</div>
              <div className="text-sm text-gray-300">{email}</div>
            </div>

            {/* Projects */}
            <div className="w-px h-12 bg-gray-800 hidden sm:block" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Projects</div>
              <div className="text-lg font-semibold text-white">
                {projects.length} / {projectLimit}
              </div>
            </div>

            {/* Usage */}
            <div className="w-px h-12 bg-gray-800 hidden sm:block" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sessions Used</div>
              <div className="text-lg font-semibold text-white">
                {modelCallsUsed} / {modelCallsLimit}
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          {plan === 'free' && (
            <Link
              href="/dashboard/billing"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
            >
              <span>↑</span>
              <span>Upgrade Plan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Projects</h2>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New project</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-800 rounded w-full mb-2" />
                <div className="h-4 bg-gray-800 rounded w-2/3 mb-4" />
                <div className="flex gap-2 mt-6">
                  <div className="h-6 bg-gray-800 rounded w-16" />
                  <div className="h-6 bg-gray-800 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <Folder className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">No projects yet</h3>
              <p className="text-gray-400">
                Start your first project and let the AI council build production-ready code for you.
              </p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create your first project</span>
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}
    </div>
  )
}

function ProjectCard({ project }) {
  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <Link
      href={`/dashboard/projects/${project._id}`}
      className="group bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all hover:bg-gray-900/70"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full border text-xs font-medium ${statusColors[project.status] || statusColors.active}`}>
          {project.status || 'active'}
        </div>
      </div>

      {project.techStack && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techStack.slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

function NewProjectModal({ onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Redirect to the new project
        window.location.href = `/dashboard/projects/${data.project._id}`
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-8 animate-fade-up">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My SaaS App"
              required
              disabled={isCreating}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A full-stack SaaS with auth, billing, and dashboard..."
              rows={3}
              disabled={isCreating}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label htmlFor="techStack" className="block text-sm font-medium text-gray-300 mb-2">
              Tech Stack (comma-separated)
            </label>
            <input
              id="techStack"
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Next.js, MongoDB, Stripe, NextAuth"
              disabled={isCreating}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
