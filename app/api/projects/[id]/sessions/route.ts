/**
 * app/api/projects/[id]/sessions/route.ts — Session history retrieval
 *
 * GET: Retrieve all saved council sessions for a project, ordered newest-first.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { Session } from '@/lib/models/Session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await Project.findOne({ id: params.id })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = Math.min(parseInt(limitParam || '50', 10), 100)

    const sessions = await Session.find({ projectId: params.id }, limit)

    return NextResponse.json({ sessions, count: sessions.length })
  } catch (error) {
    console.error('[Sessions] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
