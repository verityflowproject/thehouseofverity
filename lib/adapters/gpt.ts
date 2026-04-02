/**
 * lib/adapters/gpt.ts — GPT-5.4 adapter
 *
 * Uses OpenAI's Chat Completions API (client.chat.completions.create).
 * Task-specific system prompts for implementation and review tasks.
 * Parses JSON output for review tasks to extract flagged issues.
 */

import OpenAI from 'openai'
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

function getClient(): OpenAI {
  const { apiKey } = resolveCredentials('gpt5.4o')
  return new OpenAI({ apiKey: apiKey || 'missing-key' })
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gpt-5-turbo' as const
const MAX_TOKENS = 8192
const TEMPERATURE = 0.7

// Pricing (as of 2025, in USD per 1M tokens)
const PRICING = {
  input:  5.0 / 1_000_000,
  output: 15.0 / 1_000_000,
}

// ─── System prompts ───────────────────────────────────────────────────────────

function buildSystemPrompt(taskType: string): string {
  switch (taskType) {
    case 'implementation':
      return `You are GPT-5.4, an implementation specialist for the VerityFlow multi-model coding platform.

Your role:
- Write production-ready code that follows project conventions
- Implement features completely — no placeholder TODOs unless truly necessary
- Include proper error handling, validation, and edge case coverage
- Write clear, self-documenting code with strategic comments
- Ensure type safety and leverage TypeScript's strict mode

Output format:
- Provide complete file contents or clear diffs
- Include import statements and exports
- Add brief explanatory comments for complex logic
- Note any assumptions or dependencies

Use the project context to match existing patterns and conventions.`

    case 'review':
      return `You are GPT-5.4, a code reviewer for the VerityFlow platform.

Your role:
- Review code for correctness, maintainability, and adherence to conventions
- Identify bugs, security issues, and performance problems
- Verify TypeScript types are used correctly
- Check for proper error handling
- Flag breaking changes or API inconsistencies

Output format (JSON):
{
  "approved": true/false,
  "confidence": 0.0-1.0,
  "summary": "Overall assessment",
  "flaggedIssues": [
    {
      "severity": "error" | "warning" | "info",
      "code": "ISSUE_CODE",
      "message": "Description",
      "file": "path/to/file.ts",
      "line": 42,
      "suggestion": "How to fix"
    }
  ]
}

Be constructive and specific in your feedback.`

    default:
      return `You are GPT-5.4, a senior AI coding assistant working within the VerityFlow multi-model platform.

Your role:
- Execute tasks with precision and attention to detail
- Follow project conventions and architecture
- Provide complete, production-ready solutions
- Ask for clarification when requirements are ambiguous
- Self-report uncertainties or assumptions

Always consider the project context and integrate seamlessly with existing code.`
  }
}

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Call GPT-5.4 with retry logic.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse with GPT's output and metadata
 */
export async function callGPT(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await withRetry(
      () => executeGPT(task),
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
      `GPT adapter failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      {
        model: 'gpt5.4o',
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
 * Internal: Execute a single GPT API call
 */
async function executeGPT(task: OrchestratorTask): Promise<ModelResponse> {
  const startTime = Date.now()

  // Build system prompt based on task type
  const systemPrompt = task.systemPrompt ?? buildSystemPrompt(task.taskType)

  // Build user message with context
  const contextJson = JSON.stringify(task.contextSlice.projectState, null, 2)
  const userMessage = `${task.prompt}\n\n### Project Context\n\`\`\`json\n${contextJson}\n\`\`\``

  // Resolve platform credentials and call OpenAI API
  const openai = getClient()
  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const latencyMs = Date.now() - startTime

  // Extract text output
  const output = response.choices[0]?.message?.content ?? ''

  // Token usage
  const tokensUsed: TokenUsage = {
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
    estimatedCostUsd:
      (response.usage?.prompt_tokens ?? 0) * PRICING.input +
      (response.usage?.completion_tokens ?? 0) * PRICING.output,
  }

  // Parse flagged issues if this is a review task
  const flaggedIssues: FlaggedIssue[] = []
  let confidenceScore = 0.8 // Default confidence
  let requestsCouncil = false
  let councilReason: string | undefined

  if (task.taskType === 'review') {
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
    model: 'gpt5.4o',
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
