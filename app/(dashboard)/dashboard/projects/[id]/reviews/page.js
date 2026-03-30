import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { Project } from '@/lib/models/Project'
import ReviewLog from '@/components/project/ReviewLog'

export default async function ProjectReviewsPage({ params }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  await connectMongoose()
  
  const project = await Project.findOne({
    _id: params.id,
    userId: session.user.id
  }).lean()

  if (!project) {
    notFound()
  }

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
        <Link 
          href={`/dashboard/projects/${project._id}`}
          className="hover:text-white transition-colors"
        >
          {project.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">Reviews</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Review Log</h1>
          <p className="text-lg text-gray-400">
            All council review sessions for this project, including cross-model evaluations and arbitration decisions.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${project._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to session</span>
        </Link>
      </div>

      {/* Full Review Log */}
      <ReviewLog projectId={project._id.toString()} compact={false} />
    </div>
  )
}
