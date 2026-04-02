/**
 * lib/orchestrator/arbitration.ts — Conflict resolution & arbitration
 *
 * When the review pipeline detects conflicting outputs between a primary
 * model and its reviewer, Claude is called as an impartial arbiter to
 * make the final decision.
 *
 * Strategy:
 * 1. Detect genuine conflicts (not just complementary feedback)
 * 2. Call Claude with side-by-side comparison
 * 3. Claude declares winner and provides final output
 * 4. Persist arbitration to ReviewLog
 * 5. Fall back gracefully if Claude fails
 */

import { v4 as uuidv4 } from 'uuid'

import { callClaude } from '@/lib/adapters'
import { ReviewLog } from '@/lib/models/ReviewLog'
import type {
  ModelResponse,
  OrchestratorTask,
  ProjectState,
  TaskType,
  FlaggedIssue,
} from '@/lib/types'
import type { ReviewResult } from './review-pipeline'

// ─── Conflict detection ─────────────────────────────────────────────────────────

/**
 * Determine if two model outputs constitute a genuine conflict.
 *
 * A conflict exists when:
 * - Reviewer rejected the output AND provided a high-confidence patch (>= 0.7)
 * - OR reviewer flagged 2+ issues with severity 'error'
 *
 * Complementary feedback (approved with suggestions) is NOT a conflict.
 *
 * @param _primaryResponse - The primary model's response (reserved for future use)
 * @param reviewResult - The reviewer's evaluation
 * @param _taskType - The task type being performed (reserved for future use)
 * @returns true if a genuine conflict exists
 */
export function detectConflict(
  _primaryResponse: ModelResponse,
  reviewResult: ReviewResult,
  _taskType: TaskType,
): boolean {
  // If review approved, no conflict
  if (reviewResult.approved) {
    return false
  }

  // Conflict if rejected with high-confidence patch
  if (reviewResult.patch && reviewResult.confidence >= 0.7) {
    return true
  }

  // Conflict if 2+ error-level issues flagged
  const errorCount = reviewResult.flaggedIssues.filter(
    (issue) => issue.severity === 'error'
  ).length

  if (errorCount >= 2) {
    return true
  }

  // Otherwise, not a conflict (just feedback)
  return false
}

// ─── Arbitration types ──────────────────────────────────────────────────────────

export type ArbitrationWinner = 'primary' | 'reviewer' | 'neither'

export interface ArbitrationResult {
  /** Which model's output was chosen. */
  winner: ArbitrationWinner
  /** The final output after arbitration. */
  finalOutput: string
  /** Claude's explanation for the decision. */
  rationale: string
  /** Whether Claude applied a patch/modification. */
  patched: boolean
  /** Flagged issues from arbitration (if any). */
  flaggedIssues: FlaggedIssue[]
  /** Tokens used during arbitration. */
  tokensUsed: number
}

// ─── Arbitration prompt builder ─────────────────────────────────────────────────

/**
 * Build a side-by-side arbitration prompt for Claude.
 */
function buildArbitrationPrompt(
  originalTask: OrchestratorTask,
  primaryResponse: ModelResponse,
  reviewResult: ReviewResult,
): string {
  let prompt = `You are Claude, serving as the impartial arbiter in a multi-model AI coding platform.\n\n`
  prompt += `Two models have produced conflicting outputs. Your role is to:\n`
  prompt += `1. Evaluate both outputs objectively\n`
  prompt += `2. Declare a winner (or "neither" if both are flawed)\n`
  prompt += `3. Provide the final output that should be used\n`
  prompt += `4. Explain your reasoning clearly\n\n`
  prompt += `---\n\n`
  prompt += `### Original Task\n`
  prompt += `**Type**: ${originalTask.taskType}\n`
  prompt += `**Prompt**: ${originalTask.prompt}\n\n`
  prompt += `---\n\n`
  prompt += `### Primary Model Output (${primaryResponse.model})\n`
  prompt += `\`\`\`\n${primaryResponse.output}\n\`\`\`\n\n`
  prompt += `**Confidence**: ${primaryResponse.confidenceScore}\n\n`
  prompt += `---\n\n`
  prompt += `### Reviewer Feedback\n`
  prompt += `**Summary**: ${reviewResult.summary}\n`
  prompt += `**Approved**: ${reviewResult.approved}\n`
  prompt += `**Confidence**: ${reviewResult.confidence}\n\n`

  if (reviewResult.flaggedIssues.length > 0) {
    prompt += `**Flagged Issues**:\n`
    reviewResult.flaggedIssues.forEach((issue, idx) => {
      prompt += `${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.message}\n`
      if (issue.suggestion) {
        prompt += `   Suggestion: ${issue.suggestion}\n`
      }
    })
    prompt += `\n`
  }

  if (reviewResult.patch) {
    prompt += `**Reviewer's Proposed Patch**:\n`
    prompt += `\`\`\`\n${reviewResult.patch}\n\`\`\`\n\n`
  }

  prompt += `---\n\n`
  prompt += `### Your Decision (JSON only)\n`
  prompt += `{\n`
  prompt += `  "winner": "primary" | "reviewer" | "neither",\n`
  prompt += `  "finalOutput": "The output to use (can be modified/patched)",\n`
  prompt += `  "rationale": "Detailed explanation of your decision",\n`
  prompt += `  "patched": true/false,\n`
  prompt += `  "flaggedIssues": [/* any remaining issues */]\n`
  prompt += `}\n\n`
  prompt += `Be decisive. If both outputs are flawed, synthesize a correct version yourself.`

  return prompt
}

/**
 * Parse Claude's arbitration response.
 */
function parseArbitrationResponse(output: string): Omit<ArbitrationResult, 'tokensUsed'> {
  try {
    const parsed = JSON.parse(output)
    return {
      winner: parsed.winner ?? 'neither',
      finalOutput: parsed.finalOutput ?? '',
      rationale: parsed.rationale ?? 'No rationale provided',
      patched: parsed.patched ?? false,
      flaggedIssues: Array.isArray(parsed.flaggedIssues) ? parsed.flaggedIssues : [],
    }
  } catch {
    // If parsing fails, default to primary output
    return {
      winner: 'primary',
      finalOutput: '',
      rationale: 'Failed to parse arbitration response',
      patched: false,
      flaggedIssues: [],
    }
  }
}

// ─── Single arbitration ─────────────────────────────────────────────────────────

/**
 * Run arbitration for a single conflict.
 *
 * Calls Claude as the arbiter to resolve the conflict between the
 * primary model and the reviewer.
 *
 * @param originalTask - The original task that was executed
 * @param primaryResponse - The primary model's response
 * @param reviewResult - The reviewer's evaluation
 * @param projectState - Current project state
 * @param sessionId - Session ID for logging
 * @returns ArbitrationResult with final output and metadata
 */
export async function runArbitration(
  originalTask: OrchestratorTask,
  primaryResponse: ModelResponse,
  reviewResult: ReviewResult,
  projectState: ProjectState,
  sessionId: string,
): Promise<ArbitrationResult> {
  try {
    const arbitrationPrompt = buildArbitrationPrompt(
      originalTask,
      primaryResponse,
      reviewResult,
    )

    // Build arbitration task for Claude
    const arbitrationTask: OrchestratorTask = {
      id: uuidv4(),
      projectId: originalTask.projectId,
      model: 'claude',
      taskType: 'arbitration',
      prompt: arbitrationPrompt,
      contextSlice: {
        projectState: {
          conventions: projectState.conventions,
        },
        relevantFiles: [],
        recentHistory: [],
        tokenBudget: 8000,
        pendingQuestions: [],
      },
      priority: 'high',
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 2,
      parentTaskId: originalTask.id,
      activeTask: {
        id: uuidv4(),
        scope: `Arbitration: ${originalTask.taskType}`,
        constraints: [],
        relatedFiles: [],
        taskType: 'arbitration',
        assignedModel: 'claude',
        startedAt: new Date().toISOString(),
        timeoutMs: 120000,
        priority: 'high',
      },
    }

    // Call Claude
    const claudeResponse = await callClaude(arbitrationTask)

    // Parse response
    const result = parseArbitrationResponse(claudeResponse.output)

    // Persist to ReviewLog
    await ReviewLog.create({
      id: uuidv4(),
      projectId: originalTask.projectId,
      sessionId,
      reviewingModel: 'claude',
      authorModel: primaryResponse.model,
      taskType: originalTask.taskType,
      inputSummary: originalTask.prompt.substring(0, 200),
      outputSummary: result.rationale.substring(0, 200),
      outcome: 'approved', // Arbitration is final
      flaggedIssues: result.flaggedIssues,
      arbitrationRequired: false,
      arbitrationRationale: result.rationale,
      patchApplied: result.patched ? result.finalOutput : undefined,
      tokensUsed: {
        promptTokens: claudeResponse.tokensUsed.promptTokens,
        completionTokens: claudeResponse.tokensUsed.completionTokens,
        totalTokens: claudeResponse.tokensUsed.totalTokens,
        estimatedCostUsd: claudeResponse.tokensUsed.estimatedCostUsd,
      },
      durationMs: claudeResponse.latencyMs,
      confidence: 1.0, // Arbitration is considered definitive
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      ...result,
      tokensUsed: claudeResponse.tokensUsed.totalTokens,
    }
  } catch (error) {
    // Fall back to primary model's output if Claude fails
    console.error('[Arbitration] Claude arbitration failed, falling back to primary:', error)
    return {
      winner: 'primary',
      finalOutput: primaryResponse.output,
      rationale: `Arbitration failed, using primary output: ${error instanceof Error ? error.message : String(error)}`,
      patched: false,
      flaggedIssues: [],
      tokensUsed: 0,
    }
  }
}

// ─── Batch arbitration ──────────────────────────────────────────────────────────

export interface BatchArbitrationResult {
  /** Final outputs with arbitrated decisions merged in. */
  finalOutputs: Map<string, string> // taskId → output
  /** Individual arbitration results keyed by task ID. */
  arbitrations: Map<string, ArbitrationResult>
  /** Total tokens used across all arbitrations. */
  totalArbitrationTokens: number
  /** Count of conflicts resolved. */
  conflictsResolved: number
}

/**
 * Run batch arbitration for all detected conflicts.
 *
 * @param tasks - Original tasks that were executed
 * @param responses - Primary model responses
 * @param reviews - Review results from the pipeline
 * @param projectState - Current project state
 * @param sessionId - Session ID for logging
 * @returns BatchArbitrationResult with arbitrated outputs
 */
export async function runBatchArbitration(
  tasks: OrchestratorTask[],
  responses: ModelResponse[],
  reviews: Map<string, ReviewResult>,
  projectState: ProjectState,
  sessionId: string,
): Promise<BatchArbitrationResult> {
  const finalOutputs = new Map<string, string>()
  const arbitrations = new Map<string, ArbitrationResult>()
  let totalArbitrationTokens = 0
  let conflictsResolved = 0

  // Build task and response lookups
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const responseMap = new Map(responses.map((r) => [r.taskId, r]))

  // Process each review to detect conflicts
  for (const [taskId, reviewResult] of reviews.entries()) {
    const task = taskMap.get(taskId)
    const response = responseMap.get(taskId)

    if (!task || !response) {
      console.warn(`[Arbitration] Task/response ${taskId} not found, skipping`)
      continue
    }

    // Check if this is a genuine conflict
    if (!detectConflict(response, reviewResult, task.taskType)) {
      // Not a conflict, use reviewed output as-is
      finalOutputs.set(taskId, reviewResult.patch ?? response.output)
      continue
    }

    // Run arbitration
    console.log(`[Arbitration] Conflict detected for task ${taskId}, running arbitration`)
    const arbitrationResult = await runArbitration(
      task,
      response,
      reviewResult,
      projectState,
      sessionId,
    )

    arbitrations.set(taskId, arbitrationResult)
    finalOutputs.set(taskId, arbitrationResult.finalOutput)
    totalArbitrationTokens += arbitrationResult.tokensUsed
    conflictsResolved++
  }

  return {
    finalOutputs,
    arbitrations,
    totalArbitrationTokens,
    conflictsResolved,
  }
}

/**
 * Get a summary of arbitration results for logging.
 */
export function getArbitrationSummary(result: BatchArbitrationResult): string {
  if (result.conflictsResolved === 0) {
    return 'No conflicts detected, arbitration skipped'
  }

  const winners = Array.from(result.arbitrations.values())
  const primaryWins = winners.filter((a) => a.winner === 'primary').length
  const reviewerWins = winners.filter((a) => a.winner === 'reviewer').length
  const neitherWins = winners.filter((a) => a.winner === 'neither').length

  return `Arbitration: ${result.conflictsResolved} conflicts resolved (Primary: ${primaryWins}, Reviewer: ${reviewerWins}, Neither: ${neitherWins}), ${result.totalArbitrationTokens} tokens used`
}
