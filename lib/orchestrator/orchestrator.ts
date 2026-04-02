/**
 * lib/orchestrator/orchestrator.ts — Main orchestrator entry point
 *
 * Top-level function that coordinates the entire multi-model AI workflow.
 * Called by the API route to execute user prompts.
 *
 * Workflow:
 * 1. Load ProjectState
 * 2. Build task queue (classification, routing, research detection)
 * 3. Execute tasks sequentially:
 *    - Run hallucination firewall
 *    - Inject research findings
 *    - Call model adapters
 *    - Handle errors gracefully
 * 4. Run batch review pipeline
 * 5. Run batch arbitration if conflicts detected
 * 6. Return comprehensive result
 */

import { v4 as uuidv4 } from 'uuid'

import { getProjectState, setProjectState } from '@/lib/utils/project-state'
import { buildTaskQueue } from './queue-builder'
import { checkHallucinationFirewall } from './hallucination-firewall'
import { routeToModel } from '@/lib/adapters'
import { runReviewPipeline, type PipelineResult } from './review-pipeline'
import { runBatchArbitration, type BatchArbitrationResult } from './arbitration'
import { calculateCreditsUsed, SESSION_COST_CAP_CREDITS } from '@/lib/credit-costs'
import type {
  OrchestratorTask,
  ModelResponse,
  ProjectState,
} from '@/lib/types'

// ─── Result types ─────────────────────────────────────────────────────────────

export interface OrchestratorResult {
  /** All model responses (raw). */
  responses: ModelResponse[]
  /** Final outputs after review and arbitration. */
  finalOutputs: Map<string, string> // taskId → output
  /** Review pipeline result. */
  reviewResult?: PipelineResult
  /** Arbitration result (if conflicts were detected). */
  arbitrationResult?: BatchArbitrationResult
  /** Updated project state. */
  updatedState: ProjectState
  /** Flags for downstream processing. */
  flags: {
    hadFirewallBlocks:  boolean
    hadReviewFailures:  boolean
    hadArbitration:     boolean
    hadAdapterErrors:   boolean
    /** True if execution was halted because running credit cost exceeded SESSION_COST_CAP_CREDITS. */
    sessionCapReached:  boolean
  }
  /** Token usage summary. */
  tokenUsage: {
    totalModelTokens: number
    totalReviewTokens: number
    totalArbitrationTokens: number
    totalTokens: number
    estimatedCostUsd: number
  }
  /** Execution metadata. */
  metadata: {
    sessionId: string
    tasksExecuted: number
    durationMs: number
  }
}

// ─── Task execution ────────────────────────────────────────────────────────────

/**
 * Execute a single task with firewall checks and error handling.
 */
async function executeTask(
  task: OrchestratorTask,
  projectState: ProjectState,
  researchFindings: Map<string, string>,
  flags: { hadFirewallBlocks: boolean; hadAdapterErrors: boolean },
): Promise<ModelResponse> {
  try {
    let enrichedTask = task

    // 1. Run hallucination firewall for implementation/architecture tasks
    if (task.taskType === 'implementation' || task.taskType === 'architecture') {
      const firewallResult = await checkHallucinationFirewall(
        task.prompt,
        task.taskType,
        projectState,
      )

      if (!firewallResult.allowed) {
        flags.hadFirewallBlocks = true
        // Return error response
        return {
          id: uuidv4(),
          taskId: task.id,
          projectId: task.projectId,
          model: task.model,
          taskType: task.taskType,
          output: `❌ Firewall blocked: ${firewallResult.blockReason}`,
          confidenceScore: 0,
          flaggedIssues: [
            {
              severity: 'error',
              code: 'FIREWALL_BLOCK',
              message: firewallResult.blockReason ?? 'Unknown firewall block',
              autoFixed: false,
            },
          ],
          tokensUsed: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            estimatedCostUsd: 0,
          },
          latencyMs: 0,
          timestamp: new Date().toISOString(),
          projectStateUpdate: {},
          newOpenQuestions: [],
          requestsCouncil: false,
        }
      }

      // Enrich prompt with verified dependency info
      enrichedTask = {
        ...task,
        prompt: firewallResult.enrichedPrompt ?? task.prompt,
      }

      // Apply state updates from firewall
      if (firewallResult.updatedState) {
        Object.assign(projectState, firewallResult.updatedState)
      }
    }

    // 2. Inject research findings from prior research tasks
    if (researchFindings.size > 0 && task.taskType !== 'research') {
      let enrichedPrompt = enrichedTask.prompt + `\n\n### Research Findings\n`
      for (const [, findings] of researchFindings.entries()) {
        enrichedPrompt += `${findings}\n\n`
      }
      enrichedTask = { ...enrichedTask, prompt: enrichedPrompt }
    }

    // 3. Call the appropriate model adapter
    const response = await routeToModel(enrichedTask)

    // 4. Store research findings for downstream tasks
    if (task.taskType === 'research') {
      researchFindings.set(task.id, response.output)
    }

    return response
  } catch (error) {
    flags.hadAdapterErrors = true
    console.error(`[Orchestrator] Task ${task.id} failed:`, error)

    // Return error response
    return {
      id: uuidv4(),
      taskId: task.id,
      projectId: task.projectId,
      model: task.model,
      taskType: task.taskType,
      output: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      confidenceScore: 0,
      flaggedIssues: [
        {
          severity: 'error',
          code: 'ADAPTER_ERROR',
          message: error instanceof Error ? error.message : String(error),
          autoFixed: false,
        },
      ],
      tokensUsed: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
      },
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      projectStateUpdate: {},
      newOpenQuestions: [],
      requestsCouncil: false,
    }
  }
}

// ─── Main orchestrator ─────────────────────────────────────────────────────────

/**
 * Run the complete orchestrator workflow.
 *
 * This is the main entry point called by the API route.
 *
 * @param projectId - UUID of the project
 * @param userPrompt - The user's input prompt
 * @param sessionId - Session ID for logging and tracking
 * @returns OrchestratorResult with responses, final outputs, and metadata
 *
 * @throws If ProjectState is not found
 *
 * @example
 *   const result = await runOrchestrator(projectId, 'Implement user auth', sessionId)
 *   console.log(result.finalOutputs) // Final outputs after review/arbitration
 *   console.log(result.tokenUsage.totalTokens) // Total tokens used
 */
export async function runOrchestrator(
  projectId: string,
  userPrompt: string,
  sessionId: string = uuidv4(),
): Promise<OrchestratorResult> {
  const startTime = Date.now()

  // 1. Load ProjectState
  const projectState = await getProjectState(projectId)
  if (!projectState) {
    throw new Error(`ProjectState not found for project ${projectId}`)
  }

  console.log(`[Orchestrator] Starting session ${sessionId} for project ${projectId}`)

  // 2. Build task queue
  const taskQueue = buildTaskQueue(projectId, userPrompt, projectState)
  console.log(`[Orchestrator] Built queue with ${taskQueue.length} tasks`)

  // 3. Initialize state tracking
  const flags = {
    hadFirewallBlocks:  false,
    hadReviewFailures:  false,
    hadArbitration:     false,
    hadAdapterErrors:   false,
    sessionCapReached:  false,
  }

  const researchFindings = new Map<string, string>()
  const responses: ModelResponse[] = []

  // 4. Execute tasks in dependency order, running independent tasks in parallel
  let runningCreditCost = 0

  // Build dependency levels: tasks with no unresolved deps execute together
  const completed   = new Set<string>()
  const taskMap     = new Map(taskQueue.map((t) => [t.id, t]))
  const taskResults = new Map<string, ModelResponse>()
  let remaining     = [...taskQueue]

  while (remaining.length > 0 && !flags.sessionCapReached) {
    // Find tasks whose dependencies are all satisfied
    const ready = remaining.filter((task) => {
      const deps = task.dependsOn ?? []
      return deps.every((depId) => completed.has(depId))
    })

    if (ready.length === 0) {
      // Cycle or unresolvable — fall back to sequential
      console.warn('[Orchestrator] Could not resolve task dependencies, executing remaining tasks sequentially')
      for (const task of remaining) {
        const response = await executeTask(task, projectState, researchFindings, flags)
        responses.push(response)
        taskResults.set(task.id, response)
        completed.add(task.id)
      }
      break
    }

    if (ready.length === 1) {
      // Single task — execute directly
      const task = ready[0]
      console.log(`[Orchestrator] Executing task ${task.id} (${task.taskType}, ${task.model})${task.routingReason ? ` — ${task.routingReason}` : ''}`)
      const response = await executeTask(task, projectState, researchFindings, flags)
      responses.push(response)
      taskResults.set(task.id, response)
      completed.add(task.id)

      const taskCredits = calculateCreditsUsed(
        response.model,
        response.tokensUsed.promptTokens,
        response.tokensUsed.completionTokens,
      )
      runningCreditCost += taskCredits
    } else {
      // Multiple independent tasks — execute in parallel
      console.log(`[Orchestrator] Executing ${ready.length} independent tasks in parallel`)
      const batchResults = await Promise.all(
        ready.map((task) => {
          console.log(`[Orchestrator] Parallel: task ${task.id} (${task.taskType}, ${task.model})`)
          return executeTask(task, projectState, researchFindings, flags)
        }),
      )

      for (let i = 0; i < ready.length; i++) {
        const task     = ready[i]
        const response = batchResults[i]
        responses.push(response)
        taskResults.set(task.id, response)
        completed.add(task.id)

        const taskCredits = calculateCreditsUsed(
          response.model,
          response.tokensUsed.promptTokens,
          response.tokensUsed.completionTokens,
        )
        runningCreditCost += taskCredits
      }
    }

    // Remove completed tasks from remaining
    const readyIds = new Set(ready.map((t) => t.id))
    remaining = remaining.filter((t) => !readyIds.has(t.id))

    // Enforce session cost cap
    if (runningCreditCost > SESSION_COST_CAP_CREDITS) {
      console.warn(`[Orchestrator] Session cost cap (${SESSION_COST_CAP_CREDITS} credits) reached at ${runningCreditCost} — stopping execution`)
      flags.sessionCapReached = true
    }
  }

  void taskMap // used for dependency resolution above

  // 5. Separate research responses from reviewable responses
  const reviewableResponses = responses.filter(
    (r) => r.taskType !== 'research' && r.taskType !== 'arbitration'
  )

  // 6. Run batch review pipeline
  let reviewResult: PipelineResult | undefined
  if (reviewableResponses.length > 0) {
    console.log(`[Orchestrator] Running review pipeline on ${reviewableResponses.length} responses`)
    reviewResult = await runReviewPipeline(
      taskQueue.filter((t) => t.taskType !== 'research' && t.taskType !== 'arbitration'),
      reviewableResponses,
      projectState,
      sessionId,
    )

    if (reviewResult.needsArbitration) {
      console.log(`[Orchestrator] ${reviewResult.arbitrationTasks.length} tasks need arbitration`)
    }
  }

  // 7. Run batch arbitration if needed
  let arbitrationResult: BatchArbitrationResult | undefined
  if (reviewResult?.needsArbitration) {
    flags.hadArbitration = true
    console.log('[Orchestrator] Running batch arbitration')
    arbitrationResult = await runBatchArbitration(
      taskQueue,
      reviewableResponses,
      reviewResult.reviews,
      projectState,
      sessionId,
    )
  }

  // 8. Build final outputs map
  const finalOutputs = new Map<string, string>()

  // Start with all responses
  for (const response of responses) {
    finalOutputs.set(response.taskId, response.output)
  }

  // Apply review pipeline outputs
  if (reviewResult) {
    for (const [taskId, output] of reviewResult.finalOutputs.entries()) {
      finalOutputs.set(taskId, output)
    }
  }

  // Apply arbitration outputs (highest priority)
  if (arbitrationResult) {
    for (const [taskId, output] of arbitrationResult.finalOutputs.entries()) {
      finalOutputs.set(taskId, output)
    }
  }

  // 9. Calculate token usage
  const totalModelTokens = responses.reduce(
    (sum, r) => sum + r.tokensUsed.totalTokens,
    0
  )
  const totalReviewTokens = reviewResult?.totalReviewTokens ?? 0
  const totalArbitrationTokens = arbitrationResult?.totalArbitrationTokens ?? 0
  const totalTokens = totalModelTokens + totalReviewTokens + totalArbitrationTokens
  const estimatedCostUsd = responses.reduce(
    (sum, r) => sum + r.tokensUsed.estimatedCostUsd,
    0
  )

  // 10. Update ProjectState (placeholder - full state update logic would go here)
  const updatedState = await setProjectState({
    ...projectState,
    version: (projectState.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  })

  const durationMs = Date.now() - startTime

  console.log(`[Orchestrator] Session ${sessionId} complete in ${durationMs}ms`)
  console.log(`[Orchestrator] Tokens: ${totalTokens} (Model: ${totalModelTokens}, Review: ${totalReviewTokens}, Arbitration: ${totalArbitrationTokens})`)

  return {
    responses,
    finalOutputs,
    reviewResult,
    arbitrationResult,
    updatedState,
    flags,
    tokenUsage: {
      totalModelTokens,
      totalReviewTokens,
      totalArbitrationTokens,
      totalTokens,
      estimatedCostUsd,
    },
    metadata: {
      sessionId,
      tasksExecuted: taskQueue.length,
      durationMs,
    },
  }
}

/**
 * Get a human-readable summary of the orchestrator result.
 */
export function getOrchestratorSummary(result: OrchestratorResult): string {
  const lines: string[] = []
  lines.push(`Session: ${result.metadata.sessionId}`)
  lines.push(`Tasks: ${result.metadata.tasksExecuted} executed in ${result.metadata.durationMs}ms`)
  lines.push(`Tokens: ${result.tokenUsage.totalTokens} total ($${result.tokenUsage.estimatedCostUsd.toFixed(4)})`)

  if (result.flags.hadFirewallBlocks) {
    lines.push(`⚠️ Firewall blocked some tasks`)
  }

  if (result.reviewResult) {
    const approved = Array.from(result.reviewResult.reviews.values()).filter((r) => r.approved).length
    lines.push(`Reviews: ${approved}/${result.reviewResult.reviews.size} approved`)
  }

  if (result.flags.hadArbitration && result.arbitrationResult) {
    lines.push(`Arbitration: ${result.arbitrationResult.conflictsResolved} conflicts resolved`)
  }

  if (result.flags.hadAdapterErrors) {
    lines.push(`❌ Some adapter errors occurred`)
  }

  return lines.join('\n')
}
