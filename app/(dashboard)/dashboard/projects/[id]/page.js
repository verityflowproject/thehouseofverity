import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { Project } from '@/lib/models/Project'
import SessionPanel from '@/components/project/SessionPanel'
import ReviewLog from '@/components/project/ReviewLog'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', pulse: false },
  building: { label: 'Building', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', pulse: true },
  review: { label: 'Review', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', pulse: true },
  complete: { label: 'Complete', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: false },
  error: { label: 'Error', color: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: true },
}

export default async function ProjectDetailPage({ params }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const project = await Project.findOne({ id: params.id, userId: session.user.id })

  if (!project) {
    notFound()
  }

  const status = project.status || 'draft'
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.pulse && (
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                )}
                {statusConfig.label}
              </span>
            </div>
            
            {project.description && (
              <p className="text-lg text-gray-400 mb-4">{project.description}</p>
            )}

            {/* Tech Stack Tags */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Session Panel (2/3) + Review Log (1/3) */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Session Panel - Takes 2 columns */}
        <div className="lg:col-span-2">
          <SessionPanel projectId={project._id.toString()} />
        </div>

        {/* Compact Review Log - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
              <Link
                href={`/dashboard/projects/${project._id}/reviews`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ReviewLog projectId={project._id.toString()} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
