/**
 * lib/orchestrator/model-assignment.ts — Model routing table
 *
 * Maps each TaskType to:
 * - Primary model (executes the task)
 * - Optional reviewer model (critiques the output)
 * - Research flag (whether to prepend a Perplexity research task)
 *
 * No LLM calls — pure configuration.
 */

import type { TaskType, ModelRole } from '@/lib/types'

// ─── Assignment configuration ─────────────────────────────────────────────────────

export interface ModelAssignment {
  /** The primary model that will execute this task. */
  readonly primary: ModelRole
  /** Optional reviewer model that will critique the primary's output. */
  readonly reviewer?: ModelRole
  /** Whether to prepend a Perplexity research task before the primary task. */
  readonly needsResearch: boolean
}

/**
 * Static routing table mapping TaskTypes to model assignments.
 *
 * Rules:
 * - Implementation tasks → always require research
 * - Architecture → Claude (primary) + GPT (reviewer)
 * - Refactor → Gemini (primary) + Claude (reviewer)
 * - Research → Perplexity only (no reviewer)
 * - Review → GPT (primary, no reviewer by default)
 * - Arbitration → Claude only (no reviewer)
 */
export const MODEL_ASSIGNMENT_TABLE: Record<TaskType, ModelAssignment> = {
  architecture: {
    primary: 'claude',
    reviewer: 'gpt5.4o',
    needsResearch: false,
  },

  implementation: {
    primary: 'codestral',
    reviewer: 'gpt5.4o',
    needsResearch: true, // Always research for implementation
  },

  research: {
    primary: 'perplexity',
    reviewer: undefined,
    needsResearch: false, // Already a research task
  },

  refactor: {
    primary: 'gemini',
    reviewer: 'claude',
    needsResearch: false,
  },

  review: {
    primary: 'gpt5.4o',
    reviewer: undefined,
    needsResearch: false,
  },

  arbitration: {
    primary: 'claude',
    reviewer: undefined,
    needsResearch: false,
  },
}

/**
 * Get the model assignment for a given task type.
 *
 * @param taskType - The classified task type
 * @returns ModelAssignment with primary, reviewer, and research flag
 *
 * @example
 *   const assignment = getModelAssignment('implementation')
 *   // → { primary: 'codestral', reviewer: 'gpt5.4o', needsResearch: true }
 */
export function getModelAssignment(taskType: TaskType): ModelAssignment {
  return MODEL_ASSIGNMENT_TABLE[taskType]
}

/**
 * Check if a task type requires a research pre-check.
 *
 * @param taskType - The task type to check
 * @returns true if research is needed
 */
export function requiresResearch(taskType: TaskType): boolean {
  return MODEL_ASSIGNMENT_TABLE[taskType].needsResearch
}
