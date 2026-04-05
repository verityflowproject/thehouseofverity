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
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { UsageLog } from '@/lib/models/UsageLog'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import { Session } from '@/lib/models/Session'
import { runOrchestrator } from '@/lib/orchestrator'
import { UsageLimitError } from '@/lib/utils/errors'
import { checkRateLimit, buildRateLimitHeaders } from '@/lib/middleware/rate-limit'
import {
  calculateCreditsUsed,
  calculateRealCostUsd,
  getPlanConfig,
  MARGIN_MULTIPLIER,
  CREDIT_UNIT_VALUE,
} from '@/lib/credit-costs'
import type { Plan } from '@/lib/types'

export async function POST(request: NextRequest) {
  const sessionId = uuidv4()

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limit check (per-user, per-plan sliding window)
    const rateLimitResult = checkRateLimit(user.id, (user.plan as Plan) ?? 'free')
    const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error:   rateLimitResult.message,
          code:    'RATE_LIMIT_EXCEEDED',
          details: {
            minuteCount: rateLimitResult.minuteCount,
            minuteLimit: rateLimitResult.minuteLimit,
            hourCount:   rateLimitResult.hourCount,
            hourLimit:   rateLimitResult.hourLimit,
            retryAfterSeconds: rateLimitResult.retryAfterSeconds,
          },
        },
        { status: 429, headers: rateLimitHeaders },
      )
    }

    const body = await request.json()
    const { projectId, prompt } = body

    if (!projectId || !prompt) {
      return NextResponse.json({ error: 'projectId and prompt are required' }, { status: 400 })
    }

    const project = await Project.findOne({ id: projectId })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const estimatedMinCredits = 30
    if (user.credits < estimatedMinCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Top up to continue running council sessions.',
          code: 'INSUFFICIENT_CREDITS',
          details: {
            currentCredits:  user.credits,
            estimatedCost:   estimatedMinCredits,
            topUpUrl:        '/dashboard/pricing',
            message:         'Purchase a credit pack or upgrade your plan at /dashboard/pricing',
          },
        },
        { status: 402, headers: rateLimitHeaders },
      )
    }

    const planConfig = getPlanConfig(user.plan)
    if (planConfig.dailyCreditLimit !== Infinity) {
      const dailyUsage = await CreditTransaction.getDailyUsage(user.id)
      if (dailyUsage >= planConfig.dailyCreditLimit) {
        return NextResponse.json(
          {
            error: `Daily credit limit reached (${planConfig.dailyCreditLimit} credits/day on ${planConfig.label} plan). Upgrade for higher limits.`,
            code: 'DAILY_LIMIT_REACHED',
            details: { dailyUsed: dailyUsage, dailyLimit: planConfig.dailyCreditLimit, plan: user.plan },
          },
          { status: 429 },
        )
      }
    }

    console.log(`[Orchestrator API] Starting orchestration for project ${projectId}`)
    const result = await runOrchestrator(projectId, prompt, sessionId)

    let totalCreditsUsed = 0
    let totalRealCostUsd = 0
    const creditBreakdown: Array<{
      model:        string
      taskType:     string
      inputTokens:  number
      outputTokens: number
      creditsUsed:  number
      realCostUsd:  number
      markupUsd:    number
      totalCostUsd: number
    }> = []

    for (const response of result.responses) {
      const { promptTokens, completionTokens } = response.tokensUsed
      const creditsForCall = calculateCreditsUsed(response.model, promptTokens, completionTokens)
      const realCost       = calculateRealCostUsd(response.model, promptTokens, completionTokens)
      totalCreditsUsed    += creditsForCall
      totalRealCostUsd    += realCost
      creditBreakdown.push({
        model:        response.model,
        taskType:     response.taskType,
        inputTokens:  promptTokens,
        outputTokens: completionTokens,
        creditsUsed:  creditsForCall,
        realCostUsd:  realCost,
        markupUsd:    realCost * (MARGIN_MULTIPLIER - 1),
        totalCostUsd: realCost * MARGIN_MULTIPLIER,
      })
    }

    totalCreditsUsed = Math.max(totalCreditsUsed, 1)

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email, credits: { $gte: totalCreditsUsed } },
      {
        $inc: {
          credits:        -totalCreditsUsed,
          modelCallsUsed: result.responses.length,
        },
      },
      { new: true },
    )

    if (!updatedUser) {
      console.warn('[Orchestrator API] User ran out of credits mid-session')
      await User.updateOne(
        { email: session.user.email },
        { credits: 0, $inc: { modelCallsUsed: result.responses.length } },
      )
    }

    const finalBalance    = updatedUser?.credits ?? 0
    let runningBalance    = finalBalance + totalCreditsUsed

    for (const breakdown of creditBreakdown) {
      runningBalance -= breakdown.creditsUsed

      await CreditTransaction.create({
        id:          uuidv4(),
        userId:      user.id,
        type:        'session_deduction',
        amount:      -breakdown.creditsUsed,
        balanceAfter:Math.max(0, runningBalance),
        description: `${breakdown.model} — ${breakdown.taskType} (${breakdown.inputTokens + breakdown.outputTokens} tokens)`,
        sessionId,
        projectId,
        modelUsed:   breakdown.model,
        inputTokens: breakdown.inputTokens,
        outputTokens:breakdown.outputTokens,
        realCostUsd: breakdown.realCostUsd,
      })
    }

    const usageLogs = result.responses.map((response) => ({
      id:               uuidv4(),
      userId:           user.id,
      projectId,
      sessionId,
      aiModel:          response.model,
      taskType:         response.taskType,
      promptTokens:     response.tokensUsed.promptTokens,
      completionTokens: response.tokensUsed.completionTokens,
      totalTokens:      response.tokensUsed.totalTokens,
      estimatedCostUsd: response.tokensUsed.estimatedCostUsd,
      success:          !response.flaggedIssues.some((i) => i.severity === 'error'),
      durationMs:       response.latencyMs,
      createdAt:        new Date(),
      updatedAt:        new Date(),
    }))

    await UsageLog.insertMany(usageLogs)

    await Project.updateOne(
      { id: projectId },
      { status: 'active', lastBuiltAt: new Date(), $inc: { totalSessions: 1 } },
    )

    // Save session outputs to DB for persistence
    try {
      await Session.create({
        sessionId,
        projectId,
        userId:      user.id,
        prompt,
        outputs: result.responses.map((r) => ({
          model:         r.model,
          taskType:      r.taskType,
          output:        r.output,
          flaggedIssues: r.flaggedIssues,
          tokensUsed:    r.tokensUsed,
        })),
        creditsUsed:   totalCreditsUsed,
        costBreakdown: creditBreakdown,
        status:        'complete',
        durationMs:    result.metadata?.durationMs,
      })
    } catch (sessionSaveErr) {
      console.error('[Orchestrator] Failed to save session:', sessionSaveErr)
    }

    return NextResponse.json({
      success: true,
      sessionId,
      result: {
        responses:    result.responses,
        finalOutputs: Object.fromEntries(result.finalOutputs),
        flags:        result.flags,
        tokenUsage:   result.tokenUsage,
        metadata:     result.metadata,
      },
      credits: {
        totalCreditsUsed,
        remainingCredits: finalBalance,
        breakdown: creditBreakdown,
      },
      costTransparency: {
        rawApiCostUsd:          totalRealCostUsd,
        platformMarkupPercent:  (MARGIN_MULTIPLIER - 1) * 100,
        totalCostUsd:           totalRealCostUsd * MARGIN_MULTIPLIER,
        totalCreditsCharged:    totalCreditsUsed,
        creditValueUsd:         CREDIT_UNIT_VALUE,
        breakdown:              creditBreakdown,
        note: 'Credits cover intelligent model routing, hallucination firewall, multi-model review, arbitration, and platform infrastructure.',
      },
    }, { headers: rateLimitHeaders })
  } catch (error) {
    console.error('[Orchestrator API] Error:', error)

    if (error instanceof UsageLimitError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Orchestration failed',
        sessionId,
      },
      { status: 500 },
    )
  }
}
