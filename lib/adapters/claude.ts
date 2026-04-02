/**
 * lib/adapters/claude.ts — Claude Opus 4.6 adapter
 *
 * Uses the Anthropic SDK to call Claude with task-specific system prompts.
 * Supports architecture, arbitration, and review task types with
 * specialized instructions for each.
 */

import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'

import { withRetry } from '@/lib/utils/retry'
import { ModelAdapterError } from '@/lib/utils/errors'
import { resolveCredentials } from './credentials'
import type {
  OrchestratorTask,
  ModelResponse,
  FlaggedIssue,
  TokenUsage,
} from '@/lib/types'

// ─── Client factory ───────────────────────────────────────────────────────────

function getClient(): Anthropic {
  const { apiKey } = resolveCredentials('claude')
  return new Anthropic({ apiKey: apiKey || 'missing-key' })
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'claude-opus-4-20250514' as const
const MAX_TOKENS = 8192
const TEMPERATURE = 0.7

// Pricing (as of 2025, in USD per 1M tokens)
const PRICING = {
  input:  15.0 / 1_000_000,
  output: 75.0 / 1_000_000,
}

// ─── System prompts ───────────────────────────────────────────────────────────

function buildSystemPrompt(taskType: string): string {
  switch (taskType) {
    case 'architecture':
      return `You are Claude Opus 4.6, the architectural decision maker for the VerityFlow multi-model coding platform.

Your role:
- Make opinionated architectural decisions quickly and clearly
- Prefer proven patterns over experimental approaches
- Consider scalability, maintainability, and team velocity
- Document decisions in ADR format when significant
- Be explicit about trade-offs you're accepting

Output format:
- Start with a clear decision statement
- Follow with structured reasoning
- End with concrete next steps or implementation guidance
- Flag any assumptions that need validation

You have access to the full project context. Use it to ensure consistency with existing architecture.`

    case 'arbitration':
      return `You are Claude Opus 4.6, the arbitrator for council sessions in VerityFlow.

Your role:
- Synthesize multiple model perspectives into a single coherent decision
- Identify points of agreement and reconcile disagreements
- Make tie-breaking calls when models are split
- Ensure the final decision is actionable and clear

Output format (JSON):
{
  "decision": "Clear statement of the consensus decision",
  "confidence": 0.0-1.0,
  "reasoning": "Detailed explanation of how you synthesized the votes",
  "dissents": ["List any significant dissenting views that were overruled"],
  "actionItems": ["Concrete next steps"]
}

Be fair but decisive. The team needs a clear path forward.`

    case 'review':
      return `You are Claude Opus 4.6, a code reviewer for the VerityFlow platform.

Your role:
- Review code for correctness, security, performance, and maintainability
- Catch deviations from project conventions and architecture
- Flag breaking changes to existing APIs
- Identify incomplete error handling
- Verify that external dependencies are used correctly

Output format (JSON):
{
  "approved": true/false,
  "confidence": 0.0-1.0,
  "summary": "Brief overall assessment",
  "flaggedIssues": [
    {
      "severity": "error" | "warning" | "info",
      "code": "SHORT_CODE",
      "message": "Description of the issue",
      "file": "path/to/file.ts",
      "line": 42,
      "suggestion": "How to fix it"
    }
  ],
  "positives": ["Things done well"]
}

Be thorough but pragmatic. Focus on issues that matter.`

    default:
      return `You are Claude Opus 4.6, a senior AI coding assistant working within the VerityFlow multi-model platform.

Your role:
- Execute coding tasks with high quality and attention to detail
- Follow project conventions strictly
- Ask clarifying questions when requirements are ambiguous
- Self-report any uncertainties or assumptions
- Provide complete, production-ready code

Always consider the project context provided and ensure your output integrates seamlessly with existing code.`
  }
}

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Call Claude Opus 4.6 with retry logic.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse with Claude's output and metadata
 */
export async function callClaude(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await withRetry(
      () => executeClaude(task),
      {
        maxAttempts: task.maxRetries,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitter: true,
      },
    )

    return response.value
  } catch (error) {
    const latencyMs = Date.now() - startTime

    throw new ModelAdapterError(
      `Claude adapter failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      {
        model: 'claude',
        retryable: false,
        details: {
          taskId: task.id,
          projectId: task.projectId,
          latencyMs,
        },
      },
    )
  }
}

/**
 * Internal: Execute a single Claude API call
 */
async function executeClaude(task: OrchestratorTask): Promise<ModelResponse> {
  const startTime = Date.now()

  // Build system prompt based on task type
  const systemPrompt = task.systemPrompt ?? buildSystemPrompt(task.taskType)

  // Build user message with context
  const contextJson = JSON.stringify(task.contextSlice.projectState, null, 2)
  const userMessage = `${task.prompt}\n\n<project_context>\n${contextJson}\n</project_context>`

  // Resolve platform credentials and call Anthropic API
  const client = getClient()
  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const latencyMs = Date.now() - startTime

  // Extract text output
  const output = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('\n')

  // Token usage
  const tokensUsed: TokenUsage = {
    promptTokens: response.usage.input_tokens,
    completionTokens: response.usage.output_tokens,
    totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    estimatedCostUsd:
      response.usage.input_tokens * PRICING.input +
      response.usage.output_tokens * PRICING.output,
  }

  // Parse flagged issues if this is a review task
  const flaggedIssues: FlaggedIssue[] = []
  let confidenceScore = 0.8 // Default confidence
  let requestsCouncil = false
  let councilReason: string | undefined

  if (task.taskType === 'review' || task.taskType === 'arbitration') {
    try {
      const parsed = JSON.parse(output)
      if (parsed.confidence !== undefined) {
        confidenceScore = Math.max(0, Math.min(1, parsed.confidence))
      }
      if (parsed.flaggedIssues && Array.isArray(parsed.flaggedIssues)) {
        flaggedIssues.push(...parsed.flaggedIssues)
      }
      if (parsed.requestsCouncil) {
        requestsCouncil = true
        councilReason = parsed.councilReason
      }
    } catch {
      // Output is not JSON — treat as plain text
    }
  }

  return {
    id: uuidv4(),
    taskId: task.id,
    projectId: task.projectId,
    model: 'claude',
    taskType: task.taskType,
    output,
    confidenceScore,
    flaggedIssues,
    tokensUsed,
    latencyMs,
    timestamp: new Date().toISOString(),
    projectStateUpdate: {},
    newOpenQuestions: [],
    requestsCouncil,
    councilReason,
  }
}
