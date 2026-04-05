/**
 * app/api/projects/[id]/route.ts — Single project management
 *
 * GET:   Retrieve a single project
 * PATCH: Update project fields (name, description, brief)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const project = await Project.findOne({ id: params.id })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (project.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('[Project] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const project = await Project.findOne({ id: params.id })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (project.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const allowed = ['name', 'description', 'brief'] as const
    const updates: Record<string, unknown> = {}

    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await Project.updateOne({ id: params.id }, updates as Parameters<typeof Project.updateOne>[1])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Project] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
