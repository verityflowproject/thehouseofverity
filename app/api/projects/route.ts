/**
 * app/api/projects/route.ts — Project CRUD endpoints
 *
 * GET: List all projects for the authenticated user
 * POST: Create a new project and initialize its ProjectState
 * DELETE: Remove a project (verify ownership)
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { initProjectState } from '@/lib/utils/project-state'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const projects = await Project.find({ userId: user.id })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('[Projects] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, techStack } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 },
      )
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const projectId = uuidv4()

    const project = await Project.create({
      id: projectId,
      userId: user.id,
      name,
      description,
      techStack: techStack || [],
      status: 'active',
      totalSessions: 0,
    })

    const projectState = await initProjectState(projectId)

    return NextResponse.json({ project, projectState }, { status: 201 })
  } catch (error) {
    console.error('[Projects] POST error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const project = await Project.findOne({ id: projectId })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Project.deleteOne({ id: projectId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Projects] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
