/**
 * lib/adapters/perplexity.ts — Perplexity Sonar-Pro adapter
 *
 * Uses raw fetch to call the Perplexity API.
 * Specialized for package verification and dependency validation.
 * Returns structured JSON with verified, warnings, and unverified arrays.
 */

import { v4 as uuidv4 } from 'uuid'

import { withRetry } from '@/lib/utils/retry'
import { ModelAdapterError } from '@/lib/utils/errors'
import { estimateTokens } from '@/lib/utils/token-counter'
import type {
  OrchestratorTask,
  ModelResponse,
  FlaggedIssue,
  TokenUsage,
} from '@/lib/types'

// ─── Env guard ────────────────────────────────────────────────────────────────

if (!process.env.PERPLEXITY_API_KEY) {
  console.warn('[VerityFlow] PERPLEXITY_API_KEY not set — Perplexity adapter will fail at runtime')
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'sonar-pro' as const
const API_URL = 'https://api.perplexity.ai/chat/completions'
const MAX_TOKENS = 4096
const TEMPERATURE = 0.3

// Pricing (as of 2025, in USD per 1M tokens)
const PRICING = {
  input:  3.0 / 1_000_000,
  output: 15.0 / 1_000_000,
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Perplexity Sonar-Pro, the package verification specialist for the VerityFlow multi-model platform.

Your role:
- Verify NPM package names, versions, and compatibility
- Check for known security vulnerabilities
- Identify deprecated packages or breaking changes
- Validate peer dependencies and version conflicts
- Research current best practices and recommendations

Output format (strict JSON):
{
  "verified": [
    {
      "package": "package-name",
      "version": "x.y.z",
      "notes": "Why this version is recommended"
    }
  ],
  "warnings": [
    {
      "package": "package-name",
      "issue": "Description of the concern"
    }
  ],
  "unverified": [
    {
      "package": "package-name",
      "reason": "Why verification failed"
    }
  ]
}

Be thorough and current. Always check the latest package registries and security databases.`

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Call Perplexity Sonar-Pro with retry logic.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse with Perplexity's output and metadata
 */
export async function callPerplexity(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await withRetry(
      () => executePerplexity(task),
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
      `Perplexity adapter failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      {
        model: 'perplexity',
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
 * Internal: Execute a single Perplexity API call
 */
async function executePerplexity(task: OrchestratorTask): Promise<ModelResponse> {
  const startTime = Date.now()

  // Build user message with context
  const contextJson = JSON.stringify(task.contextSlice.projectState, null, 2)
  const userMessage = `${task.prompt}\n\n### Project Context\n\`\`\`json\n${contextJson}\n\`\`\``

  // Call Perplexity API
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      max_tokens: MAX_TOKENS,
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
    }),
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
    usage?: {
      prompt_tokens?: number
      completion_tokens?: number
      total_tokens?: number
    }
  }

  const latencyMs = Date.now() - startTime

  // Extract text output
  const output = data.choices[0]?.message?.content ?? ''

  // Token usage
  const promptTokens = data.usage?.prompt_tokens ?? estimateTokens(userMessage)
  const completionTokens = data.usage?.completion_tokens ?? estimateTokens(output)

  const tokensUsed: TokenUsage = {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimatedCostUsd: promptTokens * PRICING.input + completionTokens * PRICING.output,
  }

  // Parse the JSON output and populate flagged issues
  const flaggedIssues: FlaggedIssue[] = []
  let confidenceScore = 0.9 // Perplexity is good at verification

  try {
    const parsed = JSON.parse(output) as {
      verified?: Array<{ package: string; version: string; notes: string }>
      warnings?: Array<{ package: string; issue: string }>
      unverified?: Array<{ package: string; reason: string }>
      confidence?: number
    }

    // Convert warnings to flagged issues
    if (parsed.warnings && Array.isArray(parsed.warnings)) {
      for (const warning of parsed.warnings) {
        flaggedIssues.push({
          severity: 'warning',
          code: 'PKG_WARNING',
          message: `${warning.package}: ${warning.issue}`,
          autoFixed: false,
        })
      }
    }

    // Convert unverified to flagged issues
    if (parsed.unverified && Array.isArray(parsed.unverified)) {
      for (const item of parsed.unverified) {
        flaggedIssues.push({
          severity: 'error',
          code: 'PKG_UNVERIFIED',
          message: `${item.package}: ${item.reason}`,
          autoFixed: false,
        })
      }
    }

    if (parsed.confidence !== undefined) {
      confidenceScore = Math.max(0, Math.min(1, parsed.confidence))
    }
  } catch {
    // Output is not valid JSON — treat as plain text
  }

  return {
    id: uuidv4(),
    taskId: task.id,
    projectId: task.projectId,
    model: 'perplexity',
    taskType: task.taskType,
    output,
    confidenceScore,
    flaggedIssues,
    tokensUsed,
    latencyMs,
    timestamp: new Date().toISOString(),
    projectStateUpdate: {},
    newOpenQuestions: [],
    requestsCouncil: false,
  }
}
