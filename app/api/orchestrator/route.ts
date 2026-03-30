/**
 * app/api/orchestrator/route.ts — Main orchestrator endpoint
 *
 * POST: Execute a multi-model AI coding task
 *
 * Flow:
 * 1. Authenticate user
 * 2. Verify project ownership
 * 3. Check usage limits
 * 4. Call runOrchestrator
 * 5. Increment usage counter
 * 6. Log to UsageLog
 * 7. Update project status
 * 8. Return result
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { UsageLog } from '@/lib/models/UsageLog'
import { runOrchestrator } from '@/lib/orchestrator'
import { UsageLimitError } from '@/lib/utils/errors'

// POST /api/orchestrator
export async function POST(request: NextRequest) {
  const sessionId = uuidv4()

  try {
    // 1. Authenticate
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoose()

    // 2. Get user and verify
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { projectId, prompt } = body

    if (!projectId || !prompt) {
      return NextResponse.json(
        { error: 'projectId and prompt are required' },
        { status: 400 }
      )
    }

    // 3. Verify project ownership
    const project = await Project.findOne({ id: projectId })
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

    // 4. Check usage limits
    const modelCallsUsed = user.modelCallsUsed || 0
    const modelCallsLimit = user.modelCallsLimit || 50 // Free tier default

    if (modelCallsUsed >= modelCallsLimit) {
      throw new UsageLimitError({
        userId: user.id,
        plan: user.plan,
        modelCallsUsed,
        modelCallsLimit,
      })
    }

    // 5. Run orchestrator
    console.log(`[Orchestrator API] Starting orchestration for project ${projectId}`)
    const result = await runOrchestrator(projectId, prompt, sessionId)

    // 6. Increment usage counter
    const modelCallsIncrement = result.responses.filter(
      (r) => r.taskType !== 'research' // Don't count research calls
    ).length

    await User.updateOne(
      { email: session.user.email },
      { $inc: { modelCallsUsed: modelCallsIncrement } }
    )

    // 7. Log detailed usage
    const usageLogs = result.responses.map((response) => ({
      id: uuidv4(),
      userId: user.id,
      projectId,
      sessionId,
      aiModel: response.model,
      taskType: response.taskType,
      promptTokens: response.tokensUsed.promptTokens,
      completionTokens: response.tokensUsed.completionTokens,
      totalTokens: response.tokensUsed.totalTokens,
      estimatedCostUsd: response.tokensUsed.estimatedCostUsd,
      success: !response.flaggedIssues.some((i) => i.severity === 'error'),
      durationMs: response.latencyMs,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await UsageLog.insertMany(usageLogs)

    // 8. Update project status
    await Project.updateOne(
      { id: projectId },
      {
        status: 'active',
        lastBuiltAt: new Date(),
        $inc: { totalSessions: 1 },
        updatedAt: new Date(),
      }
    )

    // 9. Return result
    return NextResponse.json({
      success: true,
      sessionId,
      result: {
        responses: result.responses,
        finalOutputs: Object.fromEntries(result.finalOutputs),
        flags: result.flags,
        tokenUsage: result.tokenUsage,
        metadata: result.metadata,
      },
    })
  } catch (error) {
    console.error('[Orchestrator API] Error:', error)

    // Handle usage limit errors
    if (error instanceof UsageLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 429 }
      )
    }

    // Handle general errors
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Orchestration failed',
        sessionId,
      },
      { status: 500 }
    )
  }
}
