import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Project } from '@/lib/models/Project'
import ProjectWorkspace from '@/components/project/ProjectWorkspace'

export default async function ProjectDetailPage({ params }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const project = await Project.findOne({ id: params.id, userId: session.user.id })

  if (!project) {
    notFound()
  }

  return (
    <ProjectWorkspace
      project={{
        id:          project.id,
        name:        project.name,
        description: project.description ?? null,
        status:      project.status      ?? 'draft',
        techStack:   project.techStack   ?? [],
      }}
    />
  )
}
