/**
 * lib/orchestrator/task-classifier.ts — Task type classification
 *
 * Analyzes a user prompt using regex patterns and keyword scoring
 * to determine the most likely TaskType.
 *
 * No LLM calls — pure pattern matching logic.
 */

import type { TaskType } from '@/lib/types'

// ─── Keyword patterns for each task type ────────────────────────────────────────

/**
 * Keyword sets for each TaskType.
 * Each keyword has an associated weight (higher = stronger signal).
 */
interface KeywordPattern {
  keywords: Array<{ term: string | RegExp; weight: number }>
}

const TASK_PATTERNS: Record<TaskType, KeywordPattern> = {
  architecture: {
    keywords: [
      { term: /\barchitecture\b/i, weight: 10 },
      { term: /\bdesign\b/i, weight: 8 },
      { term: /\bstructure\b/i, weight: 7 },
      { term: /\bpattern\b/i, weight: 6 },
      { term: /\bschema\b/i, weight: 7 },
      { term: /\bdata model\b/i, weight: 8 },
      { term: /\bapi design\b/i, weight: 9 },
      { term: /\broute\b/i, weight: 5 },
      { term: /\bendpoint\b/i, weight: 5 },
      { term: /\bfile tree\b/i, weight: 7 },
      { term: /\borganize\b/i, weight: 5 },
      { term: /\bsetup\b/i, weight: 4 },
      { term: /\bchoose\b/i, weight: 4 },
      { term: /\bselect\b/i, weight: 4 },
      { term: /\bdecide\b/i, weight: 6 },
      { term: /\bshould (i|we) use\b/i, weight: 7 },
    ],
  },

  implementation: {
    keywords: [
      { term: /\bimplement\b/i, weight: 10 },
      { term: /\bcreate\b/i, weight: 8 },
      { term: /\bbuild\b/i, weight: 8 },
      { term: /\bwrite\b/i, weight: 7 },
      { term: /\badd\b/i, weight: 6 },
      { term: /\bcode\b/i, weight: 6 },
      { term: /\bfunction\b/i, weight: 5 },
      { term: /\bcomponent\b/i, weight: 6 },
      { term: /\bfeature\b/i, weight: 7 },
      { term: /\bAPI\b/, weight: 5 },
      { term: /\bhandler\b/i, weight: 5 },
      { term: /\butil\b/i, weight: 4 },
      { term: /\bhelper\b/i, weight: 4 },
      { term: /\bmake\b/i, weight: 5 },
    ],
  },

  research: {
    keywords: [
      { term: /\bresearch\b/i, weight: 10 },
      { term: /\bverify\b/i, weight: 8 },
      { term: /\bcheck\b/i, weight: 6 },
      { term: /\bvalidate\b/i, weight: 7 },
      { term: /\blook up\b/i, weight: 8 },
      { term: /\bfind out\b/i, weight: 8 },
      { term: /\bwhat (is|are)\b/i, weight: 6 },
      { term: /\bhow (does|do)\b/i, weight: 5 },
      { term: /\bpackage\b/i, weight: 6 },
      { term: /\blibrary\b/i, weight: 6 },
      { term: /\bversion\b/i, weight: 7 },
      { term: /\bcompatible\b/i, weight: 7 },
      { term: /\bdocumentation\b/i, weight: 6 },
    ],
  },

  refactor: {
    keywords: [
      { term: /\brefactor\b/i, weight: 10 },
      { term: /\bimprove\b/i, weight: 7 },
      { term: /\boptimize\b/i, weight: 8 },
      { term: /\bclean up\b/i, weight: 8 },
      { term: /\breorganize\b/i, weight: 8 },
      { term: /\brewrite\b/i, weight: 6 },
      { term: /\bsimplify\b/i, weight: 7 },
      { term: /\bconsolidate\b/i, weight: 7 },
      { term: /\bextract\b/i, weight: 6 },
      { term: /\bmodularize\b/i, weight: 8 },
      { term: /\bDRY\b/, weight: 7 },
      { term: /\bduplication\b/i, weight: 6 },
    ],
  },

  review: {
    keywords: [
      { term: /\breview\b/i, weight: 10 },
      { term: /\bcheck\b/i, weight: 6 },
      { term: /\binspect\b/i, weight: 8 },
      { term: /\baudit\b/i, weight: 8 },
      { term: /\bvalidate\b/i, weight: 7 },
      { term: /\btest\b/i, weight: 5 },
      { term: /\bfind (bugs|issues|problems)\b/i, weight: 7 },
      { term: /\bquality\b/i, weight: 6 },
      { term: /\blint\b/i, weight: 5 },
    ],
  },

  arbitration: {
    keywords: [
      { term: /\barbitrat\b/i, weight: 10 },
      { term: /\bresolve conflict\b/i, weight: 9 },
      { term: /\btie.?break\b/i, weight: 9 },
      { term: /\bdisagree\b/i, weight: 7 },
      { term: /\bconsensus\b/i, weight: 8 },
      { term: /\bsynthesize\b/i, weight: 7 },
      { term: /\bvote\b/i, weight: 6 },
    ],
  },
}

// ─── Scoring function ────────────────────────────────────────────────────────────

/**
 * Score a prompt against a specific task type's keyword patterns.
 *
 * @param prompt - The user's input prompt
 * @param taskType - The task type to score against
 * @returns Numerical score (higher = better match)
 */
function scorePromptForTaskType(prompt: string, taskType: TaskType): number {
  const pattern = TASK_PATTERNS[taskType]
  let score = 0

  for (const { term, weight } of pattern.keywords) {
    if (typeof term === 'string') {
      // Simple substring match (case-insensitive)
      if (prompt.toLowerCase().includes(term.toLowerCase())) {
        score += weight
      }
    } else {
      // RegExp match
      if (term.test(prompt)) {
        score += weight
      }
    }
  }

  return score
}

// ─── Main classifier ──────────────────────────────────────────────────────────────

/**
 * Classify a user prompt into the most likely TaskType.
 *
 * Uses keyword scoring with weighted patterns. Returns 'implementation'
 * as the default when no strong signal exists.
 *
 * @param prompt - The user's input prompt
 * @returns The classified TaskType
 *
 * @example
 *   classifyTask('Design the database schema') // → 'architecture'
 *   classifyTask('Implement user authentication') // → 'implementation'
 *   classifyTask('Refactor the auth module') // → 'refactor'
 */
export function classifyTask(prompt: string): TaskType {
  const scores: Record<TaskType, number> = {
    architecture: scorePromptForTaskType(prompt, 'architecture'),
    implementation: scorePromptForTaskType(prompt, 'implementation'),
    research: scorePromptForTaskType(prompt, 'research'),
    refactor: scorePromptForTaskType(prompt, 'refactor'),
    review: scorePromptForTaskType(prompt, 'review'),
    arbitration: scorePromptForTaskType(prompt, 'arbitration'),
  }

  // Find the task type with the highest score
  let maxScore = 0
  let bestMatch: TaskType = 'implementation' // default

  for (const [taskType, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestMatch = taskType as TaskType
    }
  }

  // If no keywords matched (score = 0), default to implementation
  if (maxScore === 0) {
    return 'implementation'
  }

  return bestMatch
}

/**
 * Get detailed scoring breakdown for debugging/logging.
 *
 * @param prompt - The user's input prompt
 * @returns Object with scores for each task type
 */
export function getTaskScores(prompt: string): Record<TaskType, number> {
  return {
    architecture: scorePromptForTaskType(prompt, 'architecture'),
    implementation: scorePromptForTaskType(prompt, 'implementation'),
    research: scorePromptForTaskType(prompt, 'research'),
    refactor: scorePromptForTaskType(prompt, 'refactor'),
    review: scorePromptForTaskType(prompt, 'review'),
    arbitration: scorePromptForTaskType(prompt, 'arbitration'),
  }
}
