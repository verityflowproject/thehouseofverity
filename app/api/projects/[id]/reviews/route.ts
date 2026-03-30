/**
 * app/api/projects/[id]/reviews/route.ts — ReviewLog retrieval
 *
 * GET: Retrieve ReviewLog entries for a project
 * Supports optional sessionId filtering and limit (max 100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { ReviewLog } from '@/lib/models/ReviewLog'

// GET /api/projects/[id]/reviews?sessionId=xxx&limit=50
export async function GET(
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(parseInt(limitParam || '100', 10), 100)

    // Build query
    const query: { projectId: string; sessionId?: string } = {
      projectId: params.id,
    }

    if (sessionId) {
      query.sessionId = sessionId
    }

    // Fetch reviews
    const reviews = await ReviewLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ reviews, count: reviews.length })
  } catch (error) {
    console.error('[Reviews] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
