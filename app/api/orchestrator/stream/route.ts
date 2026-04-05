/**
 * app/api/orchestrator/stream/route.ts — SSE streaming orchestrator endpoint
 *
 * Same auth, credit, and rate-limit logic as /api/orchestrator, but returns a
 * Server-Sent Events stream so the client can display real-time model activity.
 *
 * SSE event shape: `data: <JSON>\n\n`
 *
 * Progress events (emitted during execution):
 *   { type: 'queue_built', taskCount, tasks }
 *   { type: 'task_start', taskId, model, taskType }
 *   { type: 'task_complete', taskId, model, taskType, output, flaggedIssues }
 *   { type: 'firewall_result', verified, blocked, warnings }
 *   { type: 'review_start' }
 *   { type: 'review_complete', reviewCount, approvedCount }
 *   { type: 'arbitration_start', conflictCount }
 *   { type: 'arbitration_complete', resolved }
 *
 * Terminal events:
 *   { type: 'complete', sessionId, result, credits }
 *   { type: 'error', message, code? }
 */

import { NextRequest } from 'next/server'
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
  const encoder   = new TextEncoder()

  // ── Helper to format an SSE data line ────────────────────────────────────
  const encode = (event: object) =>
    encoder.encode(`data: ${JSON.stringify(event)}\n\n`)

  // ── Auth & pre-flight checks (must happen before the stream opens) ────────
  const session = await auth()
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const rateLimitResult = checkRateLimit(user.id, (user.plan as Plan) ?? 'free')
  const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult)
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({
        error:   rateLimitResult.message,
        code:    'RATE_LIMIT_EXCEEDED',
        details: {
          minuteCount: rateLimitResult.minuteCount,
          minuteLimit: rateLimitResult.minuteLimit,
          hourCount:   rateLimitResult.hourCount,
          hourLimit:   rateLimitResult.hourLimit,
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        },
      }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rateLimitHeaders } },
    )
  }

  const body = await request.json()
  const { projectId, prompt } = body

  if (!projectId || !prompt) {
    return new Response(
      JSON.stringify({ error: 'projectId and prompt are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const project = await Project.findOne({ id: projectId })
  if (!project) {
    return new Response(
      JSON.stringify({ error: 'Project not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (project.userId !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const estimatedMinCredits = 30
  if (user.credits < estimatedMinCredits) {
    return new Response(
      JSON.stringify({
        error:   'Insufficient credits. Top up to continue running council sessions.',
        code:    'INSUFFICIENT_CREDITS',
        details: {
          currentCredits: user.credits,
          estimatedCost:  estimatedMinCredits,
          topUpUrl:       '/dashboard/pricing',
        },
      }),
      { status: 402, headers: { 'Content-Type': 'application/json', ...rateLimitHeaders } },
    )
  }

  const planConfig = getPlanConfig(user.plan)
  if (planConfig.dailyCreditLimit !== Infinity) {
    const dailyUsage = await CreditTransaction.getDailyUsage(user.id)
    if (dailyUsage >= planConfig.dailyCreditLimit) {
      return new Response(
        JSON.stringify({
          error:   `Daily credit limit reached (${planConfig.dailyCreditLimit} credits/day on ${planConfig.label} plan). Upgrade for higher limits.`,
          code:    'DAILY_LIMIT_REACHED',
          details: { dailyUsed: dailyUsage, dailyLimit: planConfig.dailyCreditLimit, plan: user.plan },
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  // ── Stream ────────────────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        try { controller.enqueue(encode(event)) } catch { /* stream already closed */ }
      }

      try {
        console.log(`[Orchestrator Stream] Starting session ${sessionId} for project ${projectId}`)

        const result = await runOrchestrator(projectId, prompt, sessionId, (progressEvent) => {
          send(progressEvent)
        })

        // ── Credit accounting (same as existing route) ────────────────────
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
          console.warn('[Orchestrator Stream] User ran out of credits mid-session')
          await User.updateOne(
            { email: session.user.email },
            { credits: 0, $inc: { modelCallsUsed: result.responses.length } },
          )
        }

        const finalBalance = updatedUser?.credits ?? 0
        let runningBalance = finalBalance + totalCreditsUsed

        for (const breakdown of creditBreakdown) {
          runningBalance -= breakdown.creditsUsed
          await CreditTransaction.create({
            id:           uuidv4(),
            userId:       user.id,
            type:         'session_deduction',
            amount:       -breakdown.creditsUsed,
            balanceAfter: Math.max(0, runningBalance),
            description:  `${breakdown.model} — ${breakdown.taskType} (${breakdown.inputTokens + breakdown.outputTokens} tokens)`,
            sessionId,
            projectId,
            modelUsed:    breakdown.model,
            inputTokens:  breakdown.inputTokens,
            outputTokens: breakdown.outputTokens,
            realCostUsd:  breakdown.realCostUsd,
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

        // ── Save session outputs to DB for persistence ────────────────────
        const sessionDurationMs = result.metadata?.durationMs ?? 0
        try {
          await Session.create({
            sessionId,
            projectId,
            userId: user.id,
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
            durationMs:    sessionDurationMs,
          })
        } catch (sessionSaveErr) {
          console.error('[Orchestrator Stream] Failed to save session:', sessionSaveErr)
          // Non-fatal — continue and send complete event
        }

        // ── Final complete event ──────────────────────────────────────────
        send({
          type: 'complete',
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
            rawApiCostUsd:         totalRealCostUsd,
            platformMarkupPercent: (MARGIN_MULTIPLIER - 1) * 100,
            totalCostUsd:          totalRealCostUsd * MARGIN_MULTIPLIER,
            totalCreditsCharged:   totalCreditsUsed,
            creditValueUsd:        CREDIT_UNIT_VALUE,
            breakdown:             creditBreakdown,
          },
        })
      } catch (error) {
        console.error('[Orchestrator Stream] Error:', error)

        if (error instanceof UsageLimitError) {
          send({ type: 'error', message: error.message, code: error.code })
        } else {
          send({
            type:    'error',
            message: error instanceof Error ? error.message : 'Orchestration failed',
            sessionId,
          })
        }
      } finally {
        try { controller.close() } catch { /* already closed */ }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
      ...rateLimitHeaders,
    },
  })
}
