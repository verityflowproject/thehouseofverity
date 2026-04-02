/**
 * lib/orchestrator/model-assignment.ts — Model routing table
 *
 * Maps each TaskType to:
 * - Primary model (executes the task)
 * - Optional reviewer model (critiques the output)
 * - Research flag (whether to prepend a Perplexity research task)
 *
 * Also provides smart routing that downscales to cheaper models for
 * simple tasks, preserving credits and reducing cost while maintaining
 * output quality.
 *
 * No LLM calls — pure configuration.
 */

import type { TaskType, ModelRole } from '@/lib/types'
import type { TaskComplexity } from '@/lib/credit-costs'

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

// ─── Smart routing table ──────────────────────────────────────────────────────

/**
 * Smart routing table that maps (TaskType, complexity) → ModelAssignment.
 *
 * Simple tasks route to cheaper/faster models (Gemini Flash) to reduce
 * credit cost. Complex tasks keep premium model assignments.
 *
 * Cost savings on simple tasks:
 *   - Gemini Flash: $0.0001 input / $0.0004 output per token
 *   - vs Claude:    $0.003  input / $0.015  output per token (~30x cheaper)
 */
export const SMART_ROUTING_TABLE: Record<TaskType, Record<TaskComplexity, ModelAssignment>> = {
  architecture: {
    simple:  { primary: 'gemini',    reviewer: undefined,  needsResearch: false },
    complex: { primary: 'claude',    reviewer: 'gpt5.4o',  needsResearch: false },
  },
  implementation: {
    simple:  { primary: 'gemini',    reviewer: undefined,  needsResearch: false },
    complex: { primary: 'codestral', reviewer: 'gpt5.4o',  needsResearch: true  },
  },
  refactor: {
    simple:  { primary: 'gemini',    reviewer: undefined,  needsResearch: false },
    complex: { primary: 'gemini',    reviewer: 'claude',   needsResearch: false },
  },
  review: {
    simple:  { primary: 'gemini',    reviewer: undefined,  needsResearch: false },
    complex: { primary: 'gpt5.4o',   reviewer: undefined,  needsResearch: false },
  },
  research: {
    simple:  { primary: 'perplexity', reviewer: undefined, needsResearch: false },
    complex: { primary: 'perplexity', reviewer: undefined, needsResearch: false },
  },
  arbitration: {
    simple:  { primary: 'claude',    reviewer: undefined,  needsResearch: false },
    complex: { primary: 'claude',    reviewer: undefined,  needsResearch: false },
  },
} as const

/**
 * Get the cost-optimized model assignment for a given task type and complexity.
 *
 * Routes simple tasks to cheaper models while preserving premium models for
 * complex tasks that genuinely require them.
 *
 * @param taskType - The classified task type
 * @param complexity - Task complexity ('simple' | 'complex')
 * @returns ModelAssignment optimized for cost and quality
 *
 * @example
 *   const assignment = getSmartModelAssignment('implementation', 'simple')
 *   // → { primary: 'gemini', reviewer: undefined, needsResearch: false }
 *
 *   const assignment = getSmartModelAssignment('implementation', 'complex')
 *   // → { primary: 'codestral', reviewer: 'gpt5.4o', needsResearch: true }
 */
export function getSmartModelAssignment(
  taskType: TaskType,
  complexity: TaskComplexity,
): ModelAssignment {
  return SMART_ROUTING_TABLE[taskType][complexity]
}
