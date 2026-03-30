/**
 * app/api/projects/[id]/state/route.ts — ProjectState management
 *
 * GET: Retrieve current ProjectState
 * POST: Initialize, merge, or replace ProjectState with optimistic locking
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import {
  getProjectState,
  initProjectState,
  mergeProjectState,
  setProjectState,
} from '@/lib/utils/project-state'
import type { ProjectState } from '@/lib/types'

// GET /api/projects/[id]/state - Get current state
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoose()

    // Get user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify project ownership
    const project = await Project.findOne({ id: params.id })
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get state
    const state = await getProjectState(params.id)

    return NextResponse.json({ state })
  } catch (error) {
    console.error('[ProjectState] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project state' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/state - Initialize, merge, or replace state
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoose()

    // Get user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify project ownership
    const project = await Project.findOne({ id: params.id })
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, patch, expectedVersion } = body

    let state: ProjectState

    switch (action) {
      case 'init':
        state = await initProjectState(params.id)
        break

      case 'merge':
        if (!patch) {
          return NextResponse.json(
            { error: 'Patch is required for merge action' },
            { status: 400 }
          )
        }
        state = await mergeProjectState(params.id, patch, expectedVersion)
        break

      case 'replace':
        if (!patch) {
          return NextResponse.json(
            { error: 'Full state is required for replace action' },
            { status: 400 }
          )
        }
        // Verify version if provided
        if (expectedVersion !== undefined) {
          const current = await getProjectState(params.id)
          if (current.version !== expectedVersion) {
            return NextResponse.json(
              {
                error: 'Version conflict',
                expectedVersion,
                actualVersion: current.version,
              },
              { status: 409 }
            )
          }
        }
        state = await setProjectState(patch as ProjectState)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: init, merge, or replace' },
          { status: 400 }
        )
    }

    return NextResponse.json({ state })
  } catch (error) {
    console.error('[ProjectState] POST error:', error)

    // Handle version conflicts
    if (error instanceof Error && error.message.includes('Version conflict')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update project state' },
      { status: 500 }
    )
  }
}
