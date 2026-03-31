/**
 * app/api/orchestrator/route.ts — Main orchestrator endpoint
 *
 * POST: Execute a multi-model AI coding task
 *
 * Credit System Flow:
 * 1. Authenticate user
 * 2. Verify project ownership
 * 3. Pre-flight credit check (estimate cost, verify balance)
 * 4. Check daily credit limit
 * 5. Call runOrchestrator
 * 6. Deduct credits per call based on actual token usage
 * 7. Record credit transactions
 * 8. Log to UsageLog
 * 9. Update project status
 * 10. Return result with session cost breakdown
 *
 * BYOK: If user provides their own API keys, credits are NOT deducted.
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { UsageLog } from '@/lib/models/UsageLog'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import { runOrchestrator } from '@/lib/orchestrator'
import { UsageLimitError } from '@/lib/utils/errors'
import {
  calculateCreditsUsed,
  calculateRealCostUsd,
  getPlanConfig,
} from '@/lib/credit-costs'

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

    // 4. Pre-flight credit check
    // Estimate minimum credits needed (~30 credits per session)
    const estimatedMinCredits = 30 // Conservative minimum estimate

    if (user.credits < estimatedMinCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Please top up to continue.',
          code: 'INSUFFICIENT_CREDITS',
          details: {
            currentCredits: user.credits,
            estimatedCost: estimatedMinCredits,
          },
        },
        { status: 402 }
      )
    }

    // 5. Check daily credit limit
    const planConfig = getPlanConfig(user.plan)
    if (planConfig.dailyCreditLimit !== Infinity) {
      const dailyUsage = await CreditTransaction.getDailyUsage(user.id)
      if (dailyUsage >= planConfig.dailyCreditLimit) {
        return NextResponse.json(
          {
            error: `Daily credit limit reached (${planConfig.dailyCreditLimit} credits/day on ${planConfig.label} plan). Upgrade for higher limits.`,
            code: 'DAILY_LIMIT_REACHED',
            details: {
              dailyUsed: dailyUsage,
              dailyLimit: planConfig.dailyCreditLimit,
              plan: user.plan,
            },
          },
          { status: 429 }
        )
      }
    }

    // 6. Run orchestrator
    console.log(`[Orchestrator API] Starting orchestration for project ${projectId}`)
    const result = await runOrchestrator(projectId, prompt, sessionId)

    // 7. Calculate and deduct credits per call
    let totalCreditsUsed = 0
    const creditBreakdown: Array<{
      model: string
      taskType: string
      inputTokens: number
      outputTokens: number
      creditsUsed: number
      realCostUsd: number
    }> = []

    for (const response of result.responses) {
      const { promptTokens, completionTokens } = response.tokensUsed
      const creditsForCall = calculateCreditsUsed(
        response.model,
        promptTokens,
        completionTokens,
      )
      const realCost = calculateRealCostUsd(
        response.model,
        promptTokens,
        completionTokens,
      )

      totalCreditsUsed += creditsForCall

      creditBreakdown.push({
        model: response.model,
        taskType: response.taskType,
        inputTokens: promptTokens,
        outputTokens: completionTokens,
        creditsUsed: creditsForCall,
        realCostUsd: realCost,
      })
    }

    // Ensure minimum charge of 1 credit per session
    totalCreditsUsed = Math.max(totalCreditsUsed, 1)

    // Deduct credits atomically
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email, credits: { $gte: totalCreditsUsed } },
      {
        $inc: {
          credits: -totalCreditsUsed,
          modelCallsUsed: result.responses.length,
        },
      },
      { new: true },
    )

    if (!updatedUser) {
      // Credits ran out mid-session — still process but warn
      console.warn(`[Orchestrator API] User ran out of credits mid-session`)
      await User.updateOne(
        { email: session.user.email },
        { $set: { credits: 0 }, $inc: { modelCallsUsed: result.responses.length } },
      )
    }

    // 8. Record credit transactions per call
    const finalBalance = updatedUser?.credits ?? 0
    let runningBalance = finalBalance + totalCreditsUsed // Start from pre-deduction

    for (const breakdown of creditBreakdown) {
      runningBalance -= breakdown.creditsUsed

      await CreditTransaction.create({
        id: uuidv4(),
        userId: user.id,
        type: 'session_deduction',
        amount: -breakdown.creditsUsed,
        balanceAfter: Math.max(0, runningBalance),
        description: `${breakdown.model} — ${breakdown.taskType} (${breakdown.inputTokens + breakdown.outputTokens} tokens)`,
        sessionId,
        projectId,
        modelUsed: breakdown.model,
        inputTokens: breakdown.inputTokens,
        outputTokens: breakdown.outputTokens,
        realCostUsd: breakdown.realCostUsd,
      })
    }

    // 9. Log detailed usage (legacy UsageLog)
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

    // 10. Update project status
    await Project.updateOne(
      { id: projectId },
      {
        status: 'active',
        lastBuiltAt: new Date(),
        $inc: { totalSessions: 1 },
        updatedAt: new Date(),
      }
    )

    // 11. Return result with credit breakdown
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
      credits: {
        totalCreditsUsed,
        remainingCredits: finalBalance,
        breakdown: creditBreakdown,
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
