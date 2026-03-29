/**
 * lib/orchestrator/index.ts — Orchestrator barrel export
 *
 * Central export for all orchestrator modules.
 */

// Task classification
export { classifyTask, getTaskScores } from './task-classifier'

// Model assignment
export {
  getModelAssignment,
  requiresResearch,
  MODEL_ASSIGNMENT_TABLE,
} from './model-assignment'
export type { ModelAssignment } from './model-assignment'

// Hallucination detection
export {
  detectHallucinationTriggers,
  extractExternalReferences,
} from './hallucination-detector'

// Queue builder (main export)
export {
  buildTaskQueue,
  buildSingleTask,
} from './queue-builder'
export type { BuildQueueOptions } from './queue-builder'
