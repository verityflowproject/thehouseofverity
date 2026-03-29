/**
 * lib/adapters/index.ts — Model adapter barrel export
 *
 * Central export point for all AI model adapters.
 * Each adapter takes an OrchestratorTask and returns a ModelResponse.
 */

export { callClaude } from './claude'
export { callGPT } from './gpt'
export { callCodestral } from './codestral'
export { callGemini } from './gemini'
export { callPerplexity } from './perplexity'

import type { OrchestratorTask, ModelResponse, ModelRole } from '@/lib/types'
import { callClaude } from './claude'
import { callGPT } from './gpt'
import { callCodestral } from './codestral'
import { callGemini } from './gemini'
import { callPerplexity } from './perplexity'
import { ModelAdapterError } from '@/lib/utils/errors'

/**
 * Route an OrchestratorTask to the appropriate model adapter.
 *
 * @param task - The orchestrator task to execute
 * @returns ModelResponse from the selected model
 * @throws ModelAdapterError if the model is not supported
 */
export async function routeToModel(
  task: OrchestratorTask,
): Promise<ModelResponse> {
  switch (task.model) {
    case 'claude':
      return callClaude(task)

    case 'gpt5.4o':
      return callGPT(task)

    case 'codestral':
      return callCodestral(task)

    case 'gemini':
      return callGemini(task)

    case 'perplexity':
      return callPerplexity(task)

    default:
      throw new ModelAdapterError(
        `Unsupported model: ${task.model}`,
        {
          model: task.model,
          retryable: false,
          details: {
            taskId: task.id,
            projectId: task.projectId,
          },
        },
      )
  }
}

/**
 * Check if a model adapter is available (API key configured).
 *
 * @param model - The model to check
 * @returns true if the model's API key is configured
 */
export function isModelAvailable(model: ModelRole): boolean {
  switch (model) {
    case 'claude':
      return !!process.env.ANTHROPIC_API_KEY

    case 'gpt5.4o':
      return !!process.env.OPENAI_API_KEY

    case 'codestral':
      return !!process.env.MISTRAL_API_KEY

    case 'gemini':
      return !!process.env.GOOGLE_AI_API_KEY

    case 'perplexity':
      return !!process.env.PERPLEXITY_API_KEY

    default:
      return false
  }
}
