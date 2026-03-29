/**
 * lib/adapters/gemini.ts — Gemini 3.1 Pro Preview adapter
 *
 * Uses the Google Generative AI SDK.
 * Emphasizes full-codebase context awareness, naming convention
 * enforcement, and preventing drift from existing functionality.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { v4 as uuidv4 } from 'uuid'

import { withRetry } from '@/lib/utils/retry'
import { ModelAdapterError } from '@/lib/utils/errors'
import { estimateTokens } from '@/lib/utils/token-counter'
import type {
  OrchestratorTask,
  ModelResponse,
  TokenUsage,
} from '@/lib/types'

// ─── Env guard ────────────────────────────────────────────────────────────────

if (!process.env.GOOGLE_AI_API_KEY) {
  console.warn('[VerityFlow] GOOGLE_AI_API_KEY not set — Gemini adapter will fail at runtime')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? 'missing-key')

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.0-flash-exp' as const
const MAX_TOKENS = 8192
const TEMPERATURE = 0.7

// Pricing (as of 2025, in USD per 1M tokens)
const PRICING = {
  input:  0.0 / 1_000_000,  // Free tier for now
  output: 0.0 / 1_000_000,
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Gemini 3.1 Pro Preview, the full-codebase context specialist for the VerityFlow multi-model platform.

Your role:
- **Enforce naming conventions**: Catch violations of the project's naming standards
- **Prevent drift**: Ensure new code aligns with existing architecture and patterns
- **Never break existing functionality**: Cross-reference your changes against the full context
- **Holistic reasoning**: Consider the impact of changes across the entire codebase
- **Maintain consistency**: Use the same libraries, patterns, and styles as existing code

Key responsibilities:
- Verify that new code follows the conventions documented in project context
- Flag potential breaking changes to existing APIs or contracts
- Ensure imports and dependencies are consistent with package.json
- Catch naming inconsistencies (e.g., mixing camelCase and snake_case)
- Identify code that duplicates existing functionality

Output format:
- Provide complete, context-aware implementations
- Highlight any deviations from conventions (with justification)
- Note potential impacts on existing code
- Include proper TypeScript types that align with existing interfaces

You have access to the full project state. Use it to make informed decisions.`

// ─── Main adapter function ────────────────────────────────────────────────────

/**
 * Call Gemini 3.1 Pro Preview with retry logic.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse with Gemini's output and metadata
 */
export async function callGemini(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await withRetry(
      () => executeGemini(task),
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
      `Gemini adapter failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      {
        model: 'gemini',
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
 * Internal: Execute a single Gemini API call
 */
async function executeGemini(task: OrchestratorTask): Promise<ModelResponse> {
  const startTime = Date.now()

  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: task.systemPrompt ?? SYSTEM_PROMPT,
  })

  // Build user message with context
  const contextJson = JSON.stringify(task.contextSlice.projectState, null, 2)
  const userMessage = `${task.prompt}\n\n### Full Project Context\n\`\`\`json\n${contextJson}\n\`\`\``

  // Call Gemini API
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    },
  })

  const latencyMs = Date.now() - startTime

  // Extract text output
  const output = result.response.text()

  // Estimate token usage (Gemini doesn't always provide exact counts)
  const promptTokens = estimateTokens(userMessage)
  const completionTokens = estimateTokens(output)

  const tokensUsed: TokenUsage = {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimatedCostUsd: promptTokens * PRICING.input + completionTokens * PRICING.output,
  }

  return {
    id: uuidv4(),
    taskId: task.id,
    projectId: task.projectId,
    model: 'gemini',
    taskType: task.taskType,
    output,
    confidenceScore: 0.8,
    flaggedIssues: [],
    tokensUsed,
    latencyMs,
    timestamp: new Date().toISOString(),
    projectStateUpdate: {},
    newOpenQuestions: [],
    requestsCouncil: false,
  }
}
