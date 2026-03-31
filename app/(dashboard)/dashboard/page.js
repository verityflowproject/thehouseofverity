'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Folder, Coins } from 'lucide-react'
import { 
  ProjectCard, 
  NewProjectModal, 
  UsageWarningBanner, 
  UpgradeButton 
} from '@/components/dashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [creditBalance, setCreditBalance] = useState(null)

  const user = session?.user
  const plan = user?.plan || 'free'
  const email = user?.email || ''
  const firstName = user?.name?.split(' ')[0] || 'there'
  
  // Credits from session (fallback) or API
  const credits = creditBalance?.credits ?? user?.credits ?? 0
  const dailyCreditsUsed = creditBalance?.dailyCreditsUsed ?? 0
  const dailyCreditLimit = creditBalance?.dailyCreditLimit ?? 90

  // Plan limits
  const PROJECT_LIMITS = {
    free: 3,
    starter: 10,
    pro: 50,
    studio: 999
  }
  const projectLimit = PROJECT_LIMITS[plan] || 3

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

  // Fetch credit balance
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/credits/balance')
        if (res.ok) {
          const data = await res.json()
          setCreditBalance(data)
        }
      } catch (error) {
        console.error('Failed to fetch credit balance:', error)
      }
    }

    if (status === 'authenticated') {
      fetchCredits()
    }
  }, [status])

  const handleProjectDelete = (projectId) => {
    setProjects(prev => prev.filter(p => p._id !== projectId))
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  // Preview mode for unauthenticated users
  const isPreviewMode = status !== 'authenticated'

  return (
    <div className="space-y-8 relative">
      {/* Preview Overlay for Unauthenticated Users */}
      {isPreviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-md mx-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Sign in to use your dashboard
            </h2>
            <p className="text-gray-400 mb-8">
              Create a free account to start building with the AI Council. 50 credits included.
            </p>
            
            <div className="space-y-3">
              <a
                href="/register"
                className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
              >
                Create free account
              </a>
              <a
                href="/login"
                className="block w-full px-6 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-semibold transition-colors"
              >
                Sign in
              </a>
            </div>

            <p className="text-xs text-gray-600 mt-6">
              No credit card required • 50 free credits
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Content - Always Visible but Blurred for Preview */}
      <div className={isPreviewMode ? 'pointer-events-none filter blur-sm' : ''}>
        {/* Personalized Greeting */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {isPreviewMode ? 'Guest' : firstName}
          </h1>
          <p className="text-gray-400">
            Continue building with your AI council
          </p>
        </div>

      {/* Usage Warning Banner */}
      <UsageWarningBanner 
        credits={credits}
        dailyCreditsUsed={dailyCreditsUsed}
        dailyCreditLimit={dailyCreditLimit}
      />

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

            {/* Credits */}
            <div className="w-px h-12 bg-gray-800 hidden sm:block" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3" /> Credits
              </div>
              <div className="text-lg font-semibold text-white">
                {credits.toLocaleString()}
              </div>
              {dailyCreditLimit > 0 && dailyCreditLimit !== -1 && (
                <div className="text-xs text-gray-500">
                  {dailyCreditsUsed} / {dailyCreditLimit} used today
                </div>
              )}
            </div>
          </div>

          {/* Upgrade/Top-up Buttons */}
          <div className="flex items-center gap-3">
            {plan === 'free' && (
              <UpgradeButton currentPlan={plan} targetPlan="starter" />
            )}
          </div>
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
              <ProjectCard 
                key={project._id} 
                project={project}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Close blurred content wrapper */}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && !isPreviewMode && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            // Modal will handle redirect to project page
          }}
        />
      )}
    </div>
  )
}
