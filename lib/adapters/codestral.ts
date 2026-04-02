/**
 * lib/adapters/codestral.ts — Codestral adapter
 *
 * Uses the Mistral SDK to call Codestral with low temperature (0.2)
 * for deterministic code generation. Emphasizes convention-following
 * and never inventing library methods.
 */

import { Mistral } from '@mistralai/mistralai'
import { v4 as uuidv4 } from 'uuid'

import { withRetry } from '@/lib/utils/retry'
import { ModelAdapterError } from '@/lib/utils/errors'
import { resolveCredentials } from './credentials'
import type {
  OrchestratorTask,
  ModelResponse,
  TokenUsage,
} from '@/lib/types'

// ─── Client factory ───────────────────────────────────────────────────────────

function getClient(): Mistral {
  const { apiKey } = resolveCredentials('codestral')
  return new Mistral({ apiKey: apiKey || 'missing-key' })
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'codestral-latest' as const
const MAX_TOKENS = 8192
const TEMPERATURE = 0.2 // Low temperature for deterministic code generation

// Pricing (as of 2025, in USD per 1M tokens)
const PRICING = {
  input:  1.0 / 1_000_000,
  output: 3.0 / 1_000_000,
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Codestral, a specialized code generation model optimized for production-quality implementation.

Core principles:
- **Follow conventions from context**: Match naming, patterns, and structure exactly
- **Never invent library methods**: Only use documented APIs from installed packages
- **Leave TODO comments**: For APIs or integrations you cannot verify
- **Deterministic output**: Prefer explicit, predictable code over clever abstractions
- **Type safety**: Leverage TypeScript's strict mode fully
- **Complete implementations**: No partial solutions or placeholders unless truly uncertain

Output format:
- Provide complete, ready-to-use code
- Include all necessary imports
- Add TODO comments for unverifiable external APIs
- Keep implementations straightforward and maintainable

Use the project context to ensure consistency with existing codebase.`

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Call Codestral with retry logic.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse with Codestral's output and metadata
 */
export async function callCodestral(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await withRetry(
      () => executeCodestral(task),
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
      `Codestral adapter failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      {
        model: 'codestral',
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
 * Internal: Execute a single Codestral API call
 */
async function executeCodestral(task: OrchestratorTask): Promise<ModelResponse> {
  const startTime = Date.now()

  // Build user message with context
  const contextJson = JSON.stringify(task.contextSlice.projectState, null, 2)
  const userMessage = `${task.prompt}\n\n<project_context>\n${contextJson}\n</project_context>`

  // Resolve platform credentials and call Mistral API
  const mistral = getClient()
  const response = await mistral.chat.complete({
    model: MODEL_NAME,
    maxTokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [
      {
        role: 'system',
        content: task.systemPrompt ?? SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const latencyMs = Date.now() - startTime

  // Extract text output - handle both string and ContentChunk[] types
  const rawOutput = response.choices?.[0]?.message?.content
  const output = typeof rawOutput === 'string' ? rawOutput : ''

  // Token usage
  const tokensUsed: TokenUsage = {
    promptTokens: response.usage?.promptTokens ?? 0,
    completionTokens: response.usage?.completionTokens ?? 0,
    totalTokens: (response.usage?.promptTokens ?? 0) + (response.usage?.completionTokens ?? 0),
    estimatedCostUsd:
      (response.usage?.promptTokens ?? 0) * PRICING.input +
      (response.usage?.completionTokens ?? 0) * PRICING.output,
  }

  return {
    id: uuidv4(),
    taskId: task.id,
    projectId: task.projectId,
    model: 'codestral',
    taskType: task.taskType,
    output,
    confidenceScore: 0.85, // Codestral is deterministic, so higher default confidence
    flaggedIssues: [],
    tokensUsed,
    latencyMs,
    timestamp: new Date().toISOString(),
    projectStateUpdate: {},
    newOpenQuestions: [],
    requestsCouncil: false,
  }
}
