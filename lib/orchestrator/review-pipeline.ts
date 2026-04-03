/**
 * lib/orchestrator/review-pipeline.ts — Post-execution review
 *
 * Runs after model outputs are collected to ensure quality,
 * correctness, and adherence to conventions.
 *
 * Strategy:
 * 1. Route each model's output to an appropriate reviewer
 * 2. Build structured review prompts
 * 3. Parse JSON review responses
 * 4. Apply patches if approved with high confidence
 * 5. Escalate to arbitration if needed
 * 6. Persist reviews to ReviewLog
 * 7. Return batch result with final outputs
 */

import { v4 as uuidv4 } from 'uuid'

import { callClaude, callGPT } from '@/lib/adapters'
import { ReviewLog } from '@/lib/models/ReviewLog'
import type {
  ModelRole,
  ModelResponse,
  OrchestratorTask,
  ProjectState,
  FlaggedIssue,
  TokenUsage,
} from '@/lib/types'

// ─── Review routing table ──────────────────────────────────────────────────────

/**
 * Maps which model reviews which other model's output.
 *
 * Rules:
 * - Claude reviews: Gemini, GPT
 * - GPT reviews: Claude, Codestral
 * - Research outputs skip review
 * - Arbitration outputs skip review
 */
const REVIEW_ROUTING: Record<ModelRole, ModelRole | null> = {
  claude: 'gpt5.4o',
  'gpt5.4o': 'claude',
  codestral: 'gpt5.4o',
  gemini: 'claude',
  perplexity: null, // Research outputs skip review
}

/**
 * Get the reviewer model for a given primary model.
 */
function getReviewer(primaryModel: ModelRole): ModelRole | null {
  return REVIEW_ROUTING[primaryModel]
}

/**
 * Check if a task type should be reviewed.
 */
function shouldReview(taskType: string): boolean {
  // Skip review for research and arbitration tasks
  return taskType !== 'research' && taskType !== 'arbitration'
}

// ─── Review prompt builder ─────────────────────────────────────────────────────

interface ReviewCriteria {
  correctness: boolean
  conventions: boolean
  hallucinations: boolean
  security: boolean
}

/**
 * Build a structured review prompt for the reviewer model.
 */
function buildReviewPrompt(
  originalTask: OrchestratorTask,
  modelOutput: string,
  criteria: ReviewCriteria = {
    correctness: true,
    conventions: true,
    hallucinations: true,
    security: true,
  },
): string {
  let prompt = `You are reviewing code/output from another AI model. Evaluate the following:\n\n`
  prompt += `### Original Task\n`
  prompt += `**Type**: ${originalTask.taskType}\n`
  prompt += `**Prompt**: ${originalTask.prompt}\n\n`
  prompt += `### Model Output to Review\n`
  prompt += `\`\`\`\n${modelOutput}\n\`\`\`\n\n`
  prompt += `### Review Criteria\n`

  if (criteria.correctness) {
    prompt += `- **Correctness**: Does the output correctly address the task? Are there logical errors?\n`
  }
  if (criteria.conventions) {
    prompt += `- **Conventions**: Does it follow project naming conventions and patterns?\n`
  }
  if (criteria.hallucinations) {
    prompt += `- **Hallucinations**: Are there invented APIs, packages, or features that don't exist?\n`
  }
  if (criteria.security) {
    prompt += `- **Security**: Are there security vulnerabilities or unsafe patterns?\n`
  }

  prompt += `\n### Response Format (JSON only)\n`
  prompt += `{\n`
  prompt += `  "approved": true/false,\n`
  prompt += `  "confidence": 0.0-1.0,\n`
  prompt += `  "summary": "Brief overall assessment",\n`
  prompt += `  "flaggedIssues": [\n`
  prompt += `    {\n`
  prompt += `      "severity": "error" | "warning" | "info",\n`
  prompt += `      "code": "SHORT_CODE",\n`
  prompt += `      "message": "Description",\n`
  prompt += `      "suggestion": "How to fix"\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "patch": "Corrected output (if not approved and fixable)",\n`
  prompt += `  "requiresArbitration": true/false\n`
  prompt += `}\n\n`
  prompt += `Return ONLY valid JSON. Be thorough but constructive.`

  return prompt
}

// ─── Review response parsing ───────────────────────────────────────────────────

export interface ReviewResult {
  approved: boolean
  confidence: number
  summary: string
  flaggedIssues: FlaggedIssue[]
  patch?: string
  requiresArbitration: boolean
}

/**
 * Parse the reviewer's JSON output.
 */
function parseReviewResponse(output: string): ReviewResult {
  try {
    const parsed = JSON.parse(output)
    return {
      approved: parsed.approved ?? false,
      confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
      summary: parsed.summary ?? 'No summary provided',
      flaggedIssues: Array.isArray(parsed.flaggedIssues) ? parsed.flaggedIssues : [],
      patch: parsed.patch,
      requiresArbitration: parsed.requiresArbitration ?? false,
    }
  } catch {
    // If parsing fails, return a failed review
    return {
      approved: false,
      confidence: 0,
      summary: 'Failed to parse review response',
      flaggedIssues: [
        {
          severity: 'error',
          code: 'REVIEW_PARSE_ERROR',
          message: 'Could not parse reviewer output as JSON',
          autoFixed: false,
        },
      ],
      requiresArbitration: false,
    }
  }
}

// ─── Review execution ──────────────────────────────────────────────────────────

/**
 * Execute a single review.
 */
async function executeReview(
  originalTask: OrchestratorTask,
  modelResponse: ModelResponse,
  reviewerModel: ModelRole,
  projectState: ProjectState,
): Promise<{ reviewResult: ReviewResult; tokensUsed: TokenUsage }> {
  const reviewPrompt = buildReviewPrompt(originalTask, modelResponse.output)

  // Build review task
  const reviewTask: OrchestratorTask = {
    id: uuidv4(),
    projectId: originalTask.projectId,
    model: reviewerModel,
    taskType: 'review',
    prompt: reviewPrompt,
    contextSlice: {
      projectState: {
        conventions: projectState.conventions,
      },
      relevantFiles: [],
      recentHistory: [],
      tokenBudget: 6000,
      pendingQuestions: [],
    },
    priority: 'normal',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 2,
    parentTaskId: originalTask.id,
    activeTask: {
      id: uuidv4(),
      scope: `Review: ${originalTask.taskType}`,
      constraints: [],
      relatedFiles: [],
      taskType: 'review',
      assignedModel: reviewerModel,
      startedAt: new Date().toISOString(),
      timeoutMs: 120000,
      priority: 'normal',
    },
  }

  // Call reviewer
  let reviewResponse: ModelResponse
  if (reviewerModel === 'claude') {
    reviewResponse = await callClaude(reviewTask)
  } else if (reviewerModel === 'gpt5.4o') {
    reviewResponse = await callGPT(reviewTask)
  } else {
    throw new Error(`Unsupported reviewer model: ${reviewerModel}`)
  }

  // Parse review
  const reviewResult = parseReviewResponse(reviewResponse.output)

  return {
    reviewResult,
    tokensUsed: reviewResponse.tokensUsed,
  }
}

// ─── ReviewLog persistence ─────────────────────────────────────────────────────

/**
 * Persist a review to the ReviewLog collection.
 */
async function persistReviewLog(
  projectId: string,
  sessionId: string,
  reviewingModel: ModelRole,
  authorModel: ModelRole,
  taskType: import('@/lib/types').TaskType,
  reviewResult: ReviewResult,
  tokensUsed: TokenUsage,
): Promise<void> {
  await ReviewLog.create({
    id: uuidv4(),
    projectId,
    sessionId,
    reviewingModel,
    authorModel,
    taskType,
    inputSummary: 'Review task',
    outputSummary: reviewResult.summary,
    outcome: reviewResult.approved ? 'approved' : 'rejected',
    flaggedIssues: reviewResult.flaggedIssues,
    confidence: reviewResult.confidence,
    arbitrationRequired: reviewResult.requiresArbitration,
    tokensUsed: {
      promptTokens: tokensUsed.promptTokens,
      completionTokens: tokensUsed.completionTokens,
      totalTokens: tokensUsed.totalTokens,
      estimatedCostUsd: tokensUsed.estimatedCostUsd,
    },
    durationMs: 0, // Populated by caller if needed
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

// ─── Batch review pipeline ─────────────────────────────────────────────────────

export interface PipelineResult {
  /** Final outputs (with patches applied where appropriate). */
  finalOutputs: Map<string, string> // taskId → output
  /** Whether any task needs escalation to arbitration. */
  needsArbitration: boolean
  /** Tasks that need arbitration. */
  arbitrationTasks: string[] // taskIds
  /** Total tokens used across all reviews. */
  totalReviewTokens: number
  /** Individual review results keyed by task ID. */
  reviews: Map<string, ReviewResult>
}

/**
 * Run the review pipeline for a batch of model responses.
 *
 * This is the main export. It:
 * 1. Routes each response to the appropriate reviewer
 * 2. Executes reviews in parallel
 * 3. Applies patches if approved with high confidence
 * 4. Escalates to arbitration if needed
 * 5. Persists reviews to ReviewLog
 * 6. Returns batch result with final outputs
 *
 * @param tasks - Original tasks that were executed
 * @param responses - Model responses to review
 * @param projectState - Current project state
 * @param sessionId - Session ID for logging
 * @returns PipelineResult with final outputs and arbitration flags
 */
export async function runReviewPipeline(
  tasks: OrchestratorTask[],
  responses: ModelResponse[],
  projectState: ProjectState,
  sessionId: string,
): Promise<PipelineResult> {
  const finalOutputs = new Map<string, string>()
  const reviews = new Map<string, ReviewResult>()
  const arbitrationTasks: string[] = []
  let totalReviewTokens = 0

  // Build task lookup
  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  // Process each response
  for (const response of responses) {
    const task = taskMap.get(response.taskId)
    if (!task) {
      console.warn(`[Review] Task ${response.taskId} not found, skipping review`)
      finalOutputs.set(response.taskId, response.output)
      continue
    }

    // Check if this task should be reviewed
    if (!shouldReview(response.taskType)) {
      finalOutputs.set(response.taskId, response.output)
      continue
    }

    // Get reviewer
    const reviewerModel = getReviewer(response.model)
    if (!reviewerModel) {
      // No reviewer configured for this model
      finalOutputs.set(response.taskId, response.output)
      continue
    }

    try {
      // Execute review
      const { reviewResult, tokensUsed } = await executeReview(
        task,
        response,
        reviewerModel,
        projectState,
      )

      totalReviewTokens += tokensUsed.totalTokens
      reviews.set(response.taskId, reviewResult)

      // Persist review log
      await persistReviewLog(
        task.projectId,
        sessionId,
        reviewerModel,
        response.model,
        response.taskType,
        reviewResult,
        tokensUsed,
      )

      // Determine final output
      let finalOutput = response.output

      if (!reviewResult.approved) {
        // Check for patch with high confidence
        if (reviewResult.patch && reviewResult.confidence >= 0.7) {
          // Apply patch
          finalOutput = reviewResult.patch
        }

        // Check for arbitration flag
        if (reviewResult.requiresArbitration || reviewResult.confidence < 0.5) {
          arbitrationTasks.push(response.taskId)
        }
      }

      finalOutputs.set(response.taskId, finalOutput)
    } catch (error) {
      // If review fails, use original output and log warning
      console.error(`[Review] Failed to review task ${response.taskId}:`, error)
      finalOutputs.set(response.taskId, response.output)

      // Create a failed review result
      reviews.set(response.taskId, {
        approved: false,
        confidence: 0,
        summary: `Review failed: ${error instanceof Error ? error.message : String(error)}`,
        flaggedIssues: [],
        requiresArbitration: false,
      })
    }
  }

  return {
    finalOutputs,
    needsArbitration: arbitrationTasks.length > 0,
    arbitrationTasks,
    totalReviewTokens,
    reviews,
  }
}

/**
 * Get a summary of review results for logging/debugging.
 */
export function getReviewSummary(result: PipelineResult): string {
  const total = result.reviews.size
  const approved = Array.from(result.reviews.values()).filter((r) => r.approved).length
  const rejected = total - approved

  let summary = `Review Summary: ${approved}/${total} approved, ${rejected} rejected`
  if (result.needsArbitration) {
    summary += `, ${result.arbitrationTasks.length} need arbitration`
  }
  summary += `, ${result.totalReviewTokens} tokens used`

  return summary
}
